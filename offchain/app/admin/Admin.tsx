import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/components/contexts/wallet/WalletContext";
import { title } from "@/components/primitives";

import AdminPanel from "@/components/pages/admin/AdminPanel";

import DisconnectButton from "@/components/pages/DisconnectButton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Admin() {
  const router = useRouter();
  const [{ address }] = useWallet();

  let isPushed = false;
  useEffect(() => {
    if (!address && !isPushed) {
      router.push("/");
      isPushed = true;
    }
  }, [address]);
  if (!address) return <></>;

  return (
    <>
      {/* Title */}
      <div className="inline-block max-w-lg text-center justify-center">
        <h1 className={title()}>
          <span className={title({ color: "violet" })}>Admin</span> Dashboard
        </h1>
      </div>

      <div className="mt-4">
        <AdminPanel />
      </div>

      <ToastContainer theme="dark" position="bottom-right" />
      <DisconnectButton />
    </>
  );
}
