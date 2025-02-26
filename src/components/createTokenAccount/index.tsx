"use client";

import React, { useState } from "react";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import * as token from "@solana/spl-token";

const CreateTokenAccount = ({ mintAddress }: { mintAddress: string }) => {
  const connection = new Connection("https://api.devnet.solana.com");

  const { publicKey, sendTransaction } = useWallet();

  const [accTxn, setAccTxn] = useState("");
  const [accAddress, setAccAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createTokenAccount = async () => {
    if (!publicKey) return;
    if (!mintAddress) {
      alert("no mint address found");
      return;
    }

    try {
      setIsLoading(true);

      console.log("mintAddress:", mintAddress);

      // Convert mintAddress string to PublicKey object
      const mintPublicKey = new PublicKey(mintAddress);

      // Generate new wallet for token account
      const tokenAccount = Keypair.generate();

      // Get token account sizer
      const space = token.ACCOUNT_SIZE;

      // Get rent exemption for the space
      const lamports = await connection.getMinimumBalanceForRentExemption(space);

      const transaction = new Transaction();

      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: tokenAccount.publicKey,
          space,
          lamports,
          programId: token.TOKEN_PROGRAM_ID,
        }),
        // Initialize account instruction with proper PublicKey object
        token.createInitializeAccountInstruction(
          tokenAccount.publicKey,
          mintPublicKey,
          publicKey,
          token.TOKEN_PROGRAM_ID
        )
      );

      console.log("Transaction created");
      console.log("Transaction:", transaction);

      const signature = await sendTransaction(transaction, connection, {
        signers: [tokenAccount],
      });

      console.log("Transaction sent");

      setIsLoading(false);
      setAccAddress(tokenAccount.publicKey.toBase58());
      setAccTxn(signature);
      alert("token account created successfully");
    } catch (error) {
      setIsLoading(false);
      alert("Error creating token account");
      console.log("err:", error);
    }
  };



  return (
    <div className="mx-auto my-24 flex flex-col justify-center text-center">
      {publicKey ? (
        <div>
          <h1 className="text-xl my-4">Create Token Account</h1>
          <button
            onClick={createTokenAccount}
            disabled={isLoading}
            className="bg-orange-500 text-2xl p-2 border-none rounded-md w-fit text-center mx-auto"
          >
            {isLoading ? "Creating..." : "Create Account"}
          </button>

          {accTxn && accAddress ? (
            <div className="my-4 flex flex-col gap-4">
              <p>
                Token Account Address:
                <a
                  href={`https://explorer.solana.com/address/${accAddress}?cluster=devnet`}
                  className="text-blue-700 my-6 mx-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {accAddress.slice(0, 25) + "..."}
                </a>
              </p>
              <p>
                Account Transaction Signature:
                <a
                  href={`https://explorer.solana.com/tx/${accTxn}?cluster=devnet`}
                  className="text-blue-700 my-6 mx-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {accTxn.slice(0, 25) + "..."}
                </a>
              </p>
            </div>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default CreateTokenAccount;
