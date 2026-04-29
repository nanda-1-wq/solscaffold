import { Connection } from "@solana/web3.js"

export type ExplainedInstruction = {
  index: number
  programId: string
  programName: string
  programColor: string
  summary: string
  isKnown: boolean
  rawAccounts?: string[]
  rawData?: string
  innerInstructions?: ExplainedInstruction[]
}

export type ExplainedTransaction = {
  signature: string
  slot: number
  blockTime: Date | null
  feeSol: number
  feePayer: string
  computeUnitsConsumed: number | null
  failed: boolean
  errorMessage: string | null
  instructions: ExplainedInstruction[]
  solBalanceChanges: { pubkey: string; deltaSol: number; preSol: number; postSol: number }[]
  tokenBalanceChanges: { tokenAccount: string; owner: string | undefined; mint: string; deltaUi: number; preUi: number; postUi: number }[]
  logMessages: string[]
}

export const KNOWN_PROGRAMS: Record<string, { name: string; color: string }> = {
  "11111111111111111111111111111111": { name: "System Program", color: "text-blue-400" },
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA": { name: "Token Program", color: "text-purple-400" },
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL": { name: "Associated Token", color: "text-purple-300" },
  "ComputeBudget111111111111111111111111111111": { name: "Compute Budget", color: "text-zinc-400" },
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr": { name: "Memo", color: "text-yellow-400" },
  "Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo": { name: "Memo v1", color: "text-yellow-400" },
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb": { name: "Token-2022", color: "text-violet-400" },
  "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4": { name: "Jupiter v6", color: "text-green-400" },
  "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin": { name: "Serum DEX v3", color: "text-green-300" },
  "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc": { name: "Orca Whirlpools", color: "text-cyan-400" },
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": { name: "Raydium AMM", color: "text-orange-400" },
}

function short(pubkey: string): string {
  return `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}`
}

