"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ExplainedTransaction, ExplainedInstruction } from "@/lib/solana/tx-explainer"

function short(s: string): string {
  if (s.length <= 12) return s
  return `${s.slice(0, 6)}...${s.slice(-4)}`
}

function InstructionItem({
  ix,
  isInner = false,
}: {
  ix: ExplainedInstruction
  isInner?: boolean
}) {
  const [open, setOpen] = useState(false)
  const hasDetails =
    (ix.rawAccounts && ix.rawAccounts.length > 0) ||
    ix.rawData ||
    (ix.innerInstructions && ix.innerInstructions.length > 0)

  return (
    <div className={`flex gap-3 ${isInner ? "ml-8" : ""}`}>
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full mt-1 shrink-0 bg-current ${ix.programColor}`} />
        {!isInner && <div className="w-px flex-1 bg-zinc-800 mt-1" />}
      </div>

      {/* Content */}
      <div className="pb-4 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Badge variant="outline" className={`text-xs font-mono ${ix.programColor} border-current`}>
            {ix.programName}
          </Badge>
          {!isInner && (
            <span className="text-xs text-zinc-500">#{ix.index + 1}</span>
          )}
        </div>

        <p className="text-sm text-zinc-200">{ix.summary}</p>

        {hasDetails && (
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 mt-1 transition-colors">
              {open ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              {open ? "Hide details" : "Show details"}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-2">
                {ix.rawAccounts && ix.rawAccounts.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Accounts</p>
                    <div className="space-y-0.5">
                      {ix.rawAccounts.map((acc, i) => (
                        <p key={i} className="text-xs font-mono text-zinc-400 break-all">
                          {acc}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {ix.rawData && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Data</p>
                    <p className="text-xs font-mono text-zinc-400 break-all">
                      {ix.rawData.length > 40
                        ? `${ix.rawData.slice(0, 40)}…`
                        : ix.rawData}
                    </p>
                  </div>
                )}
                {ix.innerInstructions && ix.innerInstructions.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-2">
                      Inner instructions ({ix.innerInstructions.length})
                    </p>
                    <div className="space-y-2 border-l border-zinc-800 pl-3">
                      {ix.innerInstructions.map((inner, i) => (
                        <InstructionItem key={i} ix={inner} isInner />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  )
}

export function TxTimeline({ tx }: { tx: ExplainedTransaction }) {
  const [logsOpen, setLogsOpen] = useState(false)

  const formatBlockTime = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " " + date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const significantSolChanges = tx.solBalanceChanges.filter(
    (c) => Math.abs(c.deltaSol) > 0.000001
  )

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs text-zinc-500">Slot</p>
              <p className="text-sm font-mono text-zinc-200">{tx.slot.toLocaleString()}</p>
              {tx.blockTime && (
                <p className="text-xs text-zinc-500">{formatBlockTime(tx.blockTime)}</p>
              )}
            </div>

            <div className="text-center space-y-0.5">
              <p className="text-xs text-zinc-500">Fee</p>
              <p className="text-sm font-mono text-zinc-200">{tx.feeSol.toFixed(6)} SOL</p>
              {tx.computeUnitsConsumed != null && (
                <p className="text-xs text-zinc-500">
                  {tx.computeUnitsConsumed.toLocaleString()} CUs
                </p>
              )}
            </div>

            <div className="text-right space-y-0.5">
              <p className="text-xs text-zinc-500">Status</p>
              {tx.failed ? (
                <Badge variant="destructive">Failed</Badge>
              ) : (
                <Badge className="bg-green-600 hover:bg-green-600 text-white">Success</Badge>
              )}
            </div>
          </div>

          {tx.failed && tx.errorMessage && (
            <Alert variant="destructive" className="mt-3">
              <AlertDescription className="text-xs font-mono break-all">
                {tx.errorMessage}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Instruction timeline */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">
            Instructions ({tx.instructions.length})
          </h3>
          <div className="space-y-0">
            {tx.instructions.map((ix, i) => (
              <InstructionItem key={i} ix={ix} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Token balance changes */}
      {tx.tokenBalanceChanges.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Token Balances</h3>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-500 text-xs">Mint</TableHead>
                  <TableHead className="text-zinc-500 text-xs">Owner</TableHead>
                  <TableHead className="text-zinc-500 text-xs text-right">Delta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tx.tokenBalanceChanges.map((tc, i) => (
                  <TableRow key={i} className="border-zinc-800">
                    <TableCell className="text-xs font-mono text-zinc-400">
                      {short(tc.mint)}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-zinc-400">
                      {tc.owner ? short(tc.owner) : "—"}
                    </TableCell>
                    <TableCell
                      className={`text-xs font-mono text-right ${
                        tc.deltaUi > 0
                          ? "text-green-400"
                          : tc.deltaUi < 0
                          ? "text-red-400"
                          : "text-zinc-400"
                      }`}
                    >
                      {tc.deltaUi > 0 ? "+" : ""}
                      {tc.deltaUi.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* SOL balance changes */}
      {significantSolChanges.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">SOL Balances</h3>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-500 text-xs">Account</TableHead>
                  <TableHead className="text-zinc-500 text-xs text-right">Before</TableHead>
                  <TableHead className="text-zinc-500 text-xs text-right">After</TableHead>
                  <TableHead className="text-zinc-500 text-xs text-right">Delta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {significantSolChanges.map((sc, i) => (
                  <TableRow key={i} className="border-zinc-800">
                    <TableCell className="text-xs font-mono text-zinc-400">
                      {short(sc.pubkey)}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-zinc-400 text-right">
                      {sc.preSol.toFixed(6)}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-zinc-400 text-right">
                      {sc.postSol.toFixed(6)}
                    </TableCell>
                    <TableCell
                      className={`text-xs font-mono text-right ${
                        sc.deltaSol > 0
                          ? "text-green-400"
                          : sc.deltaSol < 0
                          ? "text-red-400"
                          : "text-zinc-400"
                      }`}
                    >
                      {sc.deltaSol > 0 ? "+" : ""}
                      {sc.deltaSol.toFixed(6)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Program logs */}
      {tx.logMessages.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <Collapsible open={logsOpen} onOpenChange={setLogsOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                {logsOpen ? (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                )}
                <h3 className="text-sm font-semibold text-zinc-300">
                  Program Logs ({tx.logMessages.length})
                </h3>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <pre className="mt-3 text-xs font-mono text-zinc-400 bg-zinc-950 rounded p-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                  {tx.logMessages.join("\n")}
                </pre>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
