import { useWallet } from "@/components/contexts/wallet/WalletContext";
import { CampaignUTxO } from "@/components/contexts/campaign/CampaignContext";
import { claimNoDatumUTXOs } from "@/components/crowdfunding";
import { UTxO } from "@lucid-evolution/lucid";
import ActionButton from "../base/ActionButton";

export default function ButtonClaimNoDatumUTxO(props: {
  utxo: UTxO;
  campaign: CampaignUTxO;
  onSuccess: (campaign: CampaignUTxO) => void;
  onError?: (error: any) => void;
}) {
  const { utxo, campaign, onSuccess, onError } = props;

  const [walletConnection] = useWallet();

  return (
    <ActionButton
      actionLabel="Claim"
      campaignAction={() => claimNoDatumUTXOs(walletConnection, campaign, utxo)}
      onSuccess={onSuccess}
      onError={onError}
      buttonColor="success"
      buttonVariant="flat"
    />
  );
}
