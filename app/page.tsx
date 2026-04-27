"use client"

import Link from "next/link"
import { Code2, FolderOpen, Search, GitBranch } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SendWidget } from "@/components/sns/SendWidget"

const FEATURE_CARDS = [
  {
    icon: Code2,
    title: "IDL Playground",
    description:
      "Paste any Anchor IDL and instantly get a form to call instructions on devnet or mainnet.",
  },
  {
    icon: FolderOpen,
    title: "Scaffold Wizard",
    description:
      "Generate a production-ready Next.js 14 + Anchor monorepo zip in 3 steps.",
  },
  {
    icon: Search,
    title: "Tx Explainer",
    description:
      "Paste any transaction signature and get a human-readable breakdown.",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 gap-8 text-center">
        <Badge variant="secondary" className="text-xs">
          Built for 100xDevs Frontier Hackathon 2026
        </Badge>

        <h1 className="text-5xl md:text-6xl font-bold font-mono tracking-tight">
          The Solana Dev Toolkit
        </h1>

        <p className="max-w-xl text-muted-foreground text-lg">
          Paste an Anchor IDL and get a working UI in seconds. Scaffold a
          full-stack dApp. Explain any transaction. Ship faster.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/playground">Open Playground →</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/scaffold">Scaffold a Project →</Link>
          </Button>
        </div>

        {/* GitHub link */}
        <a
          href="https://github.com/nanda-1-wq/solscaffold"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <GitBranch className="h-4 w-4" />
          nanda-1-wq/solscaffold
        </a>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mt-4">
          {FEATURE_CARDS.map((card) => (
            <Card key={card.title} className="text-left">
              <CardHeader className="pb-2">
                <card.icon className="h-6 w-6 mb-1 text-primary" />
                <CardTitle className="text-base">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Send widget */}
        <div className="w-full max-w-md mt-4">
          <SendWidget />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-6 border-t">
        Built by @3Desso for 100xDevs Frontier Hackathon · Powered by Solana
      </footer>
    </div>
  )
}
