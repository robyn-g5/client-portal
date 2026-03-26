'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@/lib/utils'
import { Bold, Italic, List, ListOrdered, Heading2, Heading3 } from 'lucide-react'

interface RichTextEditorProps {
  content?: string
  onChange?: (html: string) => void
  placeholder?: string
  className?: string
  name?: string
}

export function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Write here...',
  className,
  name,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none',
      },
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  const toolbarButtons = [
    {
      label: 'Bold',
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      label: 'Italic',
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      label: 'H2',
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
    },
    {
      label: 'H3',
      icon: Heading3,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
    },
    {
      label: 'Bullet List',
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      label: 'Numbered List',
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
    },
  ]

  return (
    <div className={cn('border border-[#E2E8F0] rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-[#E2E8F0] bg-[#F8F9FA]">
        {toolbarButtons.map((btn) => {
          const Icon = btn.icon
          return (
            <button
              key={btn.label}
              type="button"
              onClick={btn.action}
              title={btn.label}
              className={cn(
                'p-1.5 rounded text-sm transition-colors',
                btn.isActive
                  ? 'bg-[#3D4F5C] text-white'
                  : 'text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#1E2D3B]'
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="p-3 min-h-[150px]" />

      {/* Hidden input for form submission */}
      {name && (
        <input type="hidden" name={name} value={editor.getHTML()} />
      )}
    </div>
  )
}
