import { ipcMain, WebContents, WebFrameMain } from "electron";
// import { getNoteTemplatePath } from "./path-resolver.js";
import { pathToFileURL } from "url";

// Checks if you are in development mode
export function isDev(): boolean {
    return process.env.NODE_ENV == "development";
}

// Making IPC Typesafe
export function ipcMainHandle(key: string, handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<any>) {
    ipcMain.handle(key, (event: Electron.IpcMainInvokeEvent, ...args) => {
        if (event.senderFrame) validateEventFrame(event.senderFrame);
        return handler(event, ...args)
    });
}

// export function ipcWebContentsSend<Key extends keyof EventPayloadMapping>(key: Key, webContents: WebContents, payload: EventPayloadMapping[Key]) {
//     webContents.send(key, payload);
// }

export function validateEventFrame(frame: WebFrameMain) {
    // In development, allow localhost connections
    if (isDev()) {
        const PORT = process.env.PORT || "5173"; // Default Vite port
        if (new URL(frame.url).host === `localhost:${PORT}`) return;
    }
    // In production, only allow the bundled UI
    // if (frame.url !== pathToFileURL(getUIPath()).toString()) throw new Error("Malicious event");
}