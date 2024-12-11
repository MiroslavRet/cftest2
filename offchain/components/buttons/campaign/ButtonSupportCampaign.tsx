import { useState } from "react";
import { useWallet } from "../../contexts/wallet/WalletContext";
import { CampaignUTxO } from "../../contexts/campaign/CampaignContext";
import { supportCampaign } from "../../crowdfunding";
import { handleError } from "../../utils";

import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/modal";
import { Spinner } from "@nextui-org/spinner";

export default function ButtonSupportCampaign(props: { campaign: CampaignUTxO; onSuccess: (campaign: CampaignUTxO) => void; onError?: (error: any) => void }) {
  const { campaign, onSuccess, onError } = props;

  const [walletConnection] = useWallet();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [supportAmount, setSupportAmount] = useState("");
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  return (
    <>
      <Button onPress={onOpen} className="w-fit" color="secondary" variant="shadow">
        Support Campaign
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
              <ModalHeader className="flex flex-col gap-1">Support Campaign</ModalHeader>
              <ModalBody>
                <Input
                  type="number"
                  label="Support Amount"
                  placeholder="0.000000"
                  min={0}
                  max={45_000_000_000.0}
                  step={1}
                  isDisabled={isSubmittingTx}
                  onValueChange={setSupportAmount}
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">ADA</span>
                    </div>
                  }
                />
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
                      supportCampaign(walletConnection, campaign, supportAmount)
                        .then(onSuccess)
                        .catch(onError ?? handleError)
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
