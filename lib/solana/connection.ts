import { Connection } from "@solana/web3.js";

const rpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";

export const connection = new Connection(rpcUrl, "confirmed");
