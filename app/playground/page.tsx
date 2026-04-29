'use client'

import { useState, useEffect } from 'react'
import { Code2, ExternalLink, Info, Trash2 } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { parseIDL, isLegacyIDL, ParsedInstruction } from '@/lib/anchor/idl-parser'
import { callInstruction } from '@/lib/anchor/program-caller'
import IdlEditor from '@/components/playground/IdlEditor'
import InstructionForm from '@/components/playground/InstructionForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const DEFAULT_IDL = JSON.stringify(
  {
    address: 'CounterProgram1111111111111111111111111111111',
    metadata: { name: 'counter', version: '0.1.0', spec: '0.1.0' },
    instructions: [
      {
        name: 'initialize',
        discriminator: [175, 175, 109, 31, 13, 152, 155, 237],
        accounts: [
          { name: 'counter', writable: true, signer: true },
          { name: 'authority', writable: true, signer: true },
          { name: 'system_program', address: '11111111111111111111111111111111' },
        ],
        args: [],
      },
      {
        name: 'increment',
        discriminator: [11, 18, 104, 9, 104, 174, 59, 33],
        accounts: [
          { name: 'counter', writable: true },
          { name: 'authority', signer: true },
        ],
        args: [{ name: 'amount', type: 'u64' }],
      },
    ],
  },
  null,
  2,
)

type TxEntry = {
  id: string
  instructionName: string
  signature: string
  timestamp: number
  network: 'devnet' | 'mainnet'
}

const TX_HISTORY_KEY = 'solscaffold-tx-history'
const MAX_HISTORY = 5

function solscanUrl(sig: string, network: 'devnet' | 'mainnet') {
  const cluster = network === 'devnet' ? '?cluster=devnet' : ''
  return `https://solscan.io/tx/${sig}${cluster}`
}

function truncateSig(sig: string) {
  return `${sig.slice(0, 8)}...`
}

