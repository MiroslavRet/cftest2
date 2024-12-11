import { useWallet } from "../../contexts/wallet/WalletContext";
import { CampaignUTxO } from "../../contexts/campaign/CampaignContext";
import { cancelCampaign } from "../../crowdfunding";
import { Platform } from "@/types/platform";
import ActionButton from "../base/ActionButton";

export default function ButtonCancelCampaign(props: {
  platform?: Platform;
  campaign: CampaignUTxO;
  onSuccess: (campaign: CampaignUTxO) => void;
  onError?: (error: any) => void;
}) {
  const { platform, campaign, onSuccess, onError } = props;

  const [walletConnection] = useWallet();

  return (
    <ActionButton
      actionLabel="Cancel Campaign"
      campaignAction={() => cancelCampaign(walletConnection, campaign, platform)}
      onSuccess={onSuccess}
      onError={onError}
      buttonColor="danger"
      buttonVariant="flat"
    />
  );
}
