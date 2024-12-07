import { useWallet } from "../contexts/wallet/WalletContext";
import { Button } from "@nextui-org/button";

export default function DisconnectButton() {
  const [walletConnection, setWalletConnection] = useWallet();

  function disconnect() {
    setWalletConnection((walletConnection) => {
      return { ...walletConnection, wallet: undefined, address: "", pkh: "", stakeAddress: "", skh: "" };
    });
  }

  return (
    <Button onClick={disconnect} className="absolute top-0 right-0 -translate-y-full">
      Disconnect
    </Button>
  );
}
