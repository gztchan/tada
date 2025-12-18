import { isDev } from "./utils.js"
import path from "path"
import { app } from "electron"

export function getPreloadPath() {
    return path.join(app.getAppPath(), '/dist/electron/preload.js');
}

export function getNoteTemplatePath() {
    return path.join(app.getAppPath(), '/dist/react/tada/templates/note.html');
}

export function getSettingPath() {
    return path.join(app.getAppPath(), '/dist/react/tada/templates/setting.html');
}

export function getAboutPath() {
    return path.join(app.getAppPath(), '/dist/react/tada/templates/about.html');
}

export function getDockIconPath() {
    return path.join(isDev() ? app.getAppPath() : process.resourcesPath, 'assets/tada/icon.icns')
}

export function getTrayIconPath() {
    return path.join((isDev() ? app.getAppPath() : process.resourcesPath), 'assets/tray/icon.png')
}