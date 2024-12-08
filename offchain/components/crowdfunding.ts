import { koios } from "./koios";
import {
  applyParamsToScript,
  Constr,
  Data,
  fromText,
  keyHashToCredential,
  Lovelace,
  mintingPolicyToId,
  toUnit,
  TxSignBuilder,
  UTxO,
  Validator,
  validatorToAddress,
} from "@lucid-evolution/lucid";
import { network } from "@/config/lucid";
import { script } from "@/config/script";
import { STATE_TOKEN } from "@/config/crowdfunding";
import { WalletConnection } from "./contexts/wallet/WalletContext";
import { CampaignUTxO } from "./contexts/campaign/CampaignContext";
import { BackerDatum, CampaignActionRedeemer, CampaignDatum, CampaignState } from "@/types/crowdfunding";
import { adaToLovelace, handleSuccess } from "./utils";

async function submitTx(tx: TxSignBuilder) {
  const txSigned = await tx.sign.withWallet().complete();
  const txHash = await txSigned.submit();

  return txHash;
}

function getShortestUTxO(utxos: UTxO[]) {
  const bigint2str = (_: any, val: { toString: () => any }) => (typeof val === "bigint" ? val.toString() : val);

  let shortestUTxO = JSON.stringify(utxos[0], bigint2str).length;
  let utxo = utxos[0];
  for (let u = 1; u < utxos.length; u++) {
    const currLen = JSON.stringify(utxos[u], bigint2str).length;
    if (currLen < shortestUTxO) {
      shortestUTxO = currLen;
      utxo = utxos[u];
    }
  }

  return utxo;
}

export async function createCampaign(
  { lucid, wallet, address, pkh, stakeAddress, skh }: WalletConnection,
  campaign: { name: string; goal: Lovelace; deadline: bigint }
): Promise<CampaignUTxO> {
  if (!lucid) throw "Unitialized Lucid";
  if (!wallet) throw "Disconnected Wallet";

  const crowdfundingPlatform = localStorage.getItem("CrowdfundingPlatform");
  if (!crowdfundingPlatform) throw "Go to Admin page to set the Crowdfunding Platform Address first!";

  const platform = JSON.parse(crowdfundingPlatform); // Platform { address, pkh, stakeAddress, skh }
  const creator = { address, pkh, stakeAddress, skh };
  if (!creator.address && !creator.pkh && creator.stakeAddress && !creator.skh) throw "Unconnected Wallet";

  if (!lucid.wallet()) {
    const api = await wallet.enable();
    lucid.selectWallet.fromAPI(api);
  }

  const utxos = await lucid.wallet().getUtxos();
  if (!utxos || !utxos.length) throw "Empty Wallet";

  const nonceUTxO = getShortestUTxO(utxos);
  const nonceTxHash = String(nonceUTxO.txHash);
  const nonceTxIdx = BigInt(nonceUTxO.outputIndex);
  const nonceORef = new Constr(0, [nonceTxHash, nonceTxIdx]);

  const campaignValidator: Validator = {
    type: "PlutusV3",
    script: applyParamsToScript(script.Crowdfunding, [platform.pkh ?? "", creator.pkh ?? "", nonceORef]),
  };
  const campaignPolicy = mintingPolicyToId(campaignValidator);
  const campaignAddress = validatorToAddress(network, campaignValidator);

  const StateTokenUnit = toUnit(campaignPolicy, STATE_TOKEN.hex); // `${PolicyID}${AssetName}`
  const StateToken = { [StateTokenUnit]: 1n };

  //#region Temp CBOR Serialize/Deserializing
  const campaignDatum: CampaignDatum = {
    name: fromText(campaign.name),
    goal: campaign.goal,
    deadline: campaign.deadline,
    creator: [creator.pkh ?? "", creator.skh ?? ""],
    state: "Running",
  };
  const campaignDatumRedeemer = Data.to(campaignDatum, CampaignDatum);

  // Serializing to CBOR
  const creatorAddress = [creator.pkh ?? "", creator.skh ?? ""];
  const campaignState = CampaignState.Running.Constr;
  const campaignDatumFromConstr = new Constr(0, [fromText(campaign.name), BigInt(campaign.goal), BigInt(campaign.deadline), creatorAddress, campaignState]);
  const mintRedeemer = Data.to(campaignDatumFromConstr);
  console.log(mintRedeemer);

  // Deserializing from CBOR
  const datum = Data.from(mintRedeemer, CampaignDatum);
  console.log(datum);

  console.log(campaignDatumRedeemer === mintRedeemer);
  //#endregion

  const now = await koios.getBlockTimeMs();

  const tx = await lucid
    .newTx()
    .collectFrom([nonceUTxO])
    .mintAssets(StateToken, mintRedeemer)
    .attachMetadata(721, {
      [campaignPolicy]: {
        [STATE_TOKEN.assetName]: {
          platform: platform.pkh ?? "",
          creator: creator.pkh ?? "",
          hash: nonceUTxO.txHash,
          index: nonceUTxO.outputIndex,
        },
      },
    })
    .attach.MintingPolicy(campaignValidator)
    .pay.ToContract(campaignAddress, { kind: "inline", value: mintRedeemer }, StateToken)
    .validFrom(now)
    .complete({ localUPLCEval: false });

  const txHash = await submitTx(tx);
  handleSuccess(`Create Campaign TxHash: ${txHash}`);

  return {
    CampaignInfo: {
      id: campaignPolicy,
      platform: { pkh: platform.pkh },
      nonce: { txHash: nonceUTxO.txHash, outputIndex: nonceUTxO.outputIndex },
      validator: campaignValidator,
      address: campaignAddress,
      datum: campaignDatum,
      data: {
        name: campaign.name,
        goal: parseFloat(`${campaign.goal / 1_000000n}.${campaign.goal % 1_000000n}`),
        deadline: new Date(parseInt(campaign.deadline.toString())),
        creator: { pk: keyHashToCredential(creator.pkh ?? ""), sk: keyHashToCredential(creator.skh ?? ""), address: creator.address ?? "" },
        backers: [],
        support: { lovelace: 0n, ada: 0 },
        state: "Running",
      },
    },
    StateToken: {
      unit: StateTokenUnit,
      utxo: {
        txHash,
        outputIndex: 0,
        address: campaignAddress,
        assets: StateToken,
        datum: mintRedeemer,
      },
    },
  };
}

