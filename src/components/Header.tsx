"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <div className="flex justify-between gap-4 p-4">
      <h1 className="text-lg">
        <Link href="/">tochy0x</Link>
      </h1>
      <div className="flex items-center gap-4">
        <a href="/mintSPL" className="text-xl underline underline-offset-1">
          Mint
        </a>
        <a
          href="/SendSolAndSPL"
          className="text-xl underline underline-offset-1"
        >
          Send
        </a>
        <WalletMultiButton className="p-0" />
      </div>
    </div>
  );
};

export default Header;
