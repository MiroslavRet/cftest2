import { useWallet } from "@/components/contexts/wallet/WalletContext";
import { CampaignUTxO } from "@/components/contexts/campaign/CampaignContext";
import { claimNoDatumUTXOs } from "@/components/crowdfunding";
import ActionButton from "../base/ActionButton";

export default function ButtonClaimAllNoDatumUTXOs(props: {
  campaign: CampaignUTxO;
  onSuccess: (campaign: CampaignUTxO) => void;
  onError?: (error: any) => void;
}) {
  const { campaign, onSuccess, onError } = props;

  const [walletConnection] = useWallet();

  return (
    <ActionButton
      actionLabel="Claim All"
      campaignAction={() => claimNoDatumUTXOs(walletConnection, campaign)}
      onSuccess={onSuccess}
      onError={onError}
      buttonColor="success"
      buttonVariant="shadow"
    />
  );
}
