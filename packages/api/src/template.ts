import { PrismaClient } from "@tada/database"
import { z, ZodAny, ZodObject, ZodNullable, ZodArray } from "zod"

export abstract class Template {
  abstract inputSchema: ZodObject | ZodAny | ZodNullable
  abstract outputSchema: ZodObject | ZodAny | ZodNullable | ZodArray
  abstract handler: (input?: z.infer<typeof this.inputSchema>) => Promise<z.infer<typeof this.outputSchema> | null>
}