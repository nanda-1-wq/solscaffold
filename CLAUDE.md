# SolScaffold

## Project
Full-stack Solana developer toolkit for the 100xDevs Frontier Hackathon.
Stack: Next.js 14 App Router, TypeScript strict, shadcn/ui, Tailwind.

## Commands
- Dev: pnpm dev
- Build: pnpm build
- Lint: pnpm lint

## Rules
- TypeScript strict — no `any`
- shadcn/ui only — no other UI libraries
- Never commit .env.local
- Never git push without my approval
- Mock data first, real SDK calls second
- All Solana ops wrap in try/catch with sonner toast errors

## Stack Constraints
- Next.js 14 App Router (not Pages)
- WalletProvider must be client component only
- All server components are pure data-fetching
- RPC: env var NEXT_PUBLIC_RPC_URL (devnet default)

## Routes
- /           → Landing page + SNS send widget
- /playground → IDL Playground
- /scaffold   → Scaffold Wizard
- /explainer  → Tx Explainer
- /docs       → MDX docs
