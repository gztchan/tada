import { z, ZodObject, ZodAny, check } from 'zod'
// import { v4 as uuidv4 } from 'uuid'
import { type BrowserWindow, shell } from "electron"
import { type Context } from '../../context.js'
import { collection } from '@tada/api';

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

export class SwitchMovable {
  inputSchema = z.object({
    movable: z.boolean(),
  })

  outputSchema = z.any()

  handler = withContext<z.infer<typeof this.inputSchema>, z.infer<typeof this.outputSchema>>(
    async (context, window, { movable }) => {
      window?.setMovable(movable)
    },
    this.inputSchema,
    this.outputSchema,
  )
}

export class isMovable {
  inputSchema = z.any()

  outputSchema = z.object({
    movable: z.boolean(),
  })

  handler = withContext<z.infer<typeof this.inputSchema>, z.infer<typeof this.outputSchema>>(
    async (_, window) => {
      return { movable: await window?.isMovable() || false }
    },
    this.inputSchema,
    this.outputSchema,
  )
}

export class SwitchResizable {
  inputSchema = z.object({
    resizable: z.boolean(),
  })

  outputSchema = z.any()

  handler = withContext<z.infer<typeof this.inputSchema>, z.infer<typeof this.outputSchema>>(
    async (context, window, { resizable }) => {
      window?.setResizable(resizable)
    },
    this.inputSchema,
    this.outputSchema,
  )
}

export class isResizable {
  inputSchema = z.any()

  outputSchema = z.object({
    resizable: z.boolean(),
  })

  handler = withContext<z.infer<typeof this.inputSchema>, z.infer<typeof this.outputSchema>>(
    async (_, window) => {
      return { resizable: await window?.isResizable() || false }
    },
    this.inputSchema,
    this.outputSchema,
  )
}


export class CloseWindow {
  inputSchema = z.any()

  outputSchema = z.any()

  handler = withContext<z.infer<typeof this.inputSchema>, z.infer<typeof this.outputSchema>>(
    async (context, window) => {
      const noteId = context.get("window")!.getNoteIdByWindow(window)
        if (noteId) {
          context.get("tray")!.updateNote(noteId, { checked: false })
        }
      window.close();
    },
    this.inputSchema,
    this.outputSchema,
  )
}

export class DeleteNote {
  inputSchema = z.object({
    noteId: z.uuidv4(),
  })

  outputSchema = z.any()

  handler = withContext<z.infer<typeof this.inputSchema>, z.infer<typeof this.outputSchema>>(
    async (_, window, { noteId }) => {
      await collection?.deleteNote({ noteId })
      window.close()
    },
    this.inputSchema,
    this.outputSchema,
  )
}

export default {
  switchMovable: new SwitchMovable().handler,
  isMovable: new isMovable().handler,
  switchResizable: new SwitchResizable().handler,
  isResizable: new isResizable().handler,
  closeWindow: new CloseWindow().handler,
  deleteNote: new DeleteNote().handler,
}