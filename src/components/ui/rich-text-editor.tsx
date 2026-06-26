"use client"

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered } from 'lucide-react'
import Underline from '@tiptap/extension-underline'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null
  }

  const toggleBold = (e: React.MouseEvent) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }
  const toggleItalic = (e: React.MouseEvent) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }
  const toggleUnderline = (e: React.MouseEvent) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run() }
  const toggleStrike = (e: React.MouseEvent) => { e.preventDefault(); editor.chain().focus().toggleStrike().run() }
  const toggleBullet = (e: React.MouseEvent) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }
  const toggleOrdered = (e: React.MouseEvent) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run() }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-input p-1 bg-slate-50/50 rounded-t-md">
      <Button
        type="button"
        variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={toggleBold}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={toggleItalic}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={toggleUnderline}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={toggleStrike}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <div className="w-[1px] h-6 bg-border mx-1" />
      <Button
        type="button"
        variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={toggleBullet}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={toggleOrdered}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <div className="w-[1px] h-6 bg-border mx-1" />
      <input
        type="color"
        onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
        value={editor.getAttributes('textStyle').color || '#000000'}
        className="h-7 w-7 p-0 border-0 rounded cursor-pointer"
        title="Đổi màu chữ"
      />
    </div>
  )
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[100px] px-4 py-3 bg-white',
      },
    },
    onUpdate: ({ editor }) => {
      // Return HTML
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
  })

  return (
    <div className={cn("flex flex-col w-full rounded-md border border-input shadow-sm overflow-hidden", className)}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="flex-1 overflow-y-auto min-h-[100px] cursor-text" />
    </div>
  )
}
