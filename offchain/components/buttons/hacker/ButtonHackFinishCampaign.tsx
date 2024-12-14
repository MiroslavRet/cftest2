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
import { adaToLovelace } from "@/components/utils";

export default function ButtonHackFinishCampaign(props: {
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

  const [addSigner, setAddSigner] = useState<{ yes: boolean; address?: Address | RewardAddress }>({ yes: false });
  const [payToContract, setPayToContract] = useState<{ yes: boolean; address?: string }>({ yes: false });
  const [payToAddress, setPayToAddress] = useState<{ yes: boolean; address?: string; lovelace?: bigint }>({ yes: false });

  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  function resetStates() {
    setAddSigner({ yes: false });
    setPayToContract({ yes: false });
    setPayToAddress({ yes: false });
    setIsSubmittingTx(false);
  }

  return (
    <>
      <Button onPress={onOpen} color="success" variant="shadow">
        Fnish Campaign
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
              <ModalHeader className="flex flex-col gap-1">Finish Campaign</ModalHeader>
              <ModalBody>
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

                <Divider />

                {/* Pay to Address */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="support-address" className="flex gap-1">
                    Send backer supports?
                  </label>
                  <div className="flex gap-1">
                    <Checkbox
                      isDisabled={isSubmittingTx}
                      isSelected={payToAddress.yes}
                      onValueChange={(isSelected) => setPayToAddress((payToAddress) => ({ ...payToAddress, yes: isSelected }))}
                    />
                    <Input
                      id="support-address"
                      label="To Address"
                      variant="bordered"
                      isDisabled={isSubmittingTx || !payToAddress.yes}
                      onValueChange={(address) => setPayToAddress((payToAddress) => ({ ...payToAddress, address }))}
                    />
                    <Tooltip id="support-lovelace" content="Set ADA to 0 to send all backer support amount." color="primary" placement="right" showArrow>
                      <Input
                        type="number"
                        label="Support Amount"
                        variant="bordered"
                        placeholder="0.000000"
                        min={0}
                        max={45_000_000_000.0}
                        step={1}
                        isDisabled={isSubmittingTx || !payToAddress.yes}
                        onValueChange={(value) => setPayToAddress((payToAddress) => ({ ...payToAddress, lovelace: adaToLovelace(value) }))}
                        startContent={
                          <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">ADA</span>
                          </div>
                        }
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
                      hackCampaign(walletConnection, { action: "finish", params: { addSigner, payToContract, payToAddress } }, campaign)
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
