import { app, nativeImage, BrowserWindow, Menu, Tray, MenuItem } from "electron"
import { getPreloadPath } from "../path-resolver.js";
import { ipcMainHandle, isDev } from "../utils.js";
import { collection } from "@tada/api";
// import { collection as systemCollection } from "../services/system.js";
import { Mixin } from 'ts-mixer';
import { proxy } from 'valtio';
import { ContextService } from "./context.js";
import { type Note } from "@tada/database";
import { z } from 'zod';

export type RuntimeNote = {
  noteId: string
  title: string
  // windowId: string | null
}

export type NoteManagerServiceState = {
  notes: string[];
}

export class NoteManagerService extends Mixin(ContextService) {
  state: NoteManagerServiceState;
  private notes: Map<string, RuntimeNote> = new Map();

  constructor() {
    super();
    this.state = proxy({
      notes: [],
    });
  }

  static createService() {
    return new NoteManagerService();
  }

  public getNotes = () => {
    (async () => {
      const notes = await collection.getNotes();
      const trayService = this.context!.get("tray")!
      trayService.updateNotesSubmenu(notes.map((note) => {
        return { id: note.id, title: note.title!, checked: false }
      }))
    })();
  }

  public getNote = z.function()
  .input([z.uuidv4()])
  .implementAsync(async (noteId: string) => {
    return collection.getNote({ noteId });
  })

  public createNote = z.function()
    .implementAsync(async () => {
      return collection.createNote({ title: 'New Note' });;
    })

  public updateNode = z.function()
    .input([z.object({
      noteId: z.uuidv4(),
      title: z.string().optional(),
      content: z.any().optional(),
    })])
    .output(z.any())
    .implementAsync(async ({ noteId, title, content }) => {
      const note = await collection.updateNote({ noteId, title, content });
      const trayService = this.context!.get("tray")!
      trayService.updateNote(noteId, { title: note!.title! })
      return note;
    })
}