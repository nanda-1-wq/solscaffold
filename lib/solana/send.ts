import {
  Connection,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js"
import {
  getAssociatedTokenAddress,
  getAccount,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token"
import type { WalletContextState } from "@solana/wallet-adapter-react"

export async function sendSol(
  connection: Connection,
  wallet: WalletContextState,
  recipient: PublicKey,
  amountSol: number
): Promise<string> {
  if (!wallet.publicKey) throw new Error("Wallet not connected")

  const lamports = Math.round(amountSol * LAMPORTS_PER_SOL)
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: recipient,
      lamports,
    })
  )

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = wallet.publicKey

  const signature = await wallet.sendTransaction(transaction, connection)
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight })
  return signature
}

const USDC_MINT_MAINNET = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
)
const USDC_MINT_DEVNET = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
)

export async function sendUsdc(
  connection: Connection,
  wallet: WalletContextState,
  recipient: PublicKey,
  amountUsdc: number,
  isMainnet: boolean
): Promise<string> {
  if (!wallet.publicKey) throw new Error("Wallet not connected")

  const mint = isMainnet ? USDC_MINT_MAINNET : USDC_MINT_DEVNET
  const senderAta = await getAssociatedTokenAddress(mint, wallet.publicKey)
  const recipientAta = await getAssociatedTokenAddress(mint, recipient)

  const transaction = new Transaction()

  try {
    await getAccount(connection, recipientAta)
  } catch {
    // Recipient ATA doesn't exist — prepend creation instruction
    transaction.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        recipientAta,
        recipient,
        mint
      )
    )
  }

  transaction.add(
    createTransferCheckedInstruction(
      senderAta,
      mint,
      recipientAta,
      wallet.publicKey,
      BigInt(Math.round(amountUsdc * 1e6)),
      6
    )
  )

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = wallet.publicKey

  const signature = await wallet.sendTransaction(transaction, connection)
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight })
  return signature
}
