import { useState } from "react";
import { useWallet } from "@/components/contexts/wallet/WalletContext";
import { toast } from "react-toastify";
import { handleError } from "@/components/utils";
import { CampaignUTxO } from "@/components/contexts/campaign/CampaignContext";
import { Platform } from "@/types/platform";

import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Input } from "@nextui-org/input";
import InputCampaignId from "@/components/InputCampaignId";
import CampaignCard from "@/components/CampaignCard";
import ButtonCancelCampaign from "@/components/ButtonCancelCampaign";
import ButtonFinishCampaign from "@/components/ButtonFinishCampaign";
import ButtonRefundCampaign from "@/components/ButtonRefundCampaign";

import { Address, credentialToRewardAddress, getAddressDetails } from "@lucid-evolution/lucid";
import { network } from "@/config/lucid";

export default function AdminPanel() {
  const [{ address }] = useWallet();

  const crowdfundingPlatform = localStorage.getItem("CrowdfundingPlatform");
  const platform: Platform = crowdfundingPlatform ? JSON.parse(crowdfundingPlatform) : {};

  const [campaign, setCampaign] = useState<CampaignUTxO>();

  function setPlatformData(address: Address) {
    if (!address) {
      clearPlatformData();
      return;
    }

    try {
      const { paymentCredential, stakeCredential } = getAddressDetails(address);
      const pkh = paymentCredential?.hash;
      const skh = stakeCredential?.hash;
      const stakeAddress = stakeCredential ? credentialToRewardAddress(network, stakeCredential) : "";

      const platform = JSON.stringify({ address, pkh, stakeAddress, skh });
      localStorage.setItem("CrowdfundingPlatform", platform);
      toast("Saved!", { type: "success" });
    } catch {}
  }

  function clearPlatformData() {
    localStorage.clear();
    toast("Cleared!", { type: "success" });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Platform Address */}
      <Input
        isClearable
        variant="bordered"
        className="w-[768px]"
        label="Platform Address"
        placeholder="addr1_..."
        defaultValue={platform.address}
        onValueChange={setPlatformData}
      />

      {address === platform.address && (
        <Accordion variant="bordered">
          {/* Query Campaign */}
          <AccordionItem key="query-campaign" aria-label="Query Campaign" title="Query Campaign">
            {/* Input Campaign ID */}
            <div className="mb-3">
              <InputCampaignId onSuccess={setCampaign} onError={handleError} />
            </div>

            {/* Campaign Card */}
            {campaign && (
              <div className="mb-1.5">
                <CampaignCard
                  campaign={campaign}
                  hasActions={new Date() > campaign.CampaignInfo.data.deadline}
                  actionButtons={
                    campaign.CampaignInfo.data.state === "Running" ? (
                      campaign.CampaignInfo.data.support.ada < campaign.CampaignInfo.data.goal ? (
                        <ButtonCancelCampaign platform={platform} callback={setCampaign} />
                      ) : (
                        <ButtonFinishCampaign platform={platform} callback={setCampaign} />
                      )
                    ) : (
                      <ButtonRefundCampaign platform={platform} callback={setCampaign} />
                    )
                  }
                />
              </div>
            )}
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
