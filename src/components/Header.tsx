"use client"

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React from "react";

const Header = () => {
  return (
    <div className="flex justify-between gap-4 p-4">
        <h1 className="text-lg">tochy0x</h1>
      <WalletMultiButton className=""/>
    </div>
  );
};

export default Header;
