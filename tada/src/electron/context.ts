import { App } from "electron";
import { type NoteWindowService } from "./services/note-window.js";
import { type TrayService } from "./services/tray.js";
import { type NoteManagerService } from "./services/note.js";
import { type AboutService } from "./services/about.js";

export type ContextServices = {
  window: NoteWindowService
  tray: TrayService
  note: NoteManagerService
  about: AboutService
}

export class Context {
  private services: Partial<ContextServices> = {};

  constructor(private readonly app: App) {}

  register<K extends keyof ContextServices>(name: K, service: ContextServices[K]) {
    this.services[name] = service;
    service.setContext(this);
  }

  get<K extends keyof ContextServices>(name: K) {
    return this.services[name];
  }
}