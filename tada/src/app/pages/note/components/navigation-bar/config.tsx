import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  // DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  // DropdownMenuSub,
  // DropdownMenuSubContent,
  // DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@tada/ui/components/ui/dropdown-menu.js"
import { SlidersHorizontal } from 'lucide-react'
// import { useSnapshot } from "valtio"
import { NoteContext } from "../../../../providers/note"
import { useCallback, useContext, useState } from "react"
// import { WindowContext } from "@/app/providers/window"

export function NoteConfigMenu() {
  // const { service: windowService } = useContext(WindowContext)!
  const { service } = useContext(NoteContext)!
  // const state = useSnapshot(service.state)
  const [movable, setMovable] = useState(false)
  const [editable, setEditable] = useState(false)
  const [resizable, setResizable] = useState(false)


  const syncWindowStatus = useCallback(() => {
    window.api.invoke('isMovable').then(({ movable }) => {
      setMovable(movable)
    })

    window.api.invoke('isResizable').then(({ resizable }) => {
      setResizable(resizable)
    })
  }, [])

  return (
    <DropdownMenu onOpenChange={(open) => {
      if (open) {
        syncWindowStatus()
      }
    }}>
      <DropdownMenuTrigger asChild>
        <SlidersHorizontal className="w-4 h-4 dark:text-white" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => {
            window.api.invoke('closeWindow')
          }}>
            Hide
            <DropdownMenuShortcut>⌘W</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            window.api.invoke('switchMovable', { movable: !movable })
          }}>
            {movable ? 'Movable' : 'Pinned'}
            <DropdownMenuShortcut>⌘?</DropdownMenuShortcut>
          </DropdownMenuItem>
          {/* <DropdownMenuItem onClick={() => {
            window.api.invoke('switchEditMode', { ediatble: !editable })
          }}>
            Editable?
            <DropdownMenuShortcut>⌘?</DropdownMenuShortcut>
          </DropdownMenuItem> */}
          <DropdownMenuItem onClick={() => {
            window.api.invoke('switchResizable', { resizable: !resizable})
          }}>
            {resizable ? 'Resizable' : 'Cannot resize'}
            <DropdownMenuShortcut>⌘?</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => service.deleteNote()}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}