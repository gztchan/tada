import { contextBridge } from "electron";
import { api } from "./services/api/index.js";

contextBridge.exposeInMainWorld("api", {
  invoke: api.invoke,
})