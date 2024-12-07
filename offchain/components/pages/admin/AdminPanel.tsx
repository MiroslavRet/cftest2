import { Input } from "@nextui-org/input";
import { Address, credentialToRewardAddress, getAddressDetails } from "@lucid-evolution/lucid";
import { network } from "@/config/lucid";
import { toast } from "react-toastify";

export default function AdminPanel() {
  const crowdfundingPlatform = localStorage.getItem("CrowdfundingPlatform");
  const platform = crowdfundingPlatform ? JSON.parse(crowdfundingPlatform) : {};

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
    <>
      <Input
        autoFocus
        isRequired
        isClearable
        className="w-[768px]"
        label="Platform Address"
        placeholder="addr1_..."
        defaultValue={platform.address}
        onValueChange={setPlatformData}
      />
    </>
  );
}
