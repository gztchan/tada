import { app, nativeImage, BrowserWindow, Menu, Tray, MenuItem } from "electron"
import { getTrayIconPath } from "../path-resolver.js";
import { ipcMainHandle, isDev } from "../utils.js";
import { collection } from "@tada/api";
// import { collection as systemCollection } from "../services/system.js";
import { Mixin } from 'ts-mixer';
import { ContextService } from "./context.js";
import z from "zod";
import log from 'electron-log';

export class TrayService extends Mixin(ContextService) {
  private tray: Tray;
  private menu: Electron.Menu = Menu.buildFromTemplate([]);

  constructor() {
    super();
    const icon = nativeImage.createFromPath(getTrayIconPath());
    icon.setTemplateImage(true);
    this.tray = new Tray(icon);
  }

  static createService() {
    return new TrayService();
  }

  setup() {
    const windowService = this.context!.get("window")!;

    this.menu = this.createMenuFromTemplate([]);
    this.tray.setContextMenu(this.menu)

    windowService.listen("noteWindowactivate", this.handleNoteWindowActivated)
    windowService.listen("noteWindowDestructive", this.handleNoteWindowDestructive)
  }

  private createMenuFromTemplate(notes: { id: string, title: string, checked?: boolean }[]) {
    const menu =  Menu.buildFromTemplate([
      {
        label: 'Create New Note',
        type: 'normal',
        click: async () => {
          const noteService = this.context?.get("note")!;
          const note = await noteService.createNote();

          const submenu = this.menu.getMenuItemById('notes')!.submenu!;
          const notes = submenu.items.map(item => ({ title: item.label, id: item.id, checked: item.checked }))
          notes.unshift({ title: note.title!, id: note.id, checked: true })

          this.menu = this.createMenuFromTemplate(notes)
          this.tray.setContextMenu(this.menu)

          this.context?.get("window")?.createWindow({ noteId: note.id });
        }
      },
      { type: 'separator' },
      {
        label: 'Dashboard(TBD)',
        type: 'normal',
        click: () => {
          // const dashboardService = this.context?.get("dashboard")!;
          // dashboardService.openDashboardWindow();
        }
      },
      {
        label: 'Notes',
        id: 'notes',
        submenu: [],
      },
      { type: 'separator' },
      {
        label: 'About',
        type: 'normal',
        click: () => {
          const aboutService = this.context?.get("about")!;
          aboutService.openAboutWindow();
        }
      },
      {
        label: 'Quit',
        type: 'normal',
        click: () => app.quit(),
      }
    ])

    notes.forEach((note) => {
      const noteItem = new MenuItem({
        label: note.title || "New Note",
        id: note.id,
        type: 'checkbox',
        checked: note.checked,
        click: () => {
          noteItem.checked = true;
          const windowService = this.context?.get("window")
          let window = windowService?.getWindowByNoteId(note.id)
          if (!window) {
            windowService?.createWindow({ noteId: note.id });
          } else {
            // TODO: display window
          }
        }
      })
      menu.getMenuItemById('notes')!.submenu!.append(noteItem);
    });

    return menu
  }

  private handleNoteWindowActivated = (window: BrowserWindow, note: any) => {
    log.info("window activate", window);
  }

  private handleNoteWindowDestructive = (window: BrowserWindow, note: any) => {
    log.info("window destructive", window);
  }

  public updateNotesSubmenu(notes: { id: string, title: string, checked?: boolean }[]) {
    this.menu = this.createMenuFromTemplate(notes)
    this.tray.setContextMenu(this.menu)
  }

  public updateNote = z.function()
    .input([z.uuidv4(), z.object({
      title: z.string().optional(),
      checked: z.boolean().optional()
    })])
    .output(z.void())
    .implementAsync(async (noteId, params) => {
      const submenu = this.menu.getMenuItemById('notes')!.submenu!;
      const items = submenu.items.map((item) => {
        if (item.id === noteId) {
          return {
            ...item,
            checked: typeof params.checked === 'boolean' ? params.checked : item.checked,
            label: typeof params.title === 'string' ? params.title : item.label
          }
        }
        return item;
      })
      this.menu = this.createMenuFromTemplate(items.map((item) => {
        return { id: item.id, title: item.label, checked: item.checked }
      }))
      this.tray.setContextMenu(this.menu)
    })

  public removeNote = z.function()
    .input([z.uuidv4()])
    .output(z.void())
    .implementAsync(async (noteId: string) => {
      const submenu = this.menu.getMenuItemById('notes')!.submenu!;
      const items = submenu.items.filter((item) => {
        return item.id !== noteId
      })
      this.menu = this.createMenuFromTemplate(items.map((item) => {
        return { id: item.id, title: item.label, checked: item.checked }
      }))
      this.tray.setContextMenu(this.menu)
    })
}