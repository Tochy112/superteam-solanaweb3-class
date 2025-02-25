"use client";

import {
  Connection,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingSol, setIsSendingSol] = useState(false);
  const [isSendingToken, setIsSendingToken] = useState(false);
  const [reciepientAddress, setReciepientAddress] = useState("");
  const [reciepientTokenAddress, setReciepientTokenAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [splAmount, setSplAmount] = useState("");
  const [signature, setSignature] = useState("");
  const [solBalance, setSolBalance] = useState(0);
  const [selectedToken, setSelectedToken] = useState<string | "">();

  const [tokens, setTokens] = useState<any[]>([]);

  //used to fetch the pubkey of the connected wallet
  const { publicKey, sendTransaction } = useWallet();

  const cancelSelectedToken = () => {
    setSelectedToken("");
    setSplAmount("");
    setIsSendingToken(false);
    setReciepientTokenAddress("");
  };

  //connection to solana blockchain
  const connection = new Connection("https://api.devnet.solana.com");

  useEffect(() => {
    getSolBalance();
    getSplTokens();
  }, [publicKey, solBalance]);

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
      setIsSendingSol(true);

      // converts the string to a pubkey object for use
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

      setIsSendingSol(false);
      setAmount("");
      setReciepientAddress("");
    } catch (err) {
      setIsSendingSol(false);
      setAmount("");
      setReciepientAddress("");
      console.log("err:", err);
    }
  };

  // function to fetch user spl tokens
  const getSplTokens = async () => {
    if (!publicKey) return;

    // get all tokens available in the wallet, passing the pubkey and the token ID
    const userTokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );

    // map through the token account and return
    const userTokens = Promise.all(
      userTokenAccounts.value.map((accounts) => {
        const token = accounts.account.data.parsed.info;
        return {
          mint: token.mint,
          balance: token.tokenAmount.uiAmountString,
        };
      })
    );
    //set token
    setTokens(await userTokens);
  };

  //Send SPL TOkens
  const sendSplToken = async (mint: string) => {
    if (!publicKey) return;

    try {
      setIsSendingToken(true);

      // set reciepient key
      const reciepientPubKey = new PublicKey(reciepientTokenAddress);

      console.log("reciepientTokenAddress:", reciepientTokenAddress);
      console.log(
        "amount:",
        +splAmount //the token amount to be sent
      );

      // get token mint address
      const mintPubKey = new PublicKey(mint);

      // create a new transaction object
      const tx = new Transaction();

      // fetch the associated wallet token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(
        mintPubKey,
        publicKey
      );
      const toTokenAccount = await getAssociatedTokenAddress(
        mintPubKey,
        reciepientPubKey
      );

      // create a token account for the reciever if there's none
      const checkATA = await connection.getAccountInfo(toTokenAccount);
      if (!checkATA) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            toTokenAccount,
            reciepientPubKey,
            mintPubKey
          )
        );
      }

      // get token decimal
      const decimal = await getTokenDecimals(mintPubKey);

      const bigInt = +splAmount * Math.pow(10, decimal);

      // create a transfer instruction
      tx.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          publicKey,
          bigInt //the token amount to be sent
        )
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

      alert(`token sent successfully`);

      setSplAmount("");
      setIsSendingToken(false);
      setReciepientTokenAddress("");
    } catch (err) {
      setSplAmount("");
      setIsSendingToken(false);
      setReciepientTokenAddress("");
      console.log("err:", err);
      alert(err)
    }
  };

  // method to fetch token decimal
  const getTokenDecimals = async (mint: PublicKey) => {
    const info = await connection.getParsedAccountInfo(mint);

    if (!info.value) {
        throw Error("Failed to fetch Decimal")
    }

    return (info.value.data as ParsedAccountData).parsed.info.decimals as number
}


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
            <p className="text-lg mt-12 mb-6">Send SOL</p>
            <form>
              <input
                type="text"
                className="p-2 mr-4 w-[20%] bg-none text-black"
                placeholder="Sol Amount"
                onChange={(e) => setAmount(e.target.value)}
                value={amount}
                required
              />
              <input
                type="text"
                className="p-2 mr-4 w-[20%] bg-none text-black"
                placeholder="Address"
                onChange={(e) => setReciepientAddress(e.target.value)}
                value={reciepientAddress}
                required
              />
              <button
                onClick={sendSol}
                className="border p-2 rounded-md bg-orange-500"
                disabled={isSendingSol}
              >
                {isSendingSol ? "Sending.." : "Send Sol"}
              </button>
            </form>

            {signature ? (
              <a
                href={`https://solscan.io/tx/${signature}?cluster=devnet`}
                className="text-blue-700 my-6"
                target="_blank"
              >
                View Transaction on SolScan
              </a>
            ) : (
              ""
            )}
          </div>

          <div>
            {/* form component */}

            <p className="text-lg mt-12 mb-6">Send SPL Token</p>

            <form>
              <div>
                {tokens
                  ? tokens.map((token: any) => {
                      return (
                        <div key={token.mint}>
                          <p>
                            {token.mint}: {token.balance} tokens
                          </p>
                          {selectedToken === token.mint ? (
                            <>
                              <input
                                type="text"
                                className="p-2 mr-4 w-[20%] mb-4 bg-none text-black"
                                placeholder="Token Amount"
                                onChange={(e) => setSplAmount(e.target.value)}
                                value={splAmount}
                                required
                              />

                              <input
                                type="text"
                                className="p-2 mr-4 w-[20%] bg-none text-black"
                                placeholder="Address"
                                onChange={(e) =>
                                  setReciepientTokenAddress(e.target.value)
                                }
                                value={reciepientTokenAddress}
                                required
                              />

                              <div className="inline gap-4 ">
                                <button
                                  onClick={() => sendSplToken(token.mint)}
                                  className="border p-2 rounded-md bg-orange-500"
                                  disabled={isSendingToken}
                                >
                                  {isSendingToken ? "Sending.." : "Send Token"}
                                </button>

                                <button
                                  onClick={cancelSelectedToken}
                                  className="border p-2 ml-4 rounded-md bg-red-500"
                                  disabled={isSendingToken}
                                >
                                  cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedToken(token.mint)}
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-2 items-end"
                            >
                              Select
                            </button>
                          )}
                        </div>
                      );
                    })
                  : "No tokens found in the wallet"}
              </div>
            </form>

            {signature ? (
              <a
                href={`https://solscan.io/tx/${signature}?cluster=devnet`}
                className="text-blue-700 my-6"
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
