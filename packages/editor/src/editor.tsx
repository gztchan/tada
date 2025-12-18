import { useEditor, EditorContent } from '@tiptap/react'
// import { FloatingMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { EditorBubbleMenu } from './menus/bubble'
import Placeholder from '@tiptap/extension-placeholder'

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
      Markdown,
      TaskList,
      TaskItem,
      Placeholder.configure({
        showOnlyWhenEditable: true,
        placeholder: 'Something great happens ...',
      }),
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