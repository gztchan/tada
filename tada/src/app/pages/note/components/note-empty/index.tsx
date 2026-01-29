import { XIcon } from 'lucide-react'

export function NoteEmpty() {
  return (
    <div className="note-empty flex flex-col flex-[1_1_0] overflow-hidden bg-background">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-8 text-center">
        <XIcon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} aria-hidden />
        <p className="text-sm font-medium text-foreground">Note not found</p>
        <p className="text-xs text-muted-foreground">
          This note may have been deleted or the link is invalid.
        </p>
      </div>
    </div>
  )
}
