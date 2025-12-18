import { z, ZodObject, ZodAny } from 'zod'
// import { v4 as uuidv4 } from 'uuid'
import { type BrowserWindow } from "electron"
import { type Context } from '../../context.js'

export function withContext<T extends Record<string, any>, K extends Record<string, any>>(fn: (context: Context, window: BrowserWindow, input: T) => Promise<K>, inputSchema: ZodObject | ZodAny, outputSchema: ZodObject | ZodAny) {
  return async (context: Context, windowId: number, input?: T) => {
    const window = context.get("window")?.getWindow(windowId);
    if (!window) {
      throw new Error("Window not found")
    }

    const { data, error } = inputSchema.safeParse(input || {})

    if (error) {
      throw new Error(error.message)
    }

    const result = await fn(context, window, data as T)

    const { data: resultData, error: resultError } = outputSchema.safeParse(result)

    if (resultError) {
      throw new Error(resultError.message)
    }

    return resultData as K
  }
}

export class GetNode {
  inputSchema = z.object({
    noteId: z.uuidv4(),
  })

  outputSchema = z.any()

  handler = withContext<z.infer<typeof this.inputSchema>, z.infer<typeof this.outputSchema>>(
    async (context, window, { noteId }) => {
      const noteService = context.get("note")
      return noteService?.getNote(noteId)
    },
    this.inputSchema,
    this.outputSchema,
  )
}

export class UpdateNote {
  inputSchema = z.object({
    noteId: z.uuidv4(),
    title: z.string().optional(),
    content: z.any().optional(),
  })

  outputSchema = z.any()

  handler = withContext<z.infer<typeof this.inputSchema>, z.infer<typeof this.outputSchema>>(
    async (context, window, params) => {
      const noteService = context.get("note")
      return noteService?.updateNode(params)
    },
    this.inputSchema,
    this.outputSchema,
  )
}

export default {
  getNote: new GetNode().handler,
  updateNote: new UpdateNote().handler,
}
