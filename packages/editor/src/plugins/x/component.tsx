import { NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { Tweet } from 'react-tweet'
import './style.css'

export const XComponent = ({ node }: NodeViewProps) => {
  const url = node.attrs.url
  const tweetIdRegex = /\/status\/(\d+)/g
  const id = tweetIdRegex.exec(url)?.[1]

  return (
    <NodeViewWrapper className='flex w-full'>
      <Tweet id={id || ''} />
    </NodeViewWrapper>
  )
}