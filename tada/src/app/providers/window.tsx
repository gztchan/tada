import { createContext, useRef } from 'react'
import { WindowService } from '../services/window'

type WindowContextType = {
  service: WindowService;
}

export const WindowContext = createContext<WindowContextType | undefined>(undefined)

export function WindowProvider({ children }: { children: React.ReactNode }) {
  const windowId = new URLSearchParams(window.location.search).get('windowId')!
  const service = useRef(WindowService.createService(windowId))

  return (
    <WindowContext.Provider value={{
      service: service.current,
    }}>
      {children}
    </WindowContext.Provider>
  )
}