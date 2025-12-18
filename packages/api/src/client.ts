import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from '@tada/database'
import { z, ZodObject, ZodNullable, ZodAny, ZodArray } from 'zod'

let client: PrismaClient | null = null

export async function createClient(url: string) {
  const adapter = new PrismaBetterSqlite3({ url });
  client = new PrismaClient({ adapter });
  await client.$connect()
  return client
}

export function withContext<T extends Record<string, any>, K extends Record<string, any> | null>(fn: (client: PrismaClient, input: T) => Promise<K | null>, inputSchema: ZodObject, outputSchema: ZodObject | ZodNullable | ZodAny | ZodArray) {
  return async (input?: T) => {
    if (!client) {
      throw new Error('Client not created')
    }

    const { data, error } = inputSchema.safeParse(input || {})

    if (error) {
      throw new Error(error.message)
    }

    const result = await fn(client, data as T)

    const { data: resultData, error: resultError } = outputSchema.safeParse(result)

    if (resultError) {
      throw new Error(resultError.message)
    }

    return resultData as K
  }
}