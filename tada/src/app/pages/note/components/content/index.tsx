import { NoteContext } from '../../../../providers/note'
import { NoteEditor } from '@tada/editor'
import '@tada/editor/dist/editor.css'
import { useContext } from 'react'

import { useSnapshot } from 'valtio'

export function NoteContent() {
  const { service } = useContext(NoteContext)!


  const state = useSnapshot(service.state)
  if (state.loading) {
    return <div>Loading...</div>
  }

  if (!state.note) {
    return <div>No note found</div>
  }

  return (
    <div className="relative flex flex-col flex-[1_1_0] overflow-hidden dark:bg-background">
      <div id="bubble-anchor" className="absolute top-0 right-0 w-[40px]"></div>
      <div className="overflow-auto no-scrollbar min-h-full" id="editor-anchor-scroll">
        <NoteEditor content={state.note.content} onUpdate={(content) => {
          service.updateNote({ noteId: state.note!.id, content })
        }} />
      </div>
    </div>
  )
}