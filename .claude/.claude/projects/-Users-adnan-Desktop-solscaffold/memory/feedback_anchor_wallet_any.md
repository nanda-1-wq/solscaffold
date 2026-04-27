---
name: Anchor wallet any cast
description: Keep wallet parameter as any in program-caller.ts and playground — Anchor/wallet-adapter type conflict
type: feedback
---

Do not type the `wallet` parameter in `lib/anchor/program-caller.ts` as `Wallet` from `@coral-xyz/anchor`. Keep it as `any`, and keep the `wallet as any` cast in `app/playground/page.tsx`.

**Why:** `Wallet` from `@coral-xyz/anchor` conflicts with `AnchorWallet` from `@solana/wallet-adapter-react` — the types are not assignable despite looking structurally similar. The `any` cast is the correct and intentional solution here.

**How to apply:** Never change these two spots during audits or refactors. The eslint-disable comment on the `wallet: any` line is there to acknowledge the intentional use.
