import { useContext, useState } from 'react'
import './style.css'
// import { X, Lock, SquarePen } from 'lucide-react'
// import { Button } from '@tada/ui/components/ui/button.js'
// import { HugeiconsIcon } from '@hugeicons/react'
// import { LockPasswordIcon, LiveStreaming01Icon } from '@hugeicons/core-free-icons'
import { NoteContext } from '../../../../providers/note'
import { useSnapshot } from 'valtio'
import { Popover, PopoverContent, PopoverTrigger } from '@tada/ui/components/ui/popover.js'
import { Input } from '@tada/ui/components/ui/input.js'
import { NoteConfigMenu } from './config'

export function NavigationBar() {
  const { service } = useContext(NoteContext)!
  const state = useSnapshot(service.state)

  const [isOpen, setIsOpen] = useState(false)

  // const [movable, setMovable] = useState(true)

  // const handleSwitchMovable = async () => {
  //   const { movable: isMovable } = await window.api.invoke('isMovable')
  //   window.api.invoke('switchMovable', { movable: !isMovable })
  //   setMovable(!isMovable)
  // }

  return (
    <div className="navbar flex justify-between items-center px-3 py-3 bg-muted">
      <div className="flex items-center max-w-[80%]">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <p data-role="popover-trigger" className="text-center text-sm font-bold cursor-pointer select-none truncate line-clamp-1">{state.note?.title}</p>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" sideOffset={10} className="w-auto">
            <Input defaultValue={state.note?.title || ''} onChange={(e) => {
              service.updateNote({ noteId: state.note!.id, title: e.target.value.trim() })
            }} />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center">
        <NoteConfigMenu />
        {/* {movable ? <HugeiconsIcon className="dark:text-white" size={20} icon={LockPasswordIcon} onClick={handleSwitchMovable} /> : <HugeiconsIcon color="#417505" size={20} icon={LiveStreaming01Icon} onClick={handleSwitchMovable} /> } */}
      </div>
    </div>
  )
}