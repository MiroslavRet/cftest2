import { useWallet } from "./contexts/wallet/WalletContext";
import { CampaignUTxO, useCampaign } from "./contexts/campaign/CampaignContext";
import { refundCampaign } from "./crowdfunding";
import { Platform } from "@/types/platform";
import ActionButton from "./ActionButton";

export default function ButtonRefundCampaign(props: { platform?: Platform; callback?: (campaign: CampaignUTxO) => void }) {
  const { platform, callback } = props;

  const [walletConnection] = useWallet();
  const [campaign] = useCampaign();

  return (
    <ActionButton
      actionLabel="Refund Campaign"
      campaignAction={() => refundCampaign(walletConnection, campaign, platform)}
      callback={callback}
      buttonColor="warning"
      buttonVariant="flat"
    />
  );
}
