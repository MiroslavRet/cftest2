import { useState } from "react";
import { useWallet } from "./contexts/wallet/WalletContext";
import { queryCampaign } from "./crowdfunding";
import { CampaignUTxO, useCampaign } from "./contexts/campaign/CampaignContext";

import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";

export default function InputCampaignId(props: { onSuccess: (campaign: CampaignUTxO) => void; onError: (error: any) => void }) {
  const { onSuccess, onError } = props;

  const [walletConnection] = useWallet();
  const [, processCampaign] = useCampaign();

  const [campaignId, setCampaignId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit() {
    const loader = document.getElementById("loader") as HTMLDialogElement;
    loader.showModal();
    setIsLoading(true);
    queryCampaign(walletConnection, campaignId)
      .then((campaign) => {
        processCampaign({ actionType: "Store", nextState: campaign });
        onSuccess(campaign);
      })
      .catch((error) => {
        onError(
          "Cannot read properties of undefined (reading 'minting_tx_metadata')" === error.message
            ? "Cannot find Campaign ID (the campaign might be just created, please try again later)"
            : error
        );
      })
      .finally(() => {
        try {
          loader.close();
        } finally {
          setIsLoading(false);
        }
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
          if (campaignId && !isLoading && e.code.endsWith("Enter")) submit();
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
