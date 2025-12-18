import { createContext, useEffect, useRef } from 'react'
import { NoteService } from '../services/note'

type NoteContextType = {
  service: NoteService;
}

export const NoteContext = createContext<NoteContextType | undefined>(undefined)

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const noteId = new URLSearchParams(window.location.search).get('noteId')!
  const service = useRef(NoteService.createService())

  useEffect(() => {
    (async () => {
      await service.current.getNote({ noteId });
    })()
  }, [])

  return (
    <NoteContext.Provider value={{
      service: service.current,
    }}>
      {children}
    </NoteContext.Provider>
  )
}