import { Connection, PublicKey } from "@solana/web3.js"
import { resolve } from "@bonfida/spl-name-service"

// SNS only works on mainnet — hardcode mainnet RPC for resolution
const MAINNET_RPC = "https://api.mainnet-beta.solana.com"
const mainnetConnection = new Connection(MAINNET_RPC, "confirmed")

export async function resolveSolDomain(input: string): Promise<PublicKey | null> {
  const normalized = input.trim().toLowerCase().replace(/\.sol$/, "")
  if (!normalized) return null
  try {
    return await resolve(mainnetConnection, normalized)
  } catch {
    return null
  }
}

export function isValidPubkey(input: string): boolean {
  try {
    new PublicKey(input)
    return true
  } catch {
    return false
  }
}
