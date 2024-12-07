import { useState } from "react";
import { useWallet } from "./contexts/wallet/WalletContext";
import { useCampaign } from "./contexts/campaign/CampaignContext";
import { handleError } from "./utils";

import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { cancelCampaign } from "./crowdfunding";

export default function ButtonCancelCampaign() {
  const [walletConnection] = useWallet();
  const [campaign, processCampaign] = useCampaign();

  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  return (
    <div className="relative">
      <Button
        onPress={() => {
          const loader = document.getElementById("loader") as HTMLDialogElement;
          loader.showModal();
          setIsSubmittingTx(true);
          cancelCampaign(walletConnection, campaign)
            .then((campaign) =>
              processCampaign({
                actionType: "Store",
                nextState: campaign,
              })
            )
            .catch(handleError)
            .finally(() => {
              setIsSubmittingTx(false);
              loader.close();
            });
        }}
        className={isSubmittingTx ? "invisible" : ""}
        color="danger"
        variant="flat"
      >
        Cancel Campaign
      </Button>
      {isSubmittingTx && <Spinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
      <dialog id="loader" />
    </div>
  );
}
