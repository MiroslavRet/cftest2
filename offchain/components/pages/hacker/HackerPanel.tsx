import { useState } from "react";
import { handleError } from "@/components/utils";
import { CampaignUTxO } from "@/components/contexts/campaign/CampaignContext";

import { Divider } from "@nextui-org/divider";
import { Skeleton } from "@nextui-org/skeleton";

import InputCampaignId from "@/components/campaign/InputCampaignId";
import CampaignCard from "@/components/campaign/CampaignCard";
import ButtonHackCancelCampaign from "@/components/buttons/hacker/ButtonHackCancelCampaign";
import ButtonHackFinishCampaign from "@/components/buttons/hacker/ButtonHackFinishCampaign";
import ButtonHackRefundCampaign from "@/components/buttons/hacker/ButtonHackRefundCampaign";
import ButtonHackRerunCampaign from "@/components/buttons/hacker/ButtonHackRerunCampaign";
import ButtonHackClaimAllNoDatumUTXOs from "@/components/buttons/hacker/ButtonHackClaimAllNoDatumUTXOs";
import HackNoDatumUTxO from "./HackNoDatumUTxO";

export default function HackerPanel() {
  const [campaign, setCampaign] = useState<CampaignUTxO>();
  const [isQueryingCampaign, setIsQueryingCampaign] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
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
              hasActions={true}
              actionButtons={
                campaign.CampaignInfo.data.state === "Running" ? (
                  <div className="flex gap-3">
                    <ButtonHackCancelCampaign campaign={campaign} onSuccess={setCampaign} onError={handleError} />
                    <ButtonHackFinishCampaign campaign={campaign} onSuccess={setCampaign} onError={handleError} />
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <ButtonHackRefundCampaign campaign={campaign} onSuccess={setCampaign} onError={handleError} />
                    <ButtonHackRerunCampaign campaign={campaign} onSuccess={setCampaign} onError={handleError} />
                  </div>
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
                {campaign.CampaignInfo.data.noDatum.length > 1 && (
                  <Skeleton isLoaded={!isQueryingCampaign} className="rounded-lg w-fit">
                    <ButtonHackClaimAllNoDatumUTXOs campaign={campaign} onSuccess={setCampaign} onError={handleError} />
                  </Skeleton>
                )}
              </div>
              <Divider />
            </>
          )}
          {campaign.CampaignInfo.data.noDatum.map((utxo) => (
            <Skeleton key={`${utxo.txHash}#${utxo.outputIndex}`} isLoaded={!isQueryingCampaign} className="rounded-lg w-full">
              <HackNoDatumUTxO utxo={utxo} campaign={campaign} onSuccess={setCampaign} onError={handleError} />
            </Skeleton>
          ))}
        </div>
      )}
    </div>
  );
}
