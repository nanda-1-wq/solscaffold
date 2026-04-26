"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

type Network = "devnet" | "mainnet";

const STORAGE_KEY = "solscaffold-network";

const RPC: Record<Network, string> = {
  devnet: process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com",
  mainnet: "https://api.mainnet-beta.solana.com",
};

let listeners: Array<(n: Network) => void> = [];
let currentNetwork: Network = "devnet";

function getStoredNetwork(): Network {
  if (typeof window === "undefined") return "devnet";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "mainnet" ? "mainnet" : "devnet";
}

export function useNetwork(): { network: Network; toggleNetwork: () => void } {
  const [network, setNetwork] = useState<Network>("devnet");

  useEffect(() => {
    const stored = getStoredNetwork();
    setNetwork(stored);
    currentNetwork = stored;

    const handler = (n: Network) => setNetwork(n);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  const toggleNetwork = useCallback(() => {
    const next: Network = currentNetwork === "devnet" ? "mainnet" : "devnet";
    currentNetwork = next;
    localStorage.setItem(STORAGE_KEY, next);
    listeners.forEach((l) => l(next));
  }, []);

  return { network, toggleNetwork };
}

export default function SolanaProviders({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<Network>("devnet");

  useEffect(() => {
    const stored = getStoredNetwork();
    setNetwork(stored);
    currentNetwork = stored;

    const handler = (n: Network) => setNetwork(n);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  const endpoint = RPC[network];

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
