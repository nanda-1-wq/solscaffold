'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ClipboardPaste, Loader2 } from 'lucide-react'
import { ParsedInstruction } from '@/lib/anchor/idl-parser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

type Props = {
  instruction: ParsedInstruction
  onExecute: (argValues: Record<string, string>, accountValues: Record<string, string>) => Promise<void>
  isExecuting: boolean
  network?: 'devnet' | 'mainnet'
}

function buildSchema(instruction: ParsedInstruction) {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of instruction.fields) {
    switch (field.fieldType) {
      case 'bigint':
        shape[`arg_${field.name}`] = z
          .string()
          .regex(/^-?\d+$/, 'Must be a whole number')
        break
      case 'pubkey':
        shape[`arg_${field.name}`] = z.string().min(32).max(44)
        break
      case 'boolean':
        shape[`arg_${field.name}`] = z.boolean()
        break
      case 'number':
        shape[`arg_${field.name}`] = z.coerce.number()
        break
      default:
        shape[`arg_${field.name}`] = field.required
          ? z.string().min(1, 'Required')
          : z.string()
    }
  }

  for (const acct of instruction.accountFields) {
    if (acct.fixedAddress !== undefined) continue
    shape[`acct_${acct.name}`] = acct.optional
      ? z.string()
      : z.string().min(32).max(44)
  }

  return z.object(shape)
}

export default function InstructionForm({ instruction, onExecute, isExecuting, network = 'devnet' }: Props) {
  const schema = buildSchema(instruction)
  type FormValues = z.infer<typeof schema>

  const defaultValues: Record<string, string | boolean | number> = {}
  for (const field of instruction.fields) {
    if (field.fieldType === 'boolean') {
      defaultValues[`arg_${field.name}`] = false
    } else if (field.fieldType === 'number') {
      defaultValues[`arg_${field.name}`] = 0
    } else {
      defaultValues[`arg_${field.name}`] = ''
    }
  }
  for (const acct of instruction.accountFields) {
    if (acct.fixedAddress !== undefined) continue
    defaultValues[`acct_${acct.name}`] = ''
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as FormValues,
  })

  async function handleSubmit(values: FormValues) {
    const argValues: Record<string, string> = {}
    const accountValues: Record<string, string> = {}

    for (const field of instruction.fields) {
      const raw = values[`arg_${field.name}` as keyof FormValues]
      argValues[field.name] = String(raw ?? '')
    }
    for (const acct of instruction.accountFields) {
      if (acct.fixedAddress !== undefined) continue
      const raw = values[`acct_${acct.name}` as keyof FormValues]
      accountValues[acct.name] = String(raw ?? '')
    }

    await onExecute(argValues, accountValues)
  }

  const visibleAccounts = instruction.accountFields.filter((a) => a.fixedAddress === undefined)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-4">
        {instruction.fields.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Arguments
            </h3>
            {instruction.fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={`arg_${field.name}` as keyof FormValues}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-200">{field.label}</FormLabel>
                    <FormControl>
                      {field.fieldType === 'boolean' ? (
                        <Switch
                          checked={Boolean(formField.value)}
                          onCheckedChange={formField.onChange}
                        />
                      ) : field.fieldType === 'bytes' ? (
                        <div className="space-y-1">
                          <Textarea
                            placeholder={field.placeholder}
                            className="font-mono text-xs"
                            {...formField}
                            value={String(formField.value ?? '')}
                          />
                          <p className="text-xs text-zinc-500">hex encoding</p>
                        </div>
                      ) : field.fieldType === 'pubkey' ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder={field.placeholder}
                            className="font-mono text-xs"
                            {...formField}
                            value={String(formField.value ?? '')}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={async () => {
                              try {
                                const text = await navigator.clipboard.readText()
                                formField.onChange(text.trim())
                              } catch {
                                // clipboard access denied
                              }
                            }}
                          >
                            <ClipboardPaste className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : field.fieldType === 'number' ? (
                        <Input
                          type="number"
                          placeholder={field.placeholder}
                          {...formField}
                          value={String(formField.value ?? '')}
                          onChange={(e) => formField.onChange(e.target.valueAsNumber)}
                        />
                      ) : field.fieldType === 'bigint' ? (
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder={field.placeholder}
                          {...formField}
                          value={String(formField.value ?? '')}
                        />
                      ) : (
                        <Input
                          placeholder={field.placeholder}
                          {...formField}
                          value={String(formField.value ?? '')}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        )}

        {visibleAccounts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Accounts
            </h3>
            {visibleAccounts.map((acct) => (
              <FormField
                key={acct.name}
                control={form.control}
                name={`acct_${acct.name}` as keyof FormValues}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-zinc-200">
                      <span className="font-mono text-sm">{acct.name}</span>
                      {acct.writable && (
                        <Badge variant="outline" className="text-xs text-amber-400 border-amber-400/40">
                          writable
                        </Badge>
                      )}
                      {acct.signer && (
                        <Badge variant="outline" className="text-xs text-sky-400 border-sky-400/40">
                          signer
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Base58 public key"
                        className="font-mono text-xs"
                        {...formField}
                        value={String(formField.value ?? '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isExecuting}>
          {isExecuting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executing...
            </>
          ) : (
            `Execute on ${network}`
          )}
        </Button>
      </form>
    </Form>
  )
}
