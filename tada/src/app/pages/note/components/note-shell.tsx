import { NoteProvider } from "../../../providers/note"
import { NoteContent } from "./content"
import { NavigationBar } from "./navigation-bar"

export function NoteShell() {
  return (
    <NoteProvider>
      <div className="flex flex-col h-full">
        <NavigationBar />
        <NoteContent />
      </div>
    </NoteProvider>
  )
}