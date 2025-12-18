import { EventEmitter } from "eventemitter3";

export class EventBusService {
  private eventBus = new EventEmitter();

  listen(event: string, listener: (...args: any[]) => void) {
    this.eventBus.on(event, listener);
  }

  mute(event: string, listener: (...args: any[]) => void) {
    this.eventBus.off(event, listener);
  }

  emit(event: string, ...args: any[]) {
    this.eventBus.emit(event, ...args);
  }
}