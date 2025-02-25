"use client";
import CreateWallet from "@/components/CreateWallet";
import { useState } from "react";
import bs58 from "bs58";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Home() {
  const [pubKey, setPubKey] = useState("");
  const [secKey, setSecKey] = useState("");

  const { publicKey } = useWallet(); // checks for connected wallet

  const handleGenerateWallet = () => {
    const wallet = CreateWallet();
    setPubKey(wallet.publicKey.toBase58()); //set the wallets public key
    setSecKey(bs58.encode(wallet.secretKey)); // sets the wallets private key
  };
  
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

        {publicKey ? (
          <div>
            <button
              onClick={handleGenerateWallet}
              className="bg-purple-400 p-4 rounded-lg"
            >
              generate new wallet
            </button>
            {
              pubKey && secKey ? (

              <>
                <p className="my-4">public Key: {pubKey}</p>
                <p className="my-4">secret Key: {secKey}</p>
              </>
              ): ""
            }
          </div>
        ) : (
          "GM SUPES"
        )}
      </main>
    </div>
  );
}
