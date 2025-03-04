import { Keypair } from "@solana/web3.js";

const CreateWallet = () => {
  // the generate method is used to generate a new random wallet keypair
  const create = Keypair.generate();
  return create;
};

export default CreateWallet;
