import { proxy } from 'valtio'
import { z } from 'zod'
// import { NoteService } from './note';

export type NoteId = string;

export type NoteManagerServiceState = {
  // noteId: string;
  loading: boolean;
}

export class NoteManagerService {
  state: NoteManagerServiceState

  // private notes: Map<NoteId, NoteService> = new Map();

  constructor() {
    this.state = proxy({
      loading: false,
      note: null,
    });
  }

  static createService() {
    return new NoteManagerService()
  }

  public getNotes = z.function()
    .input([z.object({
      noteId: z.uuidv4()
    })])
    .implementAsync(async () => {
      this.state.loading = true;
      // const note = await window.api.invoke('getNote', { noteId });
      // this.state.note = note;
      // this.state.loading = false;
    })
}