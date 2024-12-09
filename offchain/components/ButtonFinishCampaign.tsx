import { useWallet } from "./contexts/wallet/WalletContext";
import { CampaignUTxO, useCampaign } from "./contexts/campaign/CampaignContext";
import { finishCampaign } from "./crowdfunding";
import { Platform } from "@/types/platform";
import ActionButton from "./ActionButton";

export default function ButtonFinishCampaign(props: { platform?: Platform; callback?: (campaign: CampaignUTxO) => void }) {
  const { platform, callback } = props;

  const [walletConnection] = useWallet();
  const [campaign] = useCampaign();

  return (
    <ActionButton
      actionLabel="Finish Campaign"
      campaignAction={() => finishCampaign(walletConnection, campaign, platform)}
      callback={callback}
      buttonColor="success"
      buttonVariant="shadow"
    />
  );
}
