import { useRouter } from "next/navigation";
import { useWallet } from "@/components/contexts/wallet/WalletContext";
import { useCampaign } from "@/components/contexts/campaign/CampaignContext";

import { handleError } from "@/components/utils";
import { title } from "@/components/primitives";

import { Snippet } from "@nextui-org/snippet";

import InputCampaignId from "../../InputCampaignId";
import ButtonCreateCampaign from "../../ButtonCreateCampaign";

export default function ConnectedDashboard() {
  const router = useRouter();
  const [{ wallet, address }] = useWallet();
  const [, processCampaign] = useCampaign();

  return (
    <div className="flex flex-col text-center justify-center">
      {/* Title */}
      <h1 className={title()}>
        Welcome, <span className={title({ color: "violet", className: "capitalize" })}>{wallet?.name}</span> is Connected!
      </h1>

      {/* Subtitle */}
      <div className="mx-auto mt-4">
        <Snippet hideSymbol variant="bordered">
          {address}
        </Snippet>
      </div>

      {/* Choice */}
      <Snippet hideCopyButton hideSymbol className="w-fit mx-auto mt-8 pt-3 pb-4">
        <div className="flex flex-col items-center">
          <InputCampaignId
            onSuccess={(campaign) => {
              processCampaign({ actionType: "Store", nextState: campaign });
              router.push(campaign.CampaignInfo.data.creator.address === address ? "/creator" : "/backer");
            }}
            onError={handleError}
          />
          <span className="my-2">or</span>
          <ButtonCreateCampaign
            onSuccess={(campaign) => {
              processCampaign({ actionType: "Store", nextState: campaign });
              router.push("/creator");
            }}
            onError={handleError}
          />
        </div>
      </Snippet>
    </div>
  );
}
