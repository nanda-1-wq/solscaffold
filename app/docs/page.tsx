"use client";

import Link from "next/link";
import { useState } from "react";

const sections = [
  { id: "getting-started", label: "Getting Started" },
  { id: "idl-playground", label: "IDL Playground" },
  { id: "scaffold-wizard", label: "Scaffold Wizard" },
  { id: "sns-send-widget", label: "SNS Send Widget" },
  { id: "tx-explainer", label: "Tx Explainer" },
  { id: "contributing", label: "Contributing" },
];

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-xl font-semibold text-white mb-4 scroll-mt-24">
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-zinc-200 mt-6 mb-2">{children}</h3>;
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-zinc-900 rounded-lg p-4 text-sm font-mono overflow-x-auto text-green-400 border border-zinc-800 my-4">
      {children}
    </pre>
  );
}

function TryItButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 mt-4 px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
    >
      Try it →
    </Link>
  );
}

function Divider() {
  return <hr className="border-zinc-800 my-10" />;
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <div className="max-w-6xl mx-auto px-4 py-10 flex gap-10">

        {/* Sidebar - desktop */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Documentation
            </p>
            <nav className="flex flex-col gap-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleNavClick(s.id)}
                  className={`text-left text-sm px-3 py-2 rounded-md transition-colors ${
                    activeSection === s.id
                      ? "bg-zinc-800 text-white font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile nav — horizontal scroll */}
        <div className="md:hidden w-full mb-6 -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => handleNavClick(s.id)}
                className={`shrink-0 text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  activeSection === s.id
                    ? "border-violet-500 bg-violet-950 text-violet-300"
                    : "border-zinc-700 text-zinc-400 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-0">

          {/* Getting Started */}
          <section>
            <SectionHeading id="getting-started">Getting Started</SectionHeading>

            <SubHeading>What is SolScaffold?</SubHeading>
            <p className="text-zinc-400 leading-relaxed mb-4">
              SolScaffold is a browser-based Solana developer toolkit built for the 100xDevs Frontier
              Hackathon 2026. It gives you four tools in one place: an IDL Playground to test Anchor
              programs, a Scaffold Wizard to generate full-stack monorepos, an SNS Send Widget to send
              SOL/USDC to <code className="text-violet-400">.sol</code> names, and a Tx Explainer to
              decode any on-chain transaction in plain English.
            </p>

            <SubHeading>Quick Start</SubHeading>
            <CodeBlock>{`git clone https://github.com/nanda-1-wq/solscaffold.git
cd solscaffold
pnpm install
cp .env.example .env.local  # add your RPC URL
pnpm dev`}</CodeBlock>

            <SubHeading>Environment Variables</SubHeading>
            <div className="overflow-x-auto rounded-lg border border-zinc-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900">
                    <th className="text-left px-4 py-3 text-zinc-300 font-semibold">Variable</th>
                    <th className="text-left px-4 py-3 text-zinc-300 font-semibold">Description</th>
                    <th className="text-left px-4 py-3 text-zinc-300 font-semibold">Required</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      key: "NEXT_PUBLIC_RPC_URL",
                      desc: "Your Solana RPC URL (Helius recommended)",
                      req: "Required",
                    },
                    {
                      key: "NEXT_PUBLIC_NETWORK",
                      desc: "devnet or mainnet",
                      req: "Required",
                    },
                    {
                      key: "NEXT_PUBLIC_DEMO_MODE",
                      desc: "true / false - enables mock data fallbacks",
                      req: "Optional",
                    },
                  ].map((row) => (
                    <tr key={row.key} className="border-b border-zinc-800 last:border-0">
                      <td className="px-4 py-3 font-mono text-violet-400 text-xs">{row.key}</td>
                      <td className="px-4 py-3 text-zinc-400">{row.desc}</td>
                      <td className="px-4 py-3 text-zinc-500">{row.req}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <Divider />

          {/* IDL Playground */}
          <section>
            <SectionHeading id="idl-playground">IDL Playground</SectionHeading>

            <p className="text-zinc-400 leading-relaxed mb-4">
              The IDL Playground lets you interact with any Anchor program directly from the browser.
              Paste your IDL JSON, select an instruction, fill in accounts and arguments through a
              generated form UI, and execute the transaction on devnet or mainnet - no frontend code
              required. It&apos;s the fastest way to sanity-check your Anchor program during development.
            </p>

            <SubHeading>How to Use</SubHeading>
            <ol className="list-decimal list-inside space-y-2 text-zinc-400 text-sm">
              <li>Paste your Anchor IDL JSON in the Monaco editor on the left.</li>
              <li>Enter your program ID (or use the one already in the IDL metadata).</li>
              <li>Click <span className="text-white font-medium">&quot;Load IDL&quot;</span> — instruction tabs appear automatically.</li>
              <li>Select an instruction tab for the instruction you want to call.</li>
              <li>Fill in the required accounts and arguments in the generated form.</li>
              <li>Click <span className="text-white font-medium">&quot;Execute on devnet/mainnet&quot;</span> — the transaction is sent and logs appear below.</li>
            </ol>

            <SubHeading>Supported Argument Types</SubHeading>
            <div className="flex flex-wrap gap-2 mt-2">
              {["u64", "u128", "i64", "bool", "publicKey", "string", "bytes", "vec<u8>"].map((t) => (
                <span key={t} className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs font-mono text-violet-400">
                  {t}
                </span>
              ))}
            </div>

            <TryItButton href="/playground" />
          </section>

          <Divider />

          {/* Scaffold Wizard */}
          <section>
            <SectionHeading id="scaffold-wizard">Scaffold Wizard</SectionHeading>

            <p className="text-zinc-400 leading-relaxed mb-4">
              The Scaffold Wizard generates a production-ready Next.js 14 + Anchor monorepo in three
              steps. Give it a project name, pick your optional features, and download a ZIP that&apos;s
              ready to run. Every generated project includes wallet adapter, RPC configuration, and
              a basic program integration out of the box.
            </p>

            <SubHeading>What Gets Generated</SubHeading>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-sm">
              <li><code className="text-violet-400">app/</code> — Next.js 14 App Router pages and layouts</li>
              <li><code className="text-violet-400">components/WalletProvider.tsx</code> — pre-wired wallet adapter</li>
              <li><code className="text-violet-400">programs/</code> — Anchor program scaffold with basic instruction</li>
              <li><code className="text-violet-400">tests/</code> — Anchor test file with mocha setup</li>
              <li><code className="text-violet-400">Anchor.toml</code> — configured for devnet</li>
              <li><code className="text-violet-400">.env.local</code> — RPC URL placeholder</li>
              <li><code className="text-violet-400">package.json</code> + <code className="text-violet-400">pnpm-workspace.yaml</code></li>
            </ul>

            <SubHeading>Optional Features</SubHeading>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {[
                { name: "SNS Integration", desc: "Bonfida name service" },
                { name: "USDC Support", desc: "SPL token send/receive" },
                { name: "NFT Minting", desc: "Metaplex foundation" },
                { name: "Token-2022", desc: "New token extensions" },
                { name: "MagicBlock", desc: "Ephemeral rollups" },
              ].map((f) => (
                <div key={f.name} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-white">{f.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>

            <TryItButton href="/scaffold" />
          </section>

          <Divider />

          {/* SNS Send Widget */}
          <section>
            <SectionHeading id="sns-send-widget">SNS Send Widget</SectionHeading>

            <p className="text-zinc-400 leading-relaxed mb-4">
              SNS (Solana Name Service) is a decentralized naming system that maps human-readable{" "}
              <code className="text-violet-400">.sol</code> names to wallet addresses - like DNS for
              Solana. The SNS Send Widget lets you send SOL or USDC to any{" "}
              <code className="text-violet-400">.sol</code> name or raw public key without leaving
              the page.
            </p>

            <SubHeading>How to Use</SubHeading>
            <ol className="list-decimal list-inside space-y-2 text-zinc-400 text-sm">
              <li>Connect your wallet using the button in the top nav.</li>
              <li>Enter a <code className="text-violet-400">.sol</code> name (e.g. <code className="text-zinc-300">alice.sol</code>) or a raw wallet address.</li>
              <li>Choose SOL or USDC and enter an amount.</li>
              <li>Click <span className="text-white font-medium">&quot;Send&quot;</span> — sign the transaction in your wallet.</li>
            </ol>

            <div className="mt-4 p-4 bg-amber-950/30 border border-amber-800/50 rounded-lg text-sm text-amber-300">
              <strong>Note:</strong> SNS resolution runs on mainnet because that&apos;s where real{" "}
              <code>.sol</code> names live. Your wallet can still be on devnet — only the name lookup
              hits mainnet.
            </div>

            <TryItButton href="/" />
          </section>

          <Divider />

          {/* Tx Explainer */}
          <section>
            <SectionHeading id="tx-explainer">Tx Explainer</SectionHeading>

            <p className="text-zinc-400 leading-relaxed mb-4">
              Paste any Solana transaction signature and get a complete human-readable breakdown:
              who sent what to whom, which programs were invoked, what accounts changed balance, and
              a step-by-step timeline of every instruction and inner instruction in the transaction.
            </p>

            <SubHeading>What It Shows</SubHeading>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-sm">
              <li>Fee payer and transaction fee</li>
              <li>SOL balance changes for every account involved</li>
              <li>SPL token transfers and mint/burn events</li>
              <li>Program logs and compute units consumed</li>
              <li>Inner instruction trace with call depth</li>
              <li>Instruction-by-instruction timeline</li>
            </ul>

            <SubHeading>Supported Programs</SubHeading>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                "System Program",
                "SPL Token",
                "Token-2022",
                "Associated Token Account",
                "Anchor Programs",
                "Metaplex",
                "Serum/OpenBook",
                "Memo Program",
              ].map((p) => (
                <span key={p} className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-300">
                  {p}
                </span>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-950/30 border border-blue-800/50 rounded-lg text-sm text-blue-300">
              <strong>Tip:</strong> RPC nodes only retain transaction history for a limited window
              (typically ~2–4 days on devnet). For older transactions, use a dedicated archival RPC
              like Helius or Triton with full history enabled.
            </div>

            <TryItButton href="/explainer" />
          </section>

          <Divider />

          {/* Contributing */}
          <section>
            <SectionHeading id="contributing">Contributing</SectionHeading>

            <p className="text-zinc-400 leading-relaxed mb-4">
              SolScaffold is open source and contributions are welcome. Bug reports, feature
              requests, and pull requests are all appreciated.
            </p>

            <CodeBlock>{`# Fork → clone → branch → PR
git clone https://github.com/nanda-1-wq/solscaffold.git
cd solscaffold
git checkout -b feat/your-feature
pnpm install && pnpm dev
# make your changes, then open a PR`}</CodeBlock>

            <div className="mt-6 p-6 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
              <p className="text-zinc-400 text-sm mb-1">
                Built for the <span className="text-white font-semibold">100xDevs Frontier Hackathon 2026</span>
              </p>
              <p className="text-zinc-500 text-sm mb-4">
                Star the repo if this helped you learn Solana
              </p>
              <a
                href="https://github.com/nanda-1-wq/solscaffold"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-colors border border-zinc-700"
              >
                View on GitHub →
              </a>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
