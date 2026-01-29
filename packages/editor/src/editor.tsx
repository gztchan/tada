import { useEditor, EditorContent } from '@tiptap/react'
// import { FloatingMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { EditorBubbleMenu } from './menus/bubble'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'

import { X } from './plugins/x'

import './styles/editor.css'
import './styles/paragraph.css'
import './styles/task-list.css'

export type NoteEditorProps = {
  content: Record<string, any> | null,
  onUpdate: (content: Record<string, any>) => void
}

export function NoteEditor(props: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Markdown,
      TaskList,
      TaskItem,
      Details.configure({
        persist: true,
        HTMLAttributes: {
          class: 'details',
        },
      }),
      DetailsSummary,
      DetailsContent,
      Placeholder.configure({
        showOnlyWhenEditable: true,
        placeholder: 'Something great happens ...',
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        HTMLAttributes: {
          class: "w-full max-md:h-[200px]",
        }
      }),
      X,
    ],
    content: props.content, // initial content
    editorProps: {
      attributes: {
        class: 'prose prose-sm p-4 focus:outline-none dark:prose-invert max-w-none min-h-full flex flex-col flex-1',
        placeholder: 'Write something...',
      },
    },
    onUpdate: ({ editor }) => {
      props.onUpdate(editor.getJSON())
    },
  })

  return (
    <div className="relative flex flex-col min-h-full">
      <EditorContent editor={editor} className="flex flex-col flex-1" />
      {/* <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu> */}
      <EditorBubbleMenu editor={editor} />
    </div>
  )
}