export async function cancelCampaign({ lucid, wallet }: WalletConnection, campaign?: CampaignUTxO): Promise<CampaignUTxO> {
  if (!lucid) throw "Unitialized Lucid";
  if (!wallet) throw "Disconnected Wallet";
  if (!campaign) throw "No Campaign";

  const { CampaignInfo, StateToken } = campaign;

  const [StateTokenUTxO] = await lucid.utxosAtWithUnit(CampaignInfo.address, StateToken.unit);

  const newState: CampaignState = "Cancelled";
  const updatedDatum: CampaignDatum = {
    ...CampaignInfo.datum,
    state: newState,
  };
  const datum = Data.to(updatedDatum, CampaignDatum);

  if (!lucid.wallet()) {
    const api = await wallet.enable();
    lucid.selectWallet.fromAPI(api);
  }

  const tx = await lucid
    .newTx()
    .collectFrom([StateTokenUTxO], CampaignActionRedeemer.Cancel)
    .attach.SpendingValidator(CampaignInfo.validator)
    .pay.ToContract(CampaignInfo.address, { kind: "inline", value: datum }, { [StateToken.unit]: 1n })
    .addSigner(CampaignInfo.data.creator.address)
    .complete({ localUPLCEval: false });

  const txHash = await submitTx(tx);
  handleSuccess(`Cancel Campaign TxHash: ${txHash}`);

  return {
    CampaignInfo: { ...CampaignInfo, datum: updatedDatum, data: { ...CampaignInfo.data, state: newState } },
    StateToken: { ...StateToken, utxo: { ...StateTokenUTxO, txHash, outputIndex: 0, datum } },
  };
}

export async function supportCampaign(
  { lucid, wallet, pkh, skh, address }: WalletConnection,
  campaign?: CampaignUTxO,
  supportADA?: string
): Promise<CampaignUTxO> {
  if (!lucid) throw "Unitialized Lucid";
  if (!wallet) throw "Disconnected Wallet";
  if (!address) throw "No Address";
  if (!campaign) throw "No Campaign";

  const { CampaignInfo } = campaign;

  const backerPKH = pkh ?? "";
  const backerSKH = skh ?? "";

  const backer: BackerDatum = [backerPKH, backerSKH];
  const datum = Data.to(backer, BackerDatum);

  const support = supportADA ?? "0";
  const ada = parseFloat(support);
  const lovelace = adaToLovelace(support);

  if (!lucid.wallet()) {
    const api = await wallet.enable();
    lucid.selectWallet.fromAPI(api);
  }

  const tx = await lucid.newTx().pay.ToContract(CampaignInfo.address, { kind: "inline", value: datum }, { lovelace }).complete();

  const txHash = await submitTx(tx);
  handleSuccess(`Support Campaign TxHash: ${txHash}`);

  return {
    ...campaign,
    CampaignInfo: {
      ...CampaignInfo,
      data: {
        ...CampaignInfo.data,
        backers: [
          ...CampaignInfo.data.backers,
          {
            address,
            pkh: backerPKH,
            skh: backerPKH,
            pk: keyHashToCredential(backerPKH),
            sk: keyHashToCredential(backerSKH),
            support: { ada, lovelace },
            utxo: { txHash, outputIndex: 0, address: CampaignInfo.address, assets: { lovelace }, datum },
          },
        ],
        support: { ada: CampaignInfo.data.support.ada + ada, lovelace: CampaignInfo.data.support.lovelace + lovelace },
      },
    },
  };
}

