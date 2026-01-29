import { nodePasteRule, ReactNodeViewRenderer } from '@tiptap/react'
import { mergeAttributes, Node } from '@tiptap/core'
import { XComponent } from './component'

export const X = Node.create({
  name: 'x',

  group: 'block',

  atom: true,

  draggable: true,

  addPasteRules() {
    const twitterUrl = /^https:\/\/(twitter\.com|x\.com)\/.*\/status\/.*/g

    return [
      nodePasteRule({
        find: twitterUrl,
        type: this.type,
        getAttributes: (match) => {
          return { url: match.input }
        }
      })
    ]
  },

  addAttributes() {
    return {
      url: {
        default: 'https://twitter.com/vercel/status/1683920951807971329'
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'twitter'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['twitter', mergeAttributes(HTMLAttributes)]
  },

  // TODO: WIP
  // addCommands() {
  //   return {}
  // },

  addNodeView() {
    return ReactNodeViewRenderer(XComponent)
  }
})