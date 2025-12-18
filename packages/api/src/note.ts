import z from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { withContext } from './client.js'
import { Template } from './template.js'

export class GetNote extends Template {
  inputSchema = z.object({
    noteId: z.uuidv4(),
  })

  outputSchema = z.looseObject({
    id: z.string(),
    title: z.string().nullable(),
    content: z.any().nullable(),
  }).nullable()

  handler = withContext<z.infer<typeof this.inputSchema>, z.infer<typeof this.outputSchema>>(
    async (client, input) => {
      const note = await client.note.findUnique({
        where: {
          id: input.noteId,
        },
      })
      return note
    },
    this.inputSchema,
    this.outputSchema,
  )
}

export class GetNotes extends Template {
  inputSchema = z.object({
  })

  outputSchema = z.array(z.looseObject({
    id: z.string(),
    title: z.string().nullable(),
    content: z.any().nullable(),
  }))

  handler = withContext<z.infer<typeof this.inputSchema>, z.infer<typeof this.outputSchema>>(
    async (client) => {
      const notes = await client.note.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      })
      return notes
    },
    this.inputSchema,
    this.outputSchema,
  )
}

export class CreateNote extends Template {
  inputSchema = z.object({
    title: z.string(),
  })

  outputSchema = z.object({
    id: z.string(),
    title: z.string().nullable(),
  })

  handler = withContext<z.infer<typeof this.inputSchema>, z.infer<typeof this.outputSchema>>(
    async (client, input) => {
      const note = await client.note.create({
        data: {
          id: uuidv4(),
          title: input.title,
        }
      })
      return note
    },
    this.inputSchema,
    this.outputSchema,
  )
}

export class UpdateNote extends Template {
  inputSchema = z.object({
    noteId: z.uuidv4(),
    title: z.string().optional(),
    content: z.any().optional(),
  })

  outputSchema = z.looseObject({
    id: z.string(),
    title: z.string().nullable(),
    content: z.any().nullable(),
  }).nullable()

  handler = withContext<z.infer<typeof this.inputSchema>, z.infer<typeof this.outputSchema>>(
    async (client, input) => {
      let note = await client.note.findUnique({
        where: {
          id: input.noteId,
        },
      })
      if (!note) return null;
      
      note = await client.note.update({
        where: { id: input.noteId },
        data: {
          title: input.title ?? note.title,
          content: input.content ?? note.content,
        },
      })
      return note
    },
    this.inputSchema,
    this.outputSchema,
  )
}

export class DeleteNote extends Template {
  inputSchema = z.object({
    noteId: z.uuidv4(),
  })

  outputSchema = z.object({
    id: z.string(),
  }).nullable()

  handler = withContext<z.infer<typeof this.inputSchema>, z.infer<typeof this.outputSchema>>(
    async (client, input) => {
      return client.note.delete({
        where: {
          id: input.noteId,
        },
      })
    },
    this.inputSchema,
    this.outputSchema,
  )
}


export default {
  createNote: new CreateNote().handler,
  getNote: new GetNote().handler,
  getNotes: new GetNotes().handler,
  updateNote: new UpdateNote().handler,
  deleteNote: new DeleteNote().handler,
}