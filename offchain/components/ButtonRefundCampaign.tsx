import { useWallet } from "./contexts/wallet/WalletContext";
import { useCampaign } from "./contexts/campaign/CampaignContext";
import { refundCampaign } from "./crowdfunding";
import ActionButton from "./ActionButton";

export default function ButtonRefundCampaign() {
  const [walletConnection] = useWallet();
  const [campaign] = useCampaign();

  return (
    <ActionButton actionLabel="Refund Campaign" campaignAction={() => refundCampaign(walletConnection, campaign)} buttonColor="warning" buttonVariant="flat" />
  );
}
