import { useEffect, useState } from "react";
import { useWallet } from "../../contexts/wallet/WalletContext";
import { CampaignUTxO } from "../../contexts/campaign/CampaignContext";
import { hackCampaign } from "../../crowdfunding";

import { Button } from "@nextui-org/button";
import { Checkbox } from "@nextui-org/checkbox";
import { Input } from "@nextui-org/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/modal";
import { Spinner } from "@nextui-org/spinner";
import { Address, RewardAddress } from "@lucid-evolution/lucid";
import { Divider } from "@nextui-org/divider";
import { Tooltip } from "@nextui-org/tooltip";

export default function ButtonHackRerunCampaign(props: {
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

  const [constr, setConstr] = useState<{ yes: boolean; index?: number }>({ yes: false });
  const [addSigner, setAddSigner] = useState<{ yes: boolean; address?: Address | RewardAddress }>({ yes: false });

  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  function resetStates() {
    setConstr({ yes: false });
    setAddSigner({ yes: false });
    setIsSubmittingTx(false);
  }

  return (
    <>
      <Button onPress={onOpen} color="primary" variant="shadow">
        Rerun Campaign
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
              <ModalHeader className="flex flex-col gap-1">Rerun Campaign</ModalHeader>
              <ModalBody>
                {/* Redeemer Index */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="constr-index">Redeemer action?</label>
                  <div className="flex gap-1">
                    <Checkbox
                      isDisabled={isSubmittingTx}
                      isSelected={constr.yes}
                      onValueChange={(isSelected) => setConstr((constr) => ({ ...constr, yes: isSelected }))}
                    />
                    <Input
                      id="constr-index"
                      label="Index"
                      variant="bordered"
                      isDisabled={isSubmittingTx || !constr.yes}
                      onValueChange={(value) => setConstr((constr) => ({ ...constr, index: value ? parseInt(value) : undefined }))}
                    />
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
                      hackCampaign(walletConnection, { action: "rerun", params: { constr, addSigner } }, campaign)
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
