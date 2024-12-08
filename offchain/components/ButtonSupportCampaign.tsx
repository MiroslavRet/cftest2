import { useWallet } from "./contexts/wallet/WalletContext";
import { useCampaign } from "./contexts/campaign/CampaignContext";
import { cancelCampaign } from "./crowdfunding";
import ActionButton from "./ActionButton";

export default function ButtonSupportCampaign() {
  const [walletConnection] = useWallet();
  const [campaign] = useCampaign();

  return (
    <ActionButton
      actionLabel="Support Campaign"
      campaignAction={() => cancelCampaign(walletConnection, campaign)} // TODO: supportCampaign()
      buttonColor="secondary"
      buttonVariant="shadow"
    />
  );
}
