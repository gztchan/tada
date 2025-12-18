import { BrowserWindow } from "electron";
import { ContextService } from "./context.js";
import { Mixin } from "ts-mixer";
import { EventBusService } from "./eventbus.js";

import z from 'zod'
import { getAboutPath, getPreloadPath, getSettingPath } from "../path-resolver.js";
import { isDev } from "../utils.js";

// PORT is only needed in development mode
const PORT = process.env.PORT || "5173"; // Default Vite port

export class AboutService extends Mixin(ContextService, EventBusService) {
  private window: BrowserWindow | null = null;

  constructor() {
    super();
  }

  static createService() {
    return new AboutService();
  }

  public openAboutWindow = z.function()
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

      if (isDev()) this.window.loadURL(`http://localhost:${PORT}/tada/templates/about.html`)
      else this.window.loadFile(getAboutPath());

      this.window.on('close', async() => {
        this.window!.destroy();
        this.window = null;
      });

      return this.window;
    })
}