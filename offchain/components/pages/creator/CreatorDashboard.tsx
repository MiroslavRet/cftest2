import { useRouter } from "next/navigation";
import { useWallet } from "@/components/contexts/wallet/WalletContext";
import { useCampaign } from "@/components/contexts/campaign/CampaignContext";
import { handleError } from "@/components/utils";

import CampaignCard from "@/components/campaign/CampaignCard";
import ButtonCreateCampaign from "@/components/buttons/campaign/ButtonCreateCampaign";
import ButtonCancelCampaign from "@/components/buttons/campaign/ButtonCancelCampaign";
import ButtonFinishCampaign from "@/components/buttons/campaign/ButtonFinishCampaign";

export default function CreatorDashboard() {
  const router = useRouter();
  const [{ address }] = useWallet();
  const [campaign, processCampaign] = useCampaign();
  if (!campaign || campaign.CampaignInfo.data.creator.address !== address)
    return <ButtonCreateCampaign onSuccess={(campaign) => processCampaign({ actionType: "Store", nextState: campaign })} onError={handleError} />;

  const { CampaignInfo } = campaign;
  return (
    <CampaignCard
      campaign={campaign}
      hasActions={CampaignInfo.data.state === "Running"}
      actionButtons={
        <>
          {CampaignInfo.data.support.ada < CampaignInfo.data.goal ? (
            // Goal not reached yet? Creator can cancel the campaign:
            <ButtonCancelCampaign
              campaign={campaign}
              onSuccess={(campaign) => processCampaign({ actionType: "Store", nextState: campaign })}
              onError={handleError}
            />
          ) : (
            // Goal reached? Creator may finish the campaign, even earlier than the deadline:
            <ButtonFinishCampaign
              campaign={campaign}
              onSuccess={(campaign) => processCampaign({ actionType: "Store", nextState: campaign })}
              onError={handleError}
            />
          )}
        </>
      }
    />
  );
}
