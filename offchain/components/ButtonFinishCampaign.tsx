import { useWallet } from "./contexts/wallet/WalletContext";
import { useCampaign } from "./contexts/campaign/CampaignContext";
import { finishCampaign } from "./crowdfunding";
import ActionButton from "./ActionButton";

export default function ButtonFinishCampaign() {
  const [walletConnection] = useWallet();
  const [campaign] = useCampaign();

  return (
    <ActionButton
      actionLabel="Finish Campaign"
      campaignAction={() => finishCampaign(walletConnection, campaign)}
      buttonColor="success"
      buttonVariant="shadow"
    />
  );
}
