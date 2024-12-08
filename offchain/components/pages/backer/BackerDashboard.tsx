import { useWallet } from "@/components/contexts/wallet/WalletContext";
import { useCampaign } from "@/components/contexts/campaign/CampaignContext";

import CampaignCard from "@/components/CampaignCard";
import InputCampaignId from "@/components/InputCampaignId";
import ButtonRefundCampaign from "@/components/ButtonRefundCampaign";
import ButtonSupportCampaign from "@/components/ButtonSupportCampaign";

export default function BackerDashboard() {
  const [{ address }] = useWallet();
  const [campaign] = useCampaign();
  if (!campaign || campaign.CampaignInfo.data.creator.address === address) return <InputCampaignId />;

  const { CampaignInfo } = campaign;
  return (
    <CampaignCard
      campaign={campaign}
      hasActions={true}
      actionButtons={
        <>
          {CampaignInfo.data.state === "Running" ? (
            // Goal not reached yet? Creator can cancel the campaign:
            <ButtonSupportCampaign />
          ) : (
            // Goal reached? Creator may finish the campaign, even earlier than the deadline:
            <ButtonRefundCampaign />
          )}
        </>
      }
    />
  );
}
