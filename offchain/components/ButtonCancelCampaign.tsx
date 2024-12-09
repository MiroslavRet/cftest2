import { useWallet } from "./contexts/wallet/WalletContext";
import { CampaignUTxO, useCampaign } from "./contexts/campaign/CampaignContext";
import { cancelCampaign } from "./crowdfunding";
import { Platform } from "@/types/platform";
import ActionButton from "./ActionButton";

export default function ButtonCancelCampaign(props: { platform?: Platform; callback?: (campaign: CampaignUTxO) => void }) {
  const { platform, callback } = props;

  const [walletConnection] = useWallet();
  const [campaign] = useCampaign();

  return (
    <ActionButton
      actionLabel="Cancel Campaign"
      campaignAction={() => cancelCampaign(walletConnection, campaign, platform)}
      callback={callback}
      buttonColor="danger"
      buttonVariant="flat"
    />
  );
}
