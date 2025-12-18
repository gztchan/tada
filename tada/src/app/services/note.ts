import { proxy } from 'valtio'
import { z } from 'zod'
import { type Note } from "@tada/database";

export type NoteServiceState = {
  // noteId: string;
  loading: boolean;
  note: Note | null;
}

export class NoteService {
  state: NoteServiceState

  constructor() {
    this.state = proxy({
      loading: false,
      note: null,
    });
  }

  static createService() {
    return new NoteService()
  }

  public getNote = z.function()
    .input([z.object({
      noteId: z.uuidv4()
    })])
    .implementAsync(async ({ noteId }) => {
      this.state.loading = true;
      const note = await window.api.invoke('getNote', { noteId });
      this.state.note = note;
      this.state.loading = false;
    })

  public updateNote = z.function()
    .input([z.object({
      noteId: z.uuidv4(),
      title: z.string().min(1).max(255).optional(),
      content: z.any().optional(),
    })])
    .implementAsync(async ({ noteId, title, content }) => {
      const note = await window.api.invoke('updateNote', { noteId, title, content });
      this.state.note = note;
    })

  public deleteNote = z.function()
    .implementAsync(async () => {
      await window.api.invoke('deleteNote', { noteId: this.state.note!.id });
    })
}