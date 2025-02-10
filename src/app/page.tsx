"use client";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import CreateWallet from "@/components/CreateWallet";
import Image from "next/image";
import { useState } from "react";
import bs58 from "bs58";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Home() {
  const [pubKey, setPubKey] = useState("");
  const [secKey, setSecKey] = useState("");

  const { publicKey } = useWallet(); // checks for connected wallet

  const handleGenerateWallet = () => {
    const wallet = CreateWallet();
    setPubKey(wallet.publicKey.toBase58());
    setSecKey(bs58.encode(wallet.secretKey));
  };
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <WalletMultiButton />
        {/* <WalletDisconnectButton /> */}

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
          ""
        )}
      </main>
    </div>
  );
}
