import { proxy } from 'valtio'
// import { z } from 'zod'
// import { Note } from '@/interfaces'

export type WindowServiceState = {
  // noteId: string;
  windowId: string;
}

export class WindowService {
  state: WindowServiceState

  constructor(windowId: string) {
    this.state = proxy({
      windowId,
    })
  }

  static createService(windowId: string) {
    return new WindowService(windowId)
  }
}