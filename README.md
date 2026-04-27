# SolScaffold

> **The Solana Developer Toolkit** — built for the 100xDevs Frontier Hackathon 2026.

SolScaffold is an all-in-one browser-based toolkit that helps Solana developers move faster: explore transactions, scaffold full-stack dApps, interact with Anchor programs, and send SOL/USDC to `.sol` names — all without leaving the browser.

**Live:** [https://solscaffold.vercel.app](https://solscaffold.vercel.app)

---

## Features

###  IDL Playground
Paste any Anchor IDL, get a working form UI instantly. Select an instruction, fill in the accounts and arguments, and execute on devnet or mainnet — no frontend code required. Great for testing your Anchor programs as you build.

###  Scaffold Wizard
Generate a full Next.js 14 + Anchor monorepo in 3 steps. Pick your optional features (SNS, USDC, NFT, Token-2022, MagicBlock), and download a ready-to-go ZIP with wallets, RPC, and program integration pre-wired.

###  SNS Send Widget
Send SOL or USDC to any `.sol` name or raw wallet address directly from the landing page. SNS resolution runs on mainnet so it works with real Bonfida names — no copy-pasting long addresses.

###  Tx Explainer
Paste any transaction signature and get a human-readable breakdown: balance changes, program logs, inner instructions, and a step-by-step timeline. Supports SPL Token, System Program, Anchor programs, and more.

---

## Quick Start

```bash
git clone https://github.com/nanda-1-wq/solscaffold.git
cd solscaffold
pnpm install
cp .env.example .env.local  # add your RPC URL
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you're in.

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_RPC_URL` | Your Solana RPC URL ([Helius](https://helius.dev) recommended) | Required |
| `NEXT_PUBLIC_NETWORK` | `devnet` or `mainnet` | Required |
| `NEXT_PUBLIC_DEMO_MODE` | `true` or `false` — enables mock data fallbacks | Optional |

> **Tip:** Helius gives you a free RPC endpoint with high rate limits. Sign up at [helius.dev](https://helius.dev) and paste the URL into `.env.local`.

---

## Architecture

```
solscaffold/
├── app/
│   ├── page.tsx          # Landing page + SNS Send Widget
│   ├── playground/       # IDL Playground
│   ├── scaffold/         # Scaffold Wizard
│   ├── explainer/        # Tx Explainer
│   └── docs/             # This documentation
├── components/
│   └── shared/           # TopNav, Footer, WalletProvider
└── public/
```

**Stack:**

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Solana | `@coral-xyz/anchor`, `@solana/web3.js` |
| Wallets | `@solana/wallet-adapter-react` |
| SNS | `@bonfida/spl-name-service` |
| IDL Editor | `@monaco-editor/react` |
| Scaffold ZIP | `jszip` |

---

## For 100xDevs Students

If you're working through the 100xDevs Solana curriculum, this toolkit is built for you.

**Building your first Anchor program?**
Use the **IDL Playground** to test your instructions without writing a single line of frontend code. Paste the IDL from your `target/idl/` folder, enter your program ID, and start calling instructions immediately.

**Starting a new project?**
Use the **Scaffold Wizard** to generate a production-ready monorepo with wallets, RPC, and your chosen Anchor program already wired in. It saves hours of boilerplate and lets you focus on program logic.

**Confused about what a transaction actually did?**
Use the **Tx Explainer** to see exactly which accounts changed, what programs were called, and what logs were emitted — in plain English. Paste a devnet signature from your `anchor test` output and trace through every step.

---

## Roadmap

- [ ] Mainnet deployment
- [ ] SNS reverse lookup (address → `.sol` name)
- [ ] Token-2022 support in SNS Send Widget
- [ ] AI-powered transaction explanation
- [ ] Anchor IDL fetching from on-chain program ID
- [ ] Shareable scaffold templates
- [ ] Anchor test runner in the browser

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

```bash
# Fork → clone → branch → PR
git checkout -b feat/your-feature
pnpm dev
# make changes, test, then open a PR
```

---

## License

MIT — free to use, modify, and ship.

---

Built by [@3Desso](https://github.com/nanda-1-wq) for the **100xDevs Frontier Hackathon 2026**.

> _Star the repo if this helped you learn Solana_ 
