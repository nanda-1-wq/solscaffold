export type FormFieldType =
  | 'number'
  | 'bigint'
  | 'pubkey'
  | 'boolean'
  | 'text'
  | 'bytes'
  | 'vec'
  | 'option'
  | 'defined'

export type FormField = {
  name: string
  fieldType: FormFieldType
  label: string
  placeholder: string
  required: boolean
  innerType?: unknown
}

export type ParsedInstruction = {
  name: string
  label: string
  fields: FormField[]
  accountFields: AccountField[]
}

export type AccountField = {
  name: string
  writable: boolean
  signer: boolean
  optional: boolean
  fixedAddress?: string
}

function toLabel(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function resolveFieldType(type: unknown): { fieldType: FormFieldType; innerType?: unknown } {
  if (typeof type === 'string') {
    if (['u8', 'u16', 'u32', 'i8', 'i16', 'i32'].includes(type)) return { fieldType: 'number' }
    if (['u64', 'u128', 'i64', 'i128'].includes(type)) return { fieldType: 'bigint' }
    if (type === 'bool') return { fieldType: 'boolean' }
    if (type === 'pubkey' || type === 'publicKey') return { fieldType: 'pubkey' }
    if (type === 'string') return { fieldType: 'text' }
    if (type === 'bytes') return { fieldType: 'bytes' }
    return { fieldType: 'text' }
  }

  if (typeof type === 'object' && type !== null) {
    const obj = type as Record<string, unknown>
    if ('vec' in obj) return { fieldType: 'vec', innerType: obj.vec }
    if ('array' in obj) return { fieldType: 'vec', innerType: obj.array }
    if ('option' in obj) return { fieldType: 'option', innerType: obj.option }
    if ('defined' in obj) return { fieldType: 'defined', innerType: obj.defined }
  }

  return { fieldType: 'text' }
}

function getPlaceholder(fieldType: FormFieldType, name: string): string {
  switch (fieldType) {
    case 'number': return '0'
    case 'bigint': return '0'
    case 'pubkey': return 'Base58 public key'
    case 'boolean': return 'true / false'
    case 'bytes': return 'Hex encoded bytes'
    case 'vec': return `JSON array for ${name}`
    case 'option': return 'Value or leave empty'
    case 'defined': return `JSON value for ${name}`
    default: return name
  }
}

export function parseIDL(idl: unknown): ParsedInstruction[] {
  if (!idl || typeof idl !== 'object') return []

  const raw = idl as Record<string, unknown>
  if (!Array.isArray(raw.instructions) || raw.instructions.length === 0) return []

  return raw.instructions.map((ix: unknown) => {
    const instruction = ix as Record<string, unknown>
    const name = String(instruction.name ?? '')
    const args = Array.isArray(instruction.args) ? instruction.args : []
    const accounts = Array.isArray(instruction.accounts) ? instruction.accounts : []

    const fields: FormField[] = args.map((arg: unknown) => {
      const a = arg as Record<string, unknown>
      const argName = String(a.name ?? '')
      const { fieldType, innerType } = resolveFieldType(a.type)
      return {
        name: argName,
        fieldType,
        label: toLabel(argName),
        placeholder: getPlaceholder(fieldType, argName),
        required: fieldType !== 'option',
        ...(innerType !== undefined ? { innerType } : {}),
      }
    })

    const accountFields: AccountField[] = accounts.map((acc: unknown) => {
      const a = acc as Record<string, unknown>
      const acctName = String(a.name ?? '')
      const field: AccountField = {
        name: acctName,
        writable: Boolean(a.writable),
        signer: Boolean(a.signer),
        optional: Boolean(a.optional),
      }
      if (typeof a.address === 'string') {
        field.fixedAddress = a.address
      }
      return field
    })

    return {
      name,
      label: toLabel(name),
      fields,
      accountFields,
    }
  })
}

export function isLegacyIDL(idl: unknown): boolean {
  if (!idl || typeof idl !== 'object') return false
  const raw = idl as Record<string, unknown>
  const hasTopLevelVersion = typeof raw.version === 'string'
  const hasAddress = typeof raw.address === 'string'
  return hasTopLevelVersion || !hasAddress
}
