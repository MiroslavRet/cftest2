import { useState } from "react";
import { useWallet } from "@/components/contexts/wallet/WalletContext";
import { toast } from "react-toastify";
import { handleError } from "@/components/utils";
import { CampaignUTxO } from "@/components/contexts/campaign/CampaignContext";
import { Platform } from "@/types/platform";

import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { Skeleton } from "@nextui-org/skeleton";

import InputCampaignId from "@/components/campaign/InputCampaignId";
import CampaignCard from "@/components/campaign/CampaignCard";
import ButtonCancelCampaign from "@/components/buttons/campaign/ButtonCancelCampaign";
import ButtonFinishCampaign from "@/components/buttons/campaign/ButtonFinishCampaign";
import ButtonRefundCampaign from "@/components/buttons/campaign/ButtonRefundCampaign";
import ButtonClaimAllNoDatumUTxO from "@/components/buttons/nodatum/ButtonClaimAllNoDatum";
import NoDatumUTxO from "./NoDatumUTxO";

import { Address, credentialToRewardAddress, getAddressDetails } from "@lucid-evolution/lucid";
import { network } from "@/config/lucid";

export default function AdminPanel() {
  const [{ address }] = useWallet();

  const crowdfundingPlatform = localStorage.getItem("CrowdfundingPlatform");
  const platform: Platform = crowdfundingPlatform ? JSON.parse(crowdfundingPlatform) : {};

  const [campaign, setCampaign] = useState<CampaignUTxO>();
  const [isQueryingCampaign, setIsQueryingCampaign] = useState(false);

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
    <div className="flex flex-col gap-3">
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
            <div className="flex flex-col gap-3 mb-1.5">
              {/* Input Campaign ID */}
              <InputCampaignId
                onSubmit={() => setIsQueryingCampaign(true)}
                onSuccess={(campaign) => {
                  setCampaign(campaign);
                  setIsQueryingCampaign(false);
                }}
                onError={handleError}
              />

              {/* Campaign Card + NoDatum UTxOs */}
              {campaign && (
                <div className="flex flex-col gap-4 w-fit">
                  {/* Campaign Card */}
                  <Skeleton isLoaded={!isQueryingCampaign} className="rounded-lg w-fit">
                    <CampaignCard
                      campaign={campaign}
                      hasActions={new Date() > campaign.CampaignInfo.data.deadline}
                      actionButtons={
                        campaign.CampaignInfo.data.state === "Running" ? (
                          campaign.CampaignInfo.data.support.ada < campaign.CampaignInfo.data.goal ? (
                            <ButtonCancelCampaign platform={platform} campaign={campaign} onSuccess={setCampaign} onError={handleError} />
                          ) : (
                            <ButtonFinishCampaign platform={platform} campaign={campaign} onSuccess={setCampaign} onError={handleError} />
                          )
                        ) : (
                          <ButtonRefundCampaign platform={platform} campaign={campaign} onSuccess={setCampaign} onError={handleError} />
                        )
                      }
                    />
                  </Skeleton>

                  {/* NoDatum UTxOs */}
                  {campaign.CampaignInfo.data.noDatum.length > 0 && (
                    <>
                      <Divider />
                      <div className="flex justify-between w-full px-3">
                        {/* NoDatum UTxOs Label */}
                        <Skeleton isLoaded={!isQueryingCampaign} className="rounded-lg w-fit my-auto">
                          <span className="font-bold">NoDatum UTxOs</span>
                        </Skeleton>

                        {/* Claim All Button */}
                        <Skeleton isLoaded={!isQueryingCampaign} className="rounded-lg w-fit">
                          <ButtonClaimAllNoDatumUTxO campaign={campaign} onSuccess={setCampaign} onError={handleError} />
                        </Skeleton>
                      </div>
                      <Divider />
                    </>
                  )}
                  {campaign.CampaignInfo.data.noDatum.map((utxo) => (
                    <Skeleton key={`${utxo.txHash}#${utxo.outputIndex}`} isLoaded={!isQueryingCampaign} className="rounded-lg w-full">
                      <NoDatumUTxO utxo={utxo} campaign={campaign} onSuccess={setCampaign} onError={handleError} />
                    </Skeleton>
                  ))}
                </div>
              )}
            </div>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
