"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { toast, Toaster } from "sonner"
import {
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink,
  Clock,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { resolveSolDomain, isValidPubkey } from "@/lib/sns/resolver"
import { sendSol, sendUsdc } from "@/lib/solana/send"

type ResolveStatus = "idle" | "resolving" | "resolved" | "not-found" | "raw-pubkey"
type Token = "SOL" | "USDC"

interface RecentSend {
  recipient: string
  resolvedAddress: string
  amount: string
  token: Token
  signature: string
  timestamp: number
  isMainnet: boolean
}

const STORAGE_KEY = "solscaffold-sends"

function loadRecentSends(): RecentSend[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as RecentSend[]
  } catch {
    return []
  }
}

function saveRecentSend(entry: RecentSend): RecentSend[] {
  const existing = loadRecentSends()
  const updated = [entry, ...existing].slice(0, 5)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  if (diff < 60_000) return "just now"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

function truncate(address: string): string {
  return `${address.slice(0, 8)}...${address.slice(-8)}`
}

export function SendWidget() {
  const { connection } = useConnection()
  const wallet = useWallet()

  const [recipient, setRecipient] = useState("")
  const [resolvedPubkey, setResolvedPubkey] = useState<PublicKey | null>(null)
  const [resolveStatus, setResolveStatus] = useState<ResolveStatus>("idle")
  const [amount, setAmount] = useState("")
  const [token, setToken] = useState<Token>("SOL")
  const [isSending, setIsSending] = useState(false)
  const [recentSends, setRecentSends] = useState<RecentSend[]>([])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setRecentSends(loadRecentSends())
  }, [])

  const resolveRecipient = useCallback(async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setResolveStatus("idle")
      setResolvedPubkey(null)
      return
    }
    if (trimmed.toLowerCase().endsWith(".sol")) {
      setResolveStatus("resolving")
      const pubkey = await resolveSolDomain(trimmed)
      if (pubkey) {
        setResolvedPubkey(pubkey)
        setResolveStatus("resolved")
      } else {
        setResolvedPubkey(null)
        setResolveStatus("not-found")
      }
    } else if (isValidPubkey(trimmed)) {
      setResolvedPubkey(new PublicKey(trimmed))
      setResolveStatus("raw-pubkey")
    } else {
      setResolveStatus("idle")
      setResolvedPubkey(null)
    }
  }, [])

  const handleRecipientChange = useCallback(
    (value: string) => {
      setRecipient(value)
      setResolveStatus("idle")
      setResolvedPubkey(null)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => resolveRecipient(value), 500)
    },
    [resolveRecipient]
  )

  const isMainnet = connection.rpcEndpoint.includes("mainnet")

  const handleSend = async () => {
    if (!resolvedPubkey || !amount || !wallet.connected) return
    setIsSending(true)
    try {
      let signature: string
      if (token === "SOL") {
        signature = await sendSol(connection, wallet, resolvedPubkey, parseFloat(amount))
      } else {
        signature = await sendUsdc(
          connection,
          wallet,
          resolvedPubkey,
          parseFloat(amount),
          isMainnet
        )
      }
      const cluster = isMainnet ? "" : "?cluster=devnet"
      const solscanUrl = `https://solscan.io/tx/${signature}${cluster}`
      toast.success("Sent!", {
        description: (
          <a
            href={solscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 underline"
          >
            View on Solscan <ExternalLink className="h-3 w-3" />
          </a>
        ),
      })
      const entry: RecentSend = {
        recipient,
        resolvedAddress: resolvedPubkey.toBase58(),
        amount,
        token,
        signature,
        timestamp: Date.now(),
        isMainnet,
      }
      setRecentSends(saveRecentSend(entry))
      setAmount("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transaction failed")
    } finally {
      setIsSending(false)
    }
  }

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY)
    setRecentSends([])
  }

  return (
    <>
      <Toaster richColors />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Send on Solana</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recipient */}
          <div className="space-y-1">
            <Input
              placeholder=".sol name or wallet address"
              value={recipient}
              onChange={(e) => handleRecipientChange(e.target.value)}
            />
            {resolveStatus === "resolving" && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Resolving...
              </p>
            )}
            {resolveStatus === "resolved" && resolvedPubkey && (
              <p className="flex items-center gap-1 text-sm text-green-500">
                <CheckCircle className="h-3 w-3" />
                {truncate(resolvedPubkey.toBase58())}
              </p>
            )}
            {resolveStatus === "not-found" && (
              <p className="flex items-center gap-1 text-sm text-red-500">
                <XCircle className="h-3 w-3" />
                .sol name not found
              </p>
            )}
            {resolveStatus === "raw-pubkey" && (
              <p className="flex items-center gap-1 text-sm text-blue-500">
                <Info className="h-3 w-3" />
                Valid address
              </p>
            )}
          </div>

          {/* Amount */}
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          {/* Token toggle */}
          <div className="flex gap-2">
            {(["SOL", "USDC"] as Token[]).map((t) => (
              <Button
                key={t}
                variant={token === t ? "default" : "outline"}
                size="sm"
                onClick={() => setToken(t)}
                className="flex-1"
              >
                {t}
              </Button>
            ))}
          </div>

          {/* Send button */}
          <Button
            className="w-full"
            disabled={!resolvedPubkey || !amount || isSending || !wallet.connected}
            onClick={handleSend}
          >
            {!wallet.connected ? (
              "Connect wallet to send"
            ) : isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              `Send ${amount || "0"} ${token}`
            )}
          </Button>

          {/* Recent sends */}
          {recentSends.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Recent</p>
                <Button variant="ghost" size="sm" onClick={clearHistory}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
              {recentSends.map((send, i) => {
                const cluster = send.isMainnet ? "" : "?cluster=devnet"
                return (
                  <div key={i} className="rounded-md border p-2 text-sm space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">
                        {truncate(send.resolvedAddress)}
                      </span>
                      <span className="text-muted-foreground text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(send.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>
                        {send.amount} {send.token}
                      </span>
                      <a
                        href={`https://solscan.io/tx/${send.signature}${cluster}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1 text-xs"
                      >
                        Solscan <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
