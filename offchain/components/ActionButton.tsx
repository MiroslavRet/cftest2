import { useState } from "react";
import { CampaignUTxO, useCampaign } from "./contexts/campaign/CampaignContext";
import { handleError } from "./utils";

import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";

export default function ActionButton(props: {
  actionLabel: string;
  campaignAction: () => Promise<CampaignUTxO>;
  buttonColor?: "danger" | "default" | "primary" | "secondary" | "success" | "warning";
  buttonVariant?: "flat" | "solid" | "bordered" | "light" | "faded" | "shadow" | "ghost";
}) {
  const { actionLabel, campaignAction, buttonColor, buttonVariant } = props;

  const [, processCampaign] = useCampaign();

  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  return (
    <div className="relative">
      <Button
        onPress={() => {
          const loader = document.getElementById("loader") as HTMLDialogElement;
          loader.showModal();
          setIsSubmittingTx(true);
          campaignAction()
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
        variant={buttonVariant}
        color={buttonColor}
      >
        {actionLabel}
      </Button>
      {isSubmittingTx && <Spinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
      <dialog id="loader" />
    </div>
  );
}
