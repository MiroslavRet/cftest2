import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "./contexts/wallet/WalletContext";
import { BackerUTxO, useCampaign } from "./contexts/campaign/CampaignContext";
import { BackerDatum, CampaignDatum } from "@/types/crowdfunding";
import { STATE_TOKEN } from "@/config/crowdfunding";

import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";

import { handleError } from "./utils";
import { koios } from "./koios";
import {
  applyParamsToScript,
  Constr,
  credentialToAddress,
  Data,
  keyHashToCredential,
  toText,
  toUnit,
  Validator,
  validatorToAddress,
} from "@lucid-evolution/lucid";
import { network } from "@/config/lucid";
import { script } from "@/config/script";

export default function InputCampaignId() {
  const router = useRouter();

  const [{ lucid, address }] = useWallet();
  const [, processCampaign] = useCampaign();

  const [campaignId, setCampaignId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function queryAndProcessCampaign() {
    //#region Campaign Info
    const campaign = await koios.getTokenMetadata(campaignId);
    const { platform, creator, hash, index } = campaign[campaignId].STATE_TOKEN;
    const StateTokenUnit = toUnit(campaignId, STATE_TOKEN.hex); // `${PolicyID}${AssetName}`

    const nonceTxHash = String(hash);
    const nonceTxIdx = BigInt(index);
    const nonceORef = new Constr(0, [nonceTxHash, nonceTxIdx]);

    const campaignValidator: Validator = {
      type: "PlutusV3",
      script: applyParamsToScript(script.Crowdfunding, [platform, creator, nonceORef]),
    };
    const campaignAddress = validatorToAddress(network, campaignValidator);
    //#endregion

    if (!lucid) throw "Uninitialized Lucid";
    const [StateTokenUTxO] = await lucid.utxosAtWithUnit(campaignAddress, StateTokenUnit);
    if (!StateTokenUTxO.datum) throw "No Datum";

    const campaignDatum = Data.from(StateTokenUTxO.datum, CampaignDatum);

    //#region Creator Info
    const [creatorPkh, creatorSkh] = campaignDatum.creator;
    const creatorPk = keyHashToCredential(creatorPkh);
    const creatorSk = keyHashToCredential(creatorSkh);
    const creatorAddress = credentialToAddress(network, creatorPk, creatorSk);
    //#endregion

    //#region Backers Info
    const utxos = await lucid.utxosAt(campaignAddress);
    const backers: BackerUTxO[] = [];
    for (const utxo of utxos) {
      if (!utxo.datum) continue;
      try {
        const [pkh, skh] = Data.from(utxo.datum, BackerDatum);
        const backerPk = keyHashToCredential(pkh);
        const backerSk = skh ? keyHashToCredential(skh) : undefined;
        const backerAddress = credentialToAddress(network, backerPk, backerSk);

        const supportLovelace = utxo.assets.lovelace;
        const supportADA = parseFloat(`${supportLovelace / 1_000000n}.${supportLovelace % 1_000000n}`);

        backers.push({ utxo, pkh, skh, pk: backerPk, sk: backerSk, address: backerAddress, support: { lovelace: supportLovelace, ada: supportADA } });
      } catch {
        continue;
      }
    }
    //#endregion

    const supportLovelace = backers.reduce((sum, { support }) => sum + support.lovelace, 0n);
    const supportADA = parseFloat(`${supportLovelace / 1_000000n}.${supportLovelace % 1_000000n}`);
    processCampaign({
      actionType: "Store",
      nextState: {
        CampaignInfo: {
          id: campaignId,
          platform: { pkh: platform },
          nonce: { txHash: hash, outputIndex: index },
          validator: campaignValidator,
          address: campaignAddress,
          datum: campaignDatum,
          data: {
            name: toText(campaignDatum.name),
            goal: parseFloat(`${campaignDatum.goal / 1_000000n}.${campaignDatum.goal % 1_000000n}`),
            deadline: new Date(parseInt(campaignDatum.deadline.toString())),
            creator: { pk: creatorPk, sk: creatorSk, address: creatorAddress },
            backers,
            support: { lovelace: supportLovelace, ada: supportADA },
            state: campaignDatum.state,
          },
        },
        StateToken: {
          unit: StateTokenUnit,
          utxo: StateTokenUTxO,
        },
      },
    });
    router.push(creatorAddress === address ? "/creator" : "/backer");
  }

  async function submit() {
    const loader = document.getElementById("loader") as HTMLDialogElement;
    loader.showModal();
    setIsLoading(true);
    queryAndProcessCampaign().catch((error) => {
      loader.close();
      setIsLoading(false);
      handleError(error);
    });
  }

  function ButtonGo() {
    return (
      <div className="relative">
        <Button
          onClick={submit}
          className={isLoading ? "invisible" : ""}
          color={campaignId ? "primary" : "default"}
          isDisabled={!campaignId}
          size="sm"
          variant="ghost"
        >
          Go
        </Button>
        {isLoading && <Spinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
      </div>
    );
  }

  return (
    <>
      <Input
        onKeyDown={(e) => {
          if (campaignId && !isLoading && e.code === "Enter") submit();
        }}
        onValueChange={setCampaignId}
        endContent={<ButtonGo />}
        className="w-96"
        label="Enter Campaign ID"
        variant="bordered"
        radius="sm"
      />
      <dialog id="loader" />
    </>
  );
}