function capitalize(s: string): string {
  if (!s) return "Instruction"
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function isParsedInstruction(ix: unknown): boolean {
  return typeof ix === "object" && ix !== null && "parsed" in ix
}

export function summarizeInstruction(ix: unknown, index: number): ExplainedInstruction {
  const ixObj = ix as Record<string, unknown>
  const programId =
    ixObj.programId && typeof (ixObj.programId as { toBase58?: () => string }).toBase58 === "function"
      ? (ixObj.programId as { toBase58: () => string }).toBase58()
      : String(ixObj.programId ?? "")

  const known = KNOWN_PROGRAMS[programId]
  const programName = known?.name ?? "Unknown Program"
  const programColor = known?.color ?? "text-zinc-500"
  const isKnown = !!known

  if (isParsedInstruction(ix)) {
    const parsed = ixObj.parsed as Record<string, unknown>
    const program = String(ixObj.program ?? "")
    const parsedType = typeof parsed === "object" && parsed !== null ? String(parsed.type ?? "") : ""
    const info =
      typeof parsed === "object" && parsed !== null && "info" in parsed
        ? (parsed.info as Record<string, unknown>)
        : {}

    let summary = "Instruction"

    if (program === "system") {
      switch (parsedType) {
        case "transfer":
          const solAmount = Number(info.lamports ?? 0) / 1e9
          const solDisplay = solAmount.toFixed(9).replace(/\.?0+$/, '') || '0'
          summary = `Sent ${solDisplay} SOL to ${short(String(info.destination ?? ""))}`
          break
        case "createAccount":
          summary = `Created account ${short(String(info.newAccount ?? ""))} (${info.space} bytes)`
          break
        default:
          summary = capitalize(parsedType)
      }
    } else if (program === "spl-token" || program === "spl-token-2022") {
      switch (parsedType) {
        case "transferChecked": {
          const tokenAmount = info.tokenAmount as Record<string, unknown> | undefined
          summary = `Transferred ${tokenAmount?.uiAmountString ?? "?"} tokens to ${short(String(info.destination ?? ""))}`
          break
        }
        case "transfer":
          summary = `Transferred ${info.amount} raw tokens to ${short(String(info.destination ?? ""))}`
          break
        case "mintTo":
        case "mintToChecked":
          summary = `Minted tokens to ${short(String(info.account ?? ""))}`
          break
        case "burn":
        case "burnChecked":
          summary = `Burned tokens from ${short(String(info.account ?? ""))}`
          break
        case "closeAccount":
          summary = `Closed token account ${short(String(info.account ?? ""))}`
          break
        case "initializeAccount":
          summary = `Initialized token account for ${short(String(info.owner ?? ""))}`
          break
        default:
          summary = capitalize(parsedType)
      }
    } else if (program === "spl-associated-token-account") {
      if (parsedType === "create" || parsedType === "createIdempotent") {
        summary = `Created token account for ${short(String(info.wallet ?? ""))}`
      } else {
        summary = capitalize(parsedType) || "Instruction"
      }
    } else if (program === "compute-budget") {
      switch (parsedType) {
        case "setComputeUnitLimit":
          summary = `Set compute limit: ${Number(info.units).toLocaleString()} CUs`
          break
        case "setComputeUnitPrice":
          summary = `Set priority fee: ${info.microLamports} micro-lamports/CU`
          break
        default:
          summary = capitalize(parsedType)
      }
    } else if (program === "spl-memo") {
      if (typeof parsed === "string") {
        summary = `Memo: "${ixObj.parsed}"`
      } else {
        summary = capitalize(parsedType) || "Memo"
      }
    } else {
      summary = capitalize(parsedType) || "Instruction"
    }

    return { index, programId, programName, programColor, summary, isKnown }
  } else {
    // PartiallyDecodedInstruction
    const accounts = ixObj.accounts as { toBase58?: () => string }[] | undefined
    const rawAccounts = accounts?.map((a) =>
      typeof a.toBase58 === "function" ? a.toBase58() : String(a)
    ) ?? []
    const rawData = String(ixObj.data ?? "")
    const summary = `Called ${programName} with ${rawAccounts.length} accounts`

    return { index, programId, programName, programColor, summary, isKnown, rawAccounts, rawData }
  }
}

export async function explainTransaction(
  connection: Connection,
  signature: string
): Promise<ExplainedTransaction> {
  const tx = await connection.getParsedTransaction(signature, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  })

  if (!tx) {
    throw new Error(
      "Transaction not found. It may be older than your RPC's retention window (~5 days for public RPCs). Try a transaction from the last few days."
    )
  }

  const { meta, slot, blockTime, transaction } = tx

  if (!meta) {
    throw new Error("Transaction metadata unavailable")
  }

  const feeSol = (meta.fee ?? 0) / 1e9
  const feePayer =
    transaction.message.accountKeys[0]?.pubkey?.toBase58?.() ?? ""
  const computeUnitsConsumed = meta.computeUnitsConsumed ?? null
  const failed = !!meta.err
  const errorMessage = failed ? JSON.stringify(meta.err) : null

  // Build inner instructions map: parentIndex → inner ix array
  const innerMap = new Map<number, ExplainedInstruction[]>()
  for (const innerGroup of meta.innerInstructions ?? []) {
    const parentIndex = innerGroup.index
    const inners = innerGroup.instructions.map((inner, i) =>
      summarizeInstruction(inner, i)
    )
    innerMap.set(parentIndex, inners)
  }

  const instructions: ExplainedInstruction[] = transaction.message.instructions.map(
    (ix, i) => {
      const explained = summarizeInstruction(ix, i)
      const inner = innerMap.get(i)
      if (inner && inner.length > 0) {
        explained.innerInstructions = inner
      }
      return explained
    }
  )

  // SOL balance changes
  const accountKeys = transaction.message.accountKeys
  const preBalances = meta.preBalances ?? []
  const postBalances = meta.postBalances ?? []
  const solBalanceChanges = accountKeys.map((key, i) => {
    const pre = preBalances[i] ?? 0
    const post = postBalances[i] ?? 0
    return {
      pubkey: key.pubkey?.toBase58?.() ?? "",
      preSol: pre / 1e9,
      postSol: post / 1e9,
      deltaSol: (post - pre) / 1e9,
    }
  })

  // Token balance changes
  const preTokenBalances = meta.preTokenBalances ?? []
  const postTokenBalances = meta.postTokenBalances ?? []

  const tokenMap = new Map<
    string,
    { pre: number; post: number; mint: string; owner: string | undefined }
  >()

  for (const tb of preTokenBalances) {
    const key = `${tb.accountIndex}:${tb.mint}`
    tokenMap.set(key, {
      pre: tb.uiTokenAmount.uiAmount ?? 0,
      post: 0,
      mint: tb.mint,
      owner: tb.owner,
    })
  }
  for (const tb of postTokenBalances) {
    const key = `${tb.accountIndex}:${tb.mint}`
    const existing = tokenMap.get(key)
    if (existing) {
      existing.post = tb.uiTokenAmount.uiAmount ?? 0
    } else {
      tokenMap.set(key, {
        pre: 0,
        post: tb.uiTokenAmount.uiAmount ?? 0,
        mint: tb.mint,
        owner: tb.owner,
      })
    }
  }

  const tokenBalanceChanges = Array.from(tokenMap.entries()).map(([key, val]) => {
    const accountIndex = parseInt(key.split(":")[0])
    const tokenAccount = accountKeys[accountIndex]?.pubkey?.toBase58?.() ?? ""
    return {
      tokenAccount,
      owner: val.owner,
      mint: val.mint,
      preUi: val.pre,
      postUi: val.post,
      deltaUi: val.post - val.pre,
    }
  })

  const logMessages = meta.logMessages ?? []

  return {
    signature,
    slot,
    blockTime: blockTime ? new Date(blockTime * 1000) : null,
    feeSol,
    feePayer,
    computeUnitsConsumed,
    failed,
    errorMessage,
    instructions,
    solBalanceChanges,
    tokenBalanceChanges,
    logMessages,
  }
}
