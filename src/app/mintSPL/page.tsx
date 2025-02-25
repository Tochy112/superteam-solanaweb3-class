"use client";

import React, { useState } from "react";
import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import * as token from "@solana/spl-token";
// import { FaExternalLinkAlt } from "react-icons/fa";

const mintSPL = () => {
  const [txnSignature, setTxnSignature] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  //connection to solana blockchain
  const connection = new Connection("https://api.devnet.solana.com");

  const { publicKey, sendTransaction } = useWallet();

  const createMint = async () => {
    if (!publicKey) return;

    try {
      setIsLoading(true);
      // generate a new wallet
      const tokenMint = Keypair.generate();
      // checks balance for rent exempt for the token
      const lamports = await token.getMinimumBalanceForRentExemptAccount(
        connection
      );

      //initialize the txn object
      const transaction = new Transaction();

      // create mint account and initialize minting
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: tokenMint.publicKey,
          space: token.MINT_SIZE,
          lamports,
          programId: token.TOKEN_PROGRAM_ID,
        }),
        token.createInitializeMintInstruction(
          tokenMint.publicKey,
          6,
          publicKey,
          null,
          token.TOKEN_PROGRAM_ID
        )
      );
      // send transaction
      const signature = await sendTransaction(transaction, connection, {
        signers: [tokenMint],
      });

      setIsLoading(false);
      setTxnSignature(signature);
      setMintAddress(tokenMint.publicKey.toBase58());
      alert("token mint succssful");
    } catch (error) {
      setIsLoading(false);
      console.log("error:", error);
      throw new Error("An error occured while minting token");
    }
  };

  return (
    <div className="mx-auto my-[30vh] flex flex-col justify-center text-center">
      {publicKey ? (
        <div>
          <h1 className="text-xl my-4">Create Token Mint</h1>
          <button
            onClick={createMint}
            disabled={isLoading}
            className="bg-orange-500 text-2xl p-2 border-none rounded-md w-fit text-center mx-auto"
          >
            {isLoading ? "minting..." : "Create Mint"}
          </button>

          {txnSignature && mintAddress ? (
            <div className="my-4 flex flex-col gap-4">
              <p>
                Token Mint Address:
                <a
                  href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`}
                  className="text-blue-700 my-6 mx-4"
                  target="_blank"
                >
                  {mintAddress.slice(0, 25) +"..."} 
                </a>
              </p>
              <p>
                Mint Transaction Signature:
                <a
                  href={`https://explorer.solana.com/tx/${txnSignature}?cluster=devnet`}
                  className="text-blue-700 my-6 mx-4"
                  target="_blank"
                >
                  {txnSignature.slice(0, 25) +"..."}
                </a>
              </p>
            </div>
          ) : (
            ""
          )}
        </div>
      ) : (
        <p className="text-bold text-2xl">Please connect wallet</p>
      )}
    </div>
  );
};

export default mintSPL;
