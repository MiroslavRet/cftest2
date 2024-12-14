import { useEffect, useState } from "react";
import { useWallet } from "../../contexts/wallet/WalletContext";
import { CampaignUTxO } from "../../contexts/campaign/CampaignContext";
import { hackCampaign } from "../../crowdfunding";

import { Button } from "@nextui-org/button";
import { Checkbox } from "@nextui-org/checkbox";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/modal";
import { Spinner } from "@nextui-org/spinner";
import { Tooltip } from "@nextui-org/tooltip";

import { Address, RewardAddress } from "@lucid-evolution/lucid";

export default function ButtonHackCancelCampaign(props: {
  campaign: CampaignUTxO;
  onSuccess: (campaign: CampaignUTxO) => void;
  onError?: (error: any) => void;
}) {
  const { campaign, onSuccess, onError } = props;

  const [walletConnection] = useWallet();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    if (!isOpen) resetStates();
  }, [isOpen]);

  const nowMs = new Date().getTime() * 1_000;

  const [validFrom, setValidFrom] = useState<{ yes: boolean; unixTime?: number }>({ yes: false });
  const [addSigner, setAddSigner] = useState<{ yes: boolean; address?: Address | RewardAddress }>({ yes: false });
  const [payToContract, setPayToContract] = useState<{ yes: boolean; address?: string }>({ yes: false });

  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  function resetStates() {
    setValidFrom({ yes: false });
    setAddSigner({ yes: false });
    setPayToContract({ yes: false });
    setIsSubmittingTx(false);
  }

  return (
    <>
      <Button onPress={onOpen} color="danger" variant="flat">
        Cancel Campaign
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
              <ModalHeader className="flex flex-col gap-1">Cancel Campaign</ModalHeader>
              <ModalBody>
                {/* Valid From */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="unix-time">Valid from?</label>
                  <div className="flex gap-1">
                    <Checkbox
                      isDisabled={isSubmittingTx}
                      isSelected={validFrom.yes}
                      onValueChange={(isSelected) =>
                        setValidFrom((validFrom) => ({
                          yes: isSelected,
                          unixTime: isSelected ? (validFrom.unixTime ?? nowMs) : undefined,
                        }))
                      }
                    />
                    <Tooltip id="unix-time" content="Set UNIX Time to 0 to use the latest block time." color="primary" placement="right" showArrow>
                      <Input
                        label="UNIX Time"
                        variant="bordered"
                        isDisabled={isSubmittingTx || !validFrom.yes}
                        placeholder={`${nowMs}`}
                        onValueChange={(value) => setValidFrom((validFrom) => ({ ...validFrom, unixTime: parseInt(value) }))}
                      />
                    </Tooltip>
                  </div>
                </div>

                <Divider />

                {/* Add Signer */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="signer-address">Add signer?</label>
                  <div className="flex gap-1">
                    <Checkbox
                      isDisabled={isSubmittingTx}
                      isSelected={addSigner.yes}
                      onValueChange={(isSelected) => setAddSigner((addSigner) => ({ ...addSigner, yes: isSelected }))}
                    />
                    <Tooltip id="signer-address" content="Set Address to Empty to use your address." color="primary" placement="right" showArrow>
                      <Input
                        label="Address or Reward Address"
                        variant="bordered"
                        isDisabled={isSubmittingTx || !addSigner.yes}
                        onValueChange={(address) => setAddSigner((addSigner) => ({ ...addSigner, address }))}
                      />
                    </Tooltip>
                  </div>
                </div>

                <Divider />

                {/* Pay to Contract */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="contract-address" className="flex gap-1">
                    Resend STATE_TOKEN?
                  </label>
                  <div className="flex gap-1">
                    <Checkbox
                      isDisabled={isSubmittingTx}
                      isSelected={payToContract.yes}
                      onValueChange={(isSelected) => setPayToContract((payToContract) => ({ ...payToContract, yes: isSelected }))}
                    />
                    <Tooltip id="contract-address" content="Set Address to Empty to use your address." color="primary" placement="right" showArrow>
                      <Input
                        label="To Address"
                        variant="bordered"
                        isDisabled={isSubmittingTx || !payToContract.yes}
                        onValueChange={(address) => setPayToContract((payToContract) => ({ ...payToContract, address }))}
                      />
                    </Tooltip>
                  </div>
                </div>
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
                      hackCampaign(walletConnection, { action: "cancel", params: { validFrom, addSigner, payToContract } }, campaign)
                        .then(onSuccess)
                        .catch(onError)
                        .finally(onClose);
                    }}
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
