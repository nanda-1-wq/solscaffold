import { AnchorProvider, BN, Program } from '@coral-xyz/anchor'
import { Connection, PublicKey } from '@solana/web3.js'

export async function callInstruction(params: {
  idl: Record<string, unknown>
  programId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wallet: any
  connection: Connection
  instructionName: string
  argValues: Record<string, string>
  accountValues: Record<string, string>
}): Promise<string> {
  const { idl, programId, wallet, connection, instructionName, argValues, accountValues } = params

  try {
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })

    const patchedIdl = { ...idl, address: programId }

    const program = new Program(patchedIdl as never, provider)

    const instruction = (idl.instructions as Array<Record<string, unknown>>).find(
      (ix) => ix.name === instructionName,
    )

    if (!instruction) {
      throw new Error(`Instruction "${instructionName}" not found in IDL`)
    }

    const args = Array.isArray(instruction.args) ? instruction.args : []

    const coercedArgs = args.map((arg: unknown) => {
      const a = arg as Record<string, unknown>
      const name = String(a.name ?? '')
      const type = a.type
      const value = argValues[name] ?? ''

      if (typeof type === 'string') {
        if (['u8', 'u16', 'u32', 'i8', 'i16', 'i32'].includes(type)) {
          return Number(value)
        }
        if (['u64', 'u128', 'i64', 'i128'].includes(type)) {
          return new BN(value)
        }
        if (type === 'bool') {
          return value === 'true'
        }
        if (type === 'pubkey' || type === 'publicKey') {
          return new PublicKey(value)
        }
        if (type === 'string') {
          return value
        }
        if (type === 'bytes') {
          return Buffer.from(value, 'hex')
        }
      }

      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    })

    const accounts: Record<string, PublicKey> = {}
    for (const [key, val] of Object.entries(accountValues)) {
      if (val) {
        accounts[key] = new PublicKey(val)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builder = (program.methods as any)[instructionName](...coercedArgs);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signature: string = await (builder as any).accounts(accounts).rpc();

    return signature
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Transaction failed: ${err.message}`)
    }
    throw new Error('Transaction failed: Unknown error')
  }
}
