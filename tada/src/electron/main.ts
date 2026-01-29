import { app, BrowserWindow, Menu, nativeImage, Tray } from "electron"
import { ipcMainHandle } from "./utils.js";
import { collection } from "./services/api/index.js";

import { TrayService } from "./services/tray.js";
import { NoteWindowService } from "./services/note-window.js";
import { Context } from "./context.js";
import Database from "better-sqlite3";
import { createClient } from "@tada/api";
import { createDatabaseService } from "./services/database-service.js";
import path from "path";
import { NoteManagerService } from "./services/note.js";
import { AboutService } from "./services/about.js";
import { getDockIconPath } from "./path-resolver.js";
import log from 'electron-log';

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

log.transports.file.level = 'info';          // 想看到 info 必须改这个
log.transports.file.maxSize = 5 * 1024 * 1024;  // 5MB 轮转
log.transports.file.fileName = 'tada.log';   // 可自定义文件名

// app.dock?.hide()
const image = nativeImage.createFromPath(getDockIconPath());
app.dock!.setIcon(image);

const dbPath = path.join(app.getPath('userData'), 'data.db');

let context: Context | null = null;

async function initializeDatabase() {
  try {
    const dbService = createDatabaseService();

    await dbService.initialize();

  } catch (error) {
    log.error('Database initialization failed:', error);
  }
}

app.on("ready", async () => {
  new Database(dbPath);

  await initializeDatabase();

  await createClient(dbPath);

  context = new Context(app);

  context.register("tray", TrayService.createService());
  context.register("window", NoteWindowService.createService());
  context.register("note", NoteManagerService.createService());
  context.register("about", AboutService.createService());

  context.get("tray")!.setup();

  app.on('window-all-closed', () => {})

  ipcMainHandle("api", async (e, func: keyof typeof collection, params: any) => {
    return collection[func](context!, e.sender.id, params)
  })

  context.get("note")!.getNotes();
})