import { useWallet } from "./contexts/wallet/WalletContext";
import { useCampaign } from "./contexts/campaign/CampaignContext";
import { cancelCampaign } from "./crowdfunding";
import ActionButton from "./ActionButton";

export default function ButtonFinishCampaign() {
  const [walletConnection] = useWallet();
  const [campaign] = useCampaign();

  return (
    <ActionButton
      actionLabel="Finish Campaign"
      campaignAction={() => cancelCampaign(walletConnection, campaign)} // TODO: finishCampaign()
      buttonColor="success"
      buttonVariant="shadow"
    />
  );
}
