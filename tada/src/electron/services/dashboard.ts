import { BrowserWindow } from "electron";
import { ContextService } from "./context.js";
import { Mixin } from "ts-mixer";
import { EventBusService } from "./eventbus.js";
import { v4 as uuidv4 } from 'uuid'

import z from 'zod'
import { getPreloadPath, getSettingPath } from "../path-resolver.js";
import { isDev } from "../utils.js";

// PORT is only needed in development mode
const PORT = process.env.PORT || "5173"; // Default Vite port

export type NoteWindow = {
  noteId: string
  window: BrowserWindow
}

export class DashboardService extends Mixin(ContextService, EventBusService) {
  private window: BrowserWindow | null = null;

  constructor() {
    super();
  }

  static createService() {
    return new DashboardService();
  }

  public openDashboardWindow = z.function()
    .output(z.instanceof(BrowserWindow))
    .implement(() => {
      if (this.window) {
        this.window.focus();
        return this.window;
      }

      this.window = new BrowserWindow({
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
        webPreferences: {
            preload: getPreloadPath(),
            sandbox: false,
            contextIsolation: true,
            // nodeIntegrationInWorker: true,
            // nodeIntegration: false,
            // contextIsolation: false,
        }
      });

      this.window.setWindowButtonVisibility(false)

      if (isDev()) this.window.loadURL(`http://localhost:${PORT}/templates/setting.html`)
      else this.window.loadFile(getSettingPath());

      // window.on('close', async() => {
      //   const note = await this.context!.get("note")!.getNote(noteId)
      //   if (!note) {
      //     this.context!.get("tray")!.removeNote(noteId)
      //   } else {
      //     this.context!.get("tray")!.updateNote(noteId, { checked: false })
      //   }
      //   for (const [id, noteWindow] of Array.from(this.windows.entries())) {
      //     if (noteWindow.window.id === window.id) {
      //       this.windows.delete(id);
      //     }
      //   }
      //   window.destroy();
      // });

      return this.window;
    })
}