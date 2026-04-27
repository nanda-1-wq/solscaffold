"use client"

import { useState, useMemo } from "react"
import { toast, Toaster } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { generateFiles } from "@/lib/scaffold/templates"
import { buildAndDownloadZip } from "@/lib/scaffold/zip-builder"

type Step = 1 | 2 | 3

interface Feature {
  id: string
  label: string
  description: string
}

const FEATURES: Feature[] = [
  {
    id: "sns",
    label: "SNS Integration",
    description: "Resolve .sol names with Bonfida",
  },
  {
    id: "usdc",
    label: "USDC Payments",
    description: "Send and receive USDC on Solana",
  },
  {
    id: "nft",
    label: "NFT Mint",
    description: "Mint NFTs with Metaplex",
  },
  {
    id: "token2022",
    label: "Token-2022",
    description: "Next-gen token extensions",
  },
  {
    id: "magicblock",
    label: "MagicBlock Ephemeral",
    description: "High-performance ephemeral rollups",
  },
]

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "")
}

export default function ScaffoldPage() {
  const [step, setStep] = useState<Step>(1)
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [authorHandle, setAuthorHandle] = useState("")
  const [features, setFeatures] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const toggleFeature = (id: string) => {
    setFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  const files = useMemo(() => {
    if (step !== 3 || !projectName) return []
    return generateFiles(projectName, features)
  }, [step, projectName, features])

  const fileTree = useMemo(() => {
    return files
      .map((f, i, arr) => `${i === arr.length - 1 ? "└──" : "├──"} ${f.path}`)
      .join("\n")
  }, [files])

  const handleDownload = async () => {
    if (!projectName) return
    setIsGenerating(true)
    try {
      await buildAndDownloadZip(projectName, files)
      toast.success(`Downloaded ${projectName}.zip!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate zip")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
      <Toaster richColors />

      {/* Step 1 — Project Details */}
      {step === 1 && (
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>New Solana Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="project-name">Project name *</Label>
              <Input
                id="project-name"
                placeholder="my-solana-app"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={(e) => setProjectName(slugify(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Short description</Label>
              <Input
                id="description"
                placeholder="A Solana dApp that..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="author">GitHub handle</Label>
              <Input
                id="author"
                placeholder="@yourusername"
                value={authorHandle}
                onChange={(e) => setAuthorHandle(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              disabled={!projectName}
              onClick={() => setStep(2)}
            >
              Next →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Features */}
      {step === 2 && (
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Choose Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {FEATURES.map((feature) => (
              <div key={feature.id} className="flex items-start gap-3">
                <Checkbox
                  id={feature.id}
                  checked={features.includes(feature.id)}
                  onCheckedChange={() => toggleFeature(feature.id)}
                  className="mt-0.5"
                />
                <div>
                  <Label htmlFor={feature.id} className="font-medium cursor-pointer">
                    {feature.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Next →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 — Download */}
      {step === 3 && (
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Ready to Download</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <p className="font-medium font-mono">{projectName}</p>
              {features.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {features.map((f) => (
                    <Badge key={f} variant="secondary">
                      {FEATURES.find((feat) => feat.id === f)?.label ?? f}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No extra features selected</p>
              )}
            </div>

            {/* File tree preview */}
            <details>
              <summary className="text-sm font-medium cursor-pointer select-none mb-2">
                Files ({files.length})
              </summary>
              <pre className="text-xs font-mono bg-muted rounded-md p-3 overflow-auto max-h-48 whitespace-pre">
                {`${projectName}/\n${fileTree}`}
              </pre>
            </details>

            {/* Actions */}
            <Button
              className="w-full"
              disabled={isGenerating}
              onClick={handleDownload}
            >
              {isGenerating ? "Generating..." : `Generate & Download`}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setStep(2)}>
              ← Back
            </Button>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Generated by SolScaffold · Built for 100xDevs Frontier Hackathon
      </p>
    </div>
  )
}
