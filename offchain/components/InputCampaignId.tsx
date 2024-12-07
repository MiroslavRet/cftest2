import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
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
import { STATE_TOKEN } from "@/config/crowdfunding";
import { script } from "@/config/script";
import { network } from "@/config/lucid";
import { useWallet } from "./contexts/wallet/WalletContext";
import { CampaignDatum } from "@/types/crowdfunding";
import { useCampaign } from "./contexts/campaign/CampaignContext";

export default function InputCampaignId() {
  const router = useRouter();

  const [{ lucid, address }] = useWallet();
  const [, processCampaignUTxO] = useCampaign();

  const [campaignId, setCampaignId] = useState("");

  async function submit() {
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

    if (!lucid) throw "Uninitialized Lucid";
    const [StateTokenUTxO] = await lucid.utxosAtWithUnit(campaignAddress, StateTokenUnit);
    if (!StateTokenUTxO.datum) throw "No Datum";

    const campaignDatum = Data.from(StateTokenUTxO.datum, CampaignDatum);

    const [creatorPkh, creatorSkh] = campaignDatum.creator;
    const creatorPk = keyHashToCredential(creatorPkh);
    const creatorSk = keyHashToCredential(creatorSkh);
    const creatorAddress = credentialToAddress(network, creatorPk, creatorSk);

    processCampaignUTxO({
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

  function ButtonGo() {
    return (
      <Button onClick={submit} color={campaignId ? "primary" : "default"} isDisabled={!campaignId} size="sm" variant="ghost">
        Go
      </Button>
    );
  }

  return (
    <Input
      onKeyDown={(e) => {
        if (campaignId && e.code === "Enter") submit();
      }}
      onValueChange={setCampaignId}
      endContent={<ButtonGo />}
      className="w-96"
      label="Enter Campaign ID"
      variant="bordered"
      radius="sm"
    />
  );
}
