import { useWallet } from "@/components/contexts/wallet/WalletContext";
import { title } from "@/components/primitives";

import { Snippet } from "@nextui-org/snippet";

import InputCampaignId from "../../InputCampaignId";
import ButtonCreateCampaign from "../../ButtonCreateCampaign";

export default function ConnectedDashboard() {
  const [{ wallet, address }] = useWallet();

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
          <InputCampaignId />
          <span className="my-2">or</span>
          <ButtonCreateCampaign />
        </div>
      </Snippet>
    </div>
  );
}
