import { useContext, useState } from 'react'
import { NoteContext } from '../../../../providers/note'
import { useSnapshot } from 'valtio'
import { Popover, PopoverContent, PopoverTrigger } from '@tada/ui/components/ui/popover.js'
import { Input } from '@tada/ui/components/ui/input.js'
import { NoteConfigMenu } from './config'

import './style.css'

export function NavigationBar() {
  const { service } = useContext(NoteContext)!
  const state = useSnapshot(service.state)

  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="navbar flex justify-between items-center px-3 py-3 bg-muted">
      <div className="flex items-center max-w-[80%]">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <p data-role="popover-trigger" className="text-center text-sm font-bold cursor-pointer select-none truncate line-clamp-1">{state.note?.title}</p>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" sideOffset={10} className="w-auto">
            <Input className="!text-xs" defaultValue={state.note?.title || ''} onChange={(e) => {
              service.updateNote({ noteId: state.note!.id, title: e.target.value.trim() })
            }} />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center">
        <NoteConfigMenu />
      </div>
    </div>
  )
}