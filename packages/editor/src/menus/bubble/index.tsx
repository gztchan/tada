import { Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@tada/ui/components/ui/button.js'
import { Bold, Strikethrough, Underline, Italic } from 'lucide-react'

export function EditorBubbleMenu(props: { editor: Editor }) {
  const { editor } = props

  const ref = useRef<HTMLDivElement>(null)
  const getVirtualElement = () => {
    const anchor = document.querySelector("#bubble-anchor")!
    return {
      getBoundingClientRect: () => {
        return {
          x: 0,
          y: 0,
          top: anchor.getBoundingClientRect().top + 10,
          bottom: 0,
          right: 0,
          left: anchor.getBoundingClientRect().left + ref.current!.getBoundingClientRect().width / 2,
          width: 0,
          height: 0,
        }
      },
    }
  }

  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [strikethrough, setStrikethrough] = useState(false)
  const [underline, setUnderline] = useState(false)

  useEffect(() => {
    const updateCallback = ({ editor }: { editor: Editor }) => {
      setBold(editor.isActive('bold'))
      setItalic(editor.isActive('italic'))
      setStrikethrough(editor.isActive('strike'))
      setUnderline(editor.isActive('underline'))
    }
    editor.on('selectionUpdate', updateCallback)
    editor.on('update', updateCallback)
    updateCallback({ editor })
    return () => {
      editor.off('selectionUpdate', updateCallback)
      editor.off('update', updateCallback)
    }
  }, [editor])

  return (
    <BubbleMenu
      editor={props.editor}
      getReferencedVirtualElement={getVirtualElement}
      ref={ref}
    >
      <div className="flex flex-col items-center gap-1 shadow-md rounded-md">
        <Button 
          className="size-8" 
          variant={bold ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold />
        </Button>
        <Button 
          className="size-8" 
          variant={italic ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </Button>
        <Button 
          className="size-8" 
          variant={underline ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline />
        </Button>
        <Button 
          className="size-8" 
          variant={strikethrough ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough />
        </Button>
      </div>
    </BubbleMenu>
  )
}