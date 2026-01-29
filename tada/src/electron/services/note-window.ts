import { BrowserWindow, shell } from "electron";
import { ContextService } from "./context.js";
import { Mixin } from "ts-mixer";
import { EventBusService } from "./eventbus.js";
import { v4 as uuidv4 } from 'uuid'

import z from 'zod'
import { getDockIconPath, getPreloadPath, getNoteTemplatePath } from "../path-resolver.js";
import { isDev } from "../utils.js";

// PORT is only needed in development mode
const PORT = process.env.PORT || "5173"; // Default Vite port

export type NoteWindow = {
  noteId: string
  window: BrowserWindow
}

export class NoteWindowService extends Mixin(ContextService, EventBusService) {
  private windows = new Map<string, NoteWindow>();

  constructor() {
    super();
  }

  static createService() {
    return new NoteWindowService();
  }

  public getWindow = z.function()
    .input([z.number()])
    .output(z.union([z.instanceof(BrowserWindow), z.null()]))
    .implement((windowId) => {
      for (const [id, noteWindow] of Array.from(this.windows.entries())) {
        if (noteWindow.window.id === windowId) {
          return noteWindow.window;
        }
      }
      return null;
    })

  public getNoteIdByWindow = z.function()
    .input([z.instanceof(BrowserWindow)])
    .output(z.union([z.uuidv4(), z.null()]))
    .implement((window) => {
      for (const [_, noteWindow] of Array.from(this.windows.entries())) {
        if (noteWindow.window.id === window.id) {
          return noteWindow.noteId;
        }
      }
      return null;
    })

  public getWindowByNoteId = z.function()
    .input([z.uuidv4()])
    .output(z.union([z.instanceof(BrowserWindow), z.null()]))
    .implement((noteId: string) => {
      return this.windows.get(noteId)?.window || null;
    })

  public createWindow = z.function()
    .input([z.object({
      noteId: z.uuidv4()
    })])
    .output(z.instanceof(BrowserWindow))
    .implement(({ noteId }) => {
      const window = new BrowserWindow({
        // Shouldn't add contextIsolate or nodeIntegration because of security vulnerabilities
        titleBarStyle : 'hiddenInset',
        // skipTaskbar: true,
        frame: false,
        resizable: true,
        minWidth: 300,
        minHeight: 400,
        width: 300,
        height: 600,
        // transparent: true,
        icon: getDockIconPath(),
        webPreferences: {
            preload: getPreloadPath(),
            sandbox: false,
            contextIsolation: true,
            nodeIntegration: false,
            // nodeIntegrationInWorker: true,
            // nodeIntegration: false,
            // contextIsolation: false
            webSecurity: false,
            webviewTag: true,
            allowRunningInsecureContent: true,
        }
      });

      window.setWindowButtonVisibility(false)
      window.setAlwaysOnTop(true)

      this.windows.set(noteId, {
        noteId,
        window,
      });

      if (isDev()) {
        window.loadURL(`http://localhost:${PORT}/tada/templates/note.html?noteId=${noteId}&windowId=${window.id}`)
      } else {
       window.loadFile(getNoteTemplatePath(), {
          query: {
            noteId,
            windowId: window.id.toString(),
          },
        });
      }

      window.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http:') || url.startsWith('https:')) {
          shell.openExternal(url); // Opens the URL in the user's default browser.
        }
        return { action: 'deny' }; // Prevents opening within the Electron app.
      });

      window.on('close', async() => {
        const note = await this.context!.get("note")!.getNote(noteId)
        if (!note) {
          this.context!.get("tray")!.removeNote(noteId)
        } else {
          this.context!.get("tray")!.updateNote(noteId, { checked: false })
        }
        for (const [id, noteWindow] of Array.from(this.windows.entries())) {
          if (noteWindow.window.id === window.id) {
            this.windows.delete(id);
          }
        }
        window.destroy();
      });

      return window;
    })
}