"use client";

import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [reciepientAddress, setReciepientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [signature, setSignature] = useState("");
  //used to fetch the pubkey of the connected wallet
  const { publicKey, sendTransaction } = useWallet();

  //connection to solana blockchain
  const connection = new Connection("https://api.devnet.solana.com");

  const [solBalance, setSolBalance] = useState(0);

  //fetch sol balance
  const getSolBalance = async () => {
    if (!publicKey) return;
    //getBalance method from the connection object
    const balance = await connection.getBalance(publicKey).then((info) => {
      setSolBalance(info / LAMPORTS_PER_SOL); //lamports is the base measuring unit for sol (9 decimals)
    });
    return balance;
  };

  //airdrop test sol
  const getTestSol = async () => {
    if (!publicKey) return;

    try {
      setIsLoading(true);
      const signature = await connection.requestAirdrop(
        publicKey,
        LAMPORTS_PER_SOL
      );
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      });
      setIsLoading(false);

      alert(`airdrop completed ${signature}`);
    } catch (err) {
      setIsLoading(false);
      alert(`Airdrop limit reached, try again later`);
      console.log("err:", err);
    }
  };

  //send sol
  const sendSol = async () => {
    if (!publicKey) return;

    try {
      setIsSending(true);
      const reciepientPubKey = new PublicKey(reciepientAddress);

      // create a new transaction object
      const tx = new Transaction();

      // add a new system program for transfers
      tx.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: reciepientPubKey,
          lamports: +amount * LAMPORTS_PER_SOL,
        })
      );
      // set the gas fee payer
      tx.feePayer = publicKey;

      // extract the latest block hash and add to the tx object
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.lastValidBlockHeight = lastValidBlockHeight;

      //send the transaction
      const signature = await sendTransaction(tx, connection);

      // confirm the transaction onChain
      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      });

      setSignature(signature);

      alert(`Sol sent successfully`);

      setIsSending(false);
      setAmount("");
      setReciepientAddress("");
    } catch (err) {
      setIsSending(false);
      console.log("err:", err);
    }
    // converts the string to a pubkey object for use
  };

  useEffect(() => {
    getSolBalance();
  }, [publicKey, solBalance]);

  return (
    <div className="m-12">
      {publicKey ? (
        <div className="flex flex-col gap-4">
          <div>
            <p>Get Sol Airdrop</p>
            <button
              onClick={getTestSol}
              disabled={isLoading}
              className="border p-2 my-4 rounded-md bg-purple-600"
            >
              {isLoading ? "Airdropping sol...." : "Get Airdrop"}
            </button>
          </div>
          <hr className="w-[50%]" />
          <p className="text-lg">Your tokens</p>
          <ol>
            <li>Sol Balance : {solBalance}</li>
          </ol>
          <div>
            {/* form component */}
            <form>
              <input
                type="text"
                className="p-2 mr-4 w-[20%] bg-none text-black"
                placeholder="Sol Amount"
                onChange={(e) => setAmount(e.target.value)}
                value={amount}
              />
              <input
                type="text"
                className="p-2 mr-4 w-[20%] bg-none text-black"
                placeholder="Address"
                onChange={(e) => setReciepientAddress(e.target.value)}
                value={reciepientAddress}
              />
              <button
                onClick={sendSol}
                className="border p-2 rounded-md bg-orange-500"
                disabled={isSending}
              >
                {isSending ? "Sending.." : "Send Sol"}
              </button>
            </form>

            {signature ? (
              <a href={`https://solscan.io/tx/${signature}?cluster=devnet`} className="text-blue-700 my-6"
              target="_blank"
              >
                View Transaction on SolScan
              </a>
            ) : (
              ""
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center mx-auto text-2xl">
          <p>Connect Wallet</p>
        </div>
      )}
    </div>
  );
};

export default page;