export default function PlaygroundPage() {
  const [idlText, setIdlText] = useState(DEFAULT_IDL)
  const [programIdOverride, setProgramIdOverride] = useState('')
  const [parsedInstructions, setParsedInstructions] = useState<ParsedInstruction[] | null>(null)
  const [parsedIdl, setParsedIdl] = useState<Record<string, unknown> | null>(null)
  const [isLegacy, setIsLegacy] = useState(false)
  const [executingIx, setExecutingIx] = useState<string | null>(null)
  const [txHistory, setTxHistory] = useState<TxEntry[]>([])

  const wallet = useAnchorWallet()
  const { connection } = useConnection()

  const network: 'devnet' | 'mainnet' =
    connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet'

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TX_HISTORY_KEY)
      if (stored) setTxHistory(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      const parsed = JSON.parse(DEFAULT_IDL)
      const instructions = parseIDL(parsed)
      if (instructions.length > 0) {
        setParsedIdl(parsed)
        setParsedInstructions(instructions)
        setIsLegacy(isLegacyIDL(parsed))
      }
    } catch {
      // ignore
    }
  }, [])

  function saveTxHistory(entries: TxEntry[]) {
    setTxHistory(entries)
    localStorage.setItem(TX_HISTORY_KEY, JSON.stringify(entries))
  }

  function handleLoadIdl() {
    try {
      const parsed = JSON.parse(idlText)
      const instructions = parseIDL(parsed)
      if (instructions.length === 0) {
        toast.error('No instructions found in IDL')
        return
      }
      setParsedIdl(parsed)
      setParsedInstructions(instructions)
      setIsLegacy(isLegacyIDL(parsed))
      toast.success(`Loaded ${instructions.length} instruction${instructions.length !== 1 ? 's' : ''}`)
    } catch (err) {
      toast.error(`Invalid JSON: ${err instanceof Error ? err.message : 'Parse error'}`)
    }
  }

  async function handleExecute(
    instructionName: string,
    argValues: Record<string, string>,
    accountValues: Record<string, string>,
  ) {
    if (!wallet) {
      toast.error('Connect your wallet first')
      return
    }
    if (!parsedIdl) return

    const programId = programIdOverride ||
      (typeof parsedIdl.address === 'string' ? parsedIdl.address : '')

    if (!programId) {
      toast.error('Enter a Program ID')
      return
    }

    setExecutingIx(instructionName)
    try {
      const sig = await callInstruction({
        idl: parsedIdl,
        programId,
        wallet: wallet as any,
        connection,
        instructionName,
        argValues,
        accountValues,
      })

      toast.success(
        <span>
          Transaction sent!{' '}
          <a
            href={solscanUrl(sig, network)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View on Solscan
          </a>
        </span>,
      )

      const entry: TxEntry = {
        id: crypto.randomUUID(),
        instructionName,
        signature: sig,
        timestamp: Date.now(),
        network,
      }
      saveTxHistory([entry, ...txHistory].slice(0, MAX_HISTORY))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Transaction failed')
    } finally {
      setExecutingIx(null)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-zinc-950 text-zinc-100">
      <Toaster richColors position="top-right" />

      <div className="flex-1 grid lg:grid-cols-[40%_60%] overflow-hidden">
        {/* Left pane */}
        <div className="flex flex-col border-r border-zinc-800 overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0">
            <IdlEditor value={idlText} onChange={setIdlText} />
          </div>

          <div className="p-4 space-y-3 border-t border-zinc-800 bg-zinc-900/50">
            {isLegacy && parsedInstructions && (
              <Alert className="border-yellow-500/40 bg-yellow-500/10">
                <AlertDescription className="text-yellow-400 text-xs">
                  Legacy IDL detected — address field missing. Enter Program ID manually.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="program-id" className="text-xs text-zinc-400">
                Program ID (override IDL address)
              </Label>
              <Input
                id="program-id"
                value={programIdOverride}
                onChange={(e) => setProgramIdOverride(e.target.value)}
                placeholder="Base58 program address"
                className="font-mono text-xs bg-zinc-900 border-zinc-700"
              />
            </div>

            <Button onClick={handleLoadIdl} className="w-full">
              Load IDL
            </Button>
          </div>
        </div>

        {/* Right pane */}
        <div className="flex flex-col overflow-hidden">
          {!parsedInstructions ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3 text-zinc-500">
                <Code2 className="h-12 w-12 mx-auto opacity-40" />
                <p className="text-sm">Paste an Anchor IDL on the left to get started</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs defaultValue={parsedInstructions[0]?.name} className="flex flex-col flex-1 overflow-hidden">
                <div className="border-b border-zinc-800 px-4 pt-3">
                  <TabsList className="bg-zinc-900">
                    {parsedInstructions.map((ix) => (
                      <TabsTrigger
                        key={ix.name}
                        value={ix.name}
                        className="font-mono text-xs"
                      >
                        {ix.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {parsedIdl && (parsedIdl as any).address === 'CounterProgram1111111111111111111111111111111' && (
                  <Alert className="mx-4 mt-3 border-zinc-700 bg-zinc-900/60">
                    <Info className="h-3.5 w-3.5 text-zinc-500" />
                    <AlertDescription className="text-zinc-500 text-xs">
                      This is a demo IDL for the Counter Program, which the program doesn&apos;t exist on devnet. Paste your own Anchor IDL on the left to test a real program.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex-1 overflow-y-auto min-h-0">
                  {parsedInstructions.map((ix) => (
                    <TabsContent key={ix.name} value={ix.name} className="mt-0">
                      <InstructionForm
                        instruction={ix}
                        isExecuting={executingIx === ix.name}
                        network={network}
                        onExecute={(argValues, accountValues) =>
                          handleExecute(ix.name, argValues, accountValues)
                        }
                      />
                    </TabsContent>
                  ))}
                </div>
              </Tabs>

              {/* History panel */}
              {txHistory.length > 0 && (
                <div className="border-t border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Recent Transactions
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-zinc-500 hover:text-zinc-300"
                      onClick={() => saveTxHistory([])}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {txHistory.map((entry, index) => (
                      <div
                        key={entry.signature || index}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <span className="font-mono text-zinc-400">{entry.instructionName}</span>
                        <div className="flex items-center gap-2 text-zinc-500">
                          <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                          <a
                            href={solscanUrl(entry.signature, entry.network)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-mono text-sky-400 hover:text-sky-300"
                          >
                            {truncateSig(entry.signature)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
