import { useWallet } from "./contexts/wallet/WalletContext";
import { useCampaign } from "./contexts/campaign/CampaignContext";
import { cancelCampaign } from "./crowdfunding";
import ActionButton from "./ActionButton";

export default function ButtonRefundCampaign() {
  const [walletConnection] = useWallet();
  const [campaign] = useCampaign();

  return (
    // TODO: refundCampaign()
    <ActionButton actionLabel="Refund Campaign" campaignAction={() => cancelCampaign(walletConnection, campaign)} buttonColor="warning" buttonVariant="flat" />
  );
}