export async function finishCampaign({ lucid, wallet }: WalletConnection, campaign?: CampaignUTxO): Promise<CampaignUTxO> {
  if (!lucid) throw "Unitialized Lucid";
  if (!wallet) throw "Disconnected Wallet";
  if (!campaign) throw "No Campaign";

  const { CampaignInfo, StateToken } = campaign;

  const [StateTokenUTxO] = await lucid.utxosAtWithUnit(CampaignInfo.address, StateToken.unit);

  const newState: CampaignState = "Finished";
  const updatedDatum: CampaignDatum = {
    ...CampaignInfo.datum,
    state: newState,
  };
  const datum = Data.to(updatedDatum, CampaignDatum);

  if (!lucid.wallet()) {
    const api = await wallet.enable();
    lucid.selectWallet.fromAPI(api);
  }

  const tx = await lucid
    .newTx()
    .collectFrom([StateTokenUTxO, ...CampaignInfo.data.backers.map(({ utxo }) => utxo)], CampaignActionRedeemer.Finish)
    .attach.SpendingValidator(CampaignInfo.validator)
    .pay.ToContract(CampaignInfo.address, { kind: "inline", value: datum }, { [StateToken.unit]: 1n })
    .pay.ToAddress(CampaignInfo.data.creator.address, { lovelace: CampaignInfo.data.support.lovelace })
    .addSigner(CampaignInfo.data.creator.address)
    .complete({ localUPLCEval: false });

  const txHash = await submitTx(tx);
  handleSuccess(`Finish Campaign TxHash: ${txHash}`);

  return {
    CampaignInfo: { ...CampaignInfo, datum: updatedDatum, data: { ...CampaignInfo.data, state: newState, backers: [], support: { ada: 0, lovelace: 0n } } },
    StateToken: { ...StateToken, utxo: { ...StateTokenUTxO, txHash, outputIndex: 0, datum } },
  };
}

export async function refundCampaign({ lucid, wallet, address }: WalletConnection, campaign?: CampaignUTxO): Promise<CampaignUTxO> {
  if (!lucid) throw "Unitialized Lucid";
  if (!wallet) throw "Disconnected Wallet";
  if (!address) throw "No Address";
  if (!campaign) throw "No Campaign";

  const { CampaignInfo, StateToken } = campaign;
  if (!CampaignInfo.data.support.ada) throw "Nothing to Refund";

  const currentBacker = CampaignInfo.data.backers.filter((backer) => backer.address === address);
  const backerADA = currentBacker.reduce((sum, { support }) => sum + support.ada, 0);
  if (!backerADA) throw "You did not support this campaign, or you're already refunded. Incorrect? Contact us!";
  const backerLovelace = adaToLovelace(`${backerADA}`);

  if (!lucid.wallet()) {
    const api = await wallet.enable();
    lucid.selectWallet.fromAPI(api);
  }

  const tx = await lucid
    .newTx()
    .readFrom([StateToken.utxo])
    .collectFrom(
      currentBacker.map(({ utxo }) => utxo),
      CampaignActionRedeemer.Refund
    )
    .attach.SpendingValidator(CampaignInfo.validator)
    .pay.ToAddress(address, { lovelace: backerLovelace })
    .complete({ localUPLCEval: false });

  const txHash = await submitTx(tx);
  handleSuccess(`Refund Campaign TxHash: ${txHash}`);

  return {
    ...campaign,
    CampaignInfo: {
      ...CampaignInfo,
      data: {
        ...CampaignInfo.data,
        backers: CampaignInfo.data.backers.filter((backer) => backer.address !== address),
        support: { ada: CampaignInfo.data.support.ada - backerADA, lovelace: CampaignInfo.data.support.lovelace - backerLovelace },
      },
    },
  };
}
