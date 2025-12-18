import electron from "electron";

export class ServiceBridge<T extends Record<string, (...args: any[]) => Promise<any>>> {
  constructor(private serviceName: string) {
  }

  static createBridge<K extends Record<string, any>>(serviceName: string) {
    return new ServiceBridge<K>(serviceName);
  }

  invoke = async <Z extends keyof T>(func: Z, params?: Parameters<T[Z]>[0]): Promise<Awaited<ReturnType<T[Z]>>> => {
    return electron.ipcRenderer.invoke(this.serviceName, func, params || {});
  }
}