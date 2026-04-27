"use client"

import { useState, useEffect, useCallback } from "react"
import { ClipboardPaste, Loader2, Clock, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Toaster } from "sonner"
import { Connection } from "@solana/web3.js"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TxTimeline } from "@/components/explainer/TxTimeline"
import { explainTransaction, type ExplainedTransaction } from "@/lib/solana/tx-explainer"

const HISTORY_KEY = "solscaffold-tx-history"
const MAX_HISTORY = 10

type HistoryEntry = {
  signature: string
  timestamp: number
}

function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]")
  } catch {
    return []
  }
}

function saveToHistory(signature: string): void {
  const history = getHistory().filter((e) => e.signature !== signature)
  history.unshift({ signature, timestamp: Date.now() })
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)))
}

function short(s: string): string {
  if (s.length <= 16) return s
  return `${s.slice(0, 8)}...${s.slice(-6)}`
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return "just now"
}

export default function ExplainerPage() {
  const [signature, setSignature] = useState("")
  const [tx, setTx] = useState<ExplainedTransaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setHistory(getHistory())
  }, [])

  const handleExplain = useCallback(async (sig: string) => {
    const trimmed = sig.trim()
    if (!trimmed) {
      toast.error("Please enter a transaction signature")
      return
    }

    setLoading(true)
    setError(null)
    setTx(null)

    try {
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com"
      const connection = new Connection(rpcUrl, "confirmed")
      const result = await explainTransaction(connection, trimmed)
      setTx(result)
      saveToHistory(trimmed)
      setHistory(getHistory())
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch transaction"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setSignature(text.trim())
    } catch {
      toast.error("Could not read clipboard")
    }
  }

  const handleHistoryClick = (sig: string) => {
    setSignature(sig)
    handleExplain(sig)
  }

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY)
    setHistory([])
  }

  return (
    <>
      <Toaster richColors position="bottom-right" />
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Transaction Explainer</h1>
            <p className="text-zinc-400 text-sm">
              Paste any Solana transaction signature for a human-readable breakdown
            </p>
          </div>

          {/* Input row */}
          <div className="flex gap-2">
            <Input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Enter transaction signature..."
              className="font-mono text-sm bg-zinc-900 border-zinc-700 flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleExplain(signature)
              }}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handlePaste}
              title="Paste from clipboard"
              className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
            >
              <ClipboardPaste className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleExplain(signature)}
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Explaining…
                </>
              ) : (
                "Explain"
              )}
            </Button>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="space-y-1">
                <p>{error}</p>
                <p className="text-xs opacity-80">
                  Tip: Use a recent devnet transaction or connect to an archival RPC for older transactions
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main content */}
            <div className="lg:col-span-3">
              {tx && <TxTimeline tx={tx} />}
            </div>

            {/* History sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Recent
                  </CardTitle>
                  {history.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
                      onClick={clearHistory}
                      title="Clear history"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-1">
                  {history.length === 0 ? (
                    <p className="text-xs text-zinc-600 italic">No history yet</p>
                  ) : (
                    history.map((entry) => (
                      <button
                        key={entry.signature}
                        onClick={() => handleHistoryClick(entry.signature)}
                        className="w-full text-left rounded px-2 py-1.5 hover:bg-zinc-800 transition-colors group"
                      >
                        <p className="text-xs font-mono text-zinc-400 group-hover:text-zinc-200 truncate">
                          {short(entry.signature)}
                        </p>
                        <p className="text-xs text-zinc-600">
                          {formatRelativeTime(entry.timestamp)}
                        </p>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
