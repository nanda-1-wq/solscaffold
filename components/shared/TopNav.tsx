"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useNetwork } from "@/lib/solana/wallet-provider";

const NAV_LINKS = [
  { href: "/playground", label: "Playground" },
  { href: "/scaffold", label: "Scaffold" },
  { href: "/explainer", label: "Explainer" },
  { href: "/docs", label: "Docs" },
] as const;

export function TopNav() {
  const { network, toggleNetwork } = useNetwork();

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-zinc-950 border-b border-zinc-800 flex items-center px-6">
      <div className="flex items-center gap-8 flex-1">
        <Link href="/" className="font-mono font-bold text-zinc-100 text-lg tracking-tight">
          SolScaffold
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleNetwork}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            network === "devnet"
              ? "bg-green-950 text-green-400 border-green-800 hover:bg-green-900"
              : "bg-yellow-950 text-yellow-400 border-yellow-800 hover:bg-yellow-900"
          }`}
        >
          {network}
        </button>

        <WalletMultiButton
          style={{
            height: "36px",
            fontSize: "13px",
            padding: "0 16px",
            borderRadius: "8px",
          }}
        />
      </div>
    </header>
  );
}
