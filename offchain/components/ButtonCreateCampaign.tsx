import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/components/contexts/wallet/WalletContext";
import { useCampaign } from "./contexts/campaign/CampaignContext";
import { createCampaign } from "@/components/crowdfunding";
import { handleError } from "@/components/utils";
import { koios } from "@/components/koios";

import { fromAbsolute, getLocalTimeZone, now, ZonedDateTime } from "@internationalized/date";

import { Button } from "@nextui-org/button";
import { DatePicker } from "@nextui-org/date-picker";
import { Input } from "@nextui-org/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/modal";
import { Skeleton } from "@nextui-org/skeleton";
import { Spinner } from "@nextui-org/spinner";

export default function ButtonCreateCampaign() {
  const router = useRouter();
  const [walletConnection] = useWallet();
  const [, processCampaignUTxO] = useCampaign();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    if (isOpen) {
      koios
        .getBlockTimeMs()
        .then((now) => {
          return setBlockTime(() => {
            return fromAbsolute(now, timezone);
          });
        })
        .catch(handleError);
    } else {
      setIsSubmittingTx(false);
      resetStates();
    }
  }, [isOpen]);

  const timezone = getLocalTimeZone();
  const [blockTime, setBlockTime] = useState<ZonedDateTime>();

  const [campaignName, setCampaignName] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [campaignDeadline, setCampaignDeadline] = useState(blockTime);

  const [goal, setGoal] = useState(0n);
  const [deadline, setDeadline] = useState(0n);

  useEffect(() => {
    setGoal(() => {
      try {
        const [ada, lovelace] = campaignGoal.split(".");
        return BigInt(ada) * 1_000000n + BigInt(lovelace || 0);
      } catch {
        return 0n;
      }
    });
  }, [campaignGoal]);

  useEffect(() => {
    setDeadline(() => {
      try {
        return BigInt(campaignDeadline?.toDate().getTime() ?? 0);
      } catch {
        return 0n;
      }
    });
  }, [campaignDeadline]);

  const isValidCampaign = () => campaignName && goal > 0n && deadline > 0n;
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  function resetStates() {
    setCampaignName("");
    setCampaignGoal("");
    setCampaignDeadline(undefined);
    setBlockTime(undefined);
  }

  return (
    <>
      <Button
        onPress={() => {
          const crowdfundingPlatform = localStorage.getItem("CrowdfundingPlatform");
          if (crowdfundingPlatform) onOpen();
          else handleError("Go to Admin page to set the Crowdfunding Platform Address first!");
        }}
        className="w-fit"
        color="primary"
        radius="full"
        variant="shadow"
      >
        Create Campaign
      </Button>

      <Modal
        backdrop="blur"
        hideCloseButton={isSubmittingTx}
        isKeyboardDismissDisabled={isSubmittingTx}
        isDismissable={false}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Create Campaign</ModalHeader>
              <ModalBody>
                {/* Campaign Name */}
                <Skeleton isLoaded={!!blockTime} className="rounded-xl">
                  <Input
                    autoFocus
                    isRequired
                    isDisabled={isSubmittingTx}
                    label="Campaign Name"
                    placeholder="Enter campaign name"
                    onValueChange={setCampaignName}
                  />
                </Skeleton>

                {/* Campaign Goal */}
                <Skeleton isLoaded={!!blockTime} className="rounded-xl">
                  <Input
                    isRequired
                    type="number"
                    label="Campaign Goal"
                    placeholder="0.000000"
                    min={0}
                    max={45_000_000_000.0}
                    step={1}
                    isDisabled={isSubmittingTx}
                    onValueChange={setCampaignGoal}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">ADA</span>
                      </div>
                    }
                  />
                </Skeleton>

                {/* Campaign Deadline */}
                <Skeleton isLoaded={!!blockTime} className="rounded-xl">
                  <DatePicker
                    label="Set Deadline"
                    hideTimeZone
                    isDisabled={isSubmittingTx}
                    isRequired
                    showMonthAndYearPickers
                    defaultValue={now(timezone)}
                    minValue={blockTime}
                    onChange={setCampaignDeadline}
                  />
                </Skeleton>
              </ModalBody>
              <ModalFooter>
                {/* Cancel Button */}
                <div className="relative">
                  <Button onPress={onClose} isDisabled={isSubmittingTx} color="danger" variant="flat">
                    Cancel
                  </Button>
                </div>

                {/* Submit Button */}
                <div className="relative">
                  <Button
                    onPress={() => {
                      setIsSubmittingTx(true);
                      createCampaign(walletConnection, { name: campaignName, goal, deadline })
                        .then((campaignUTxO) => {
                          processCampaignUTxO({
                            actionType: "Store",
                            nextState: campaignUTxO,
                          });
                          router.push("/creator");
                        })
                        .catch(handleError)
                        .finally(onClose);
                    }}
                    isDisabled={!isValidCampaign()}
                    className={isSubmittingTx ? "invisible" : ""}
                    color="primary"
                    variant="shadow"
                  >
                    Submit
                  </Button>
                  {isSubmittingTx && <Spinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
