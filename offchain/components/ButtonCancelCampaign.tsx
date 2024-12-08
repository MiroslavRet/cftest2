import { useWallet } from "./contexts/wallet/WalletContext";
import { useCampaign } from "./contexts/campaign/CampaignContext";
import { cancelCampaign } from "./crowdfunding";
import ActionButton from "./ActionButton";

export default function ButtonCancelCampaign() {
  const [walletConnection] = useWallet();
  const [campaign] = useCampaign();

  return (
    <ActionButton actionLabel="Cancel Campaign" campaignAction={() => cancelCampaign(walletConnection, campaign)} buttonColor="danger" buttonVariant="flat" />
  );
}
