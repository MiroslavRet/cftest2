import { useWallet } from "./contexts/wallet/WalletContext";
import { CampaignUTxO } from "./contexts/campaign/CampaignContext";
import { refundCampaign } from "./crowdfunding";
import { Platform } from "@/types/platform";
import ActionButton from "./ActionButton";

export default function ButtonRefundCampaign(props: {
  platform?: Platform;
  campaign: CampaignUTxO;
  onSuccess: (campaign: CampaignUTxO) => void;
  onError?: (error: any) => void;
}) {
  const { platform, campaign, onSuccess, onError } = props;

  const [walletConnection] = useWallet();

  return (
    <ActionButton
      actionLabel="Refund Campaign"
      campaignAction={() => refundCampaign(walletConnection, campaign, platform)}
      onSuccess={onSuccess}
      onError={onError}
      buttonColor="warning"
      buttonVariant="flat"
    />
  );
}
