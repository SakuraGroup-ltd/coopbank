"use client";

// Tiptap rich editor wrapped for the Studio. Outputs HTML on every change,
// so the parent (the blog composer) can debounce-save to Payload. The toolbar
// is a sticky top bar with the most-used controls + a floating selection
// bubble for inline formatting on highlighted text.
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Typography from "@tiptap/extension-typography";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "../ui/cn";
import { useEffect } from "react";

type Props = {
  initialHtml?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
};

export function Tiptap({ initialHtml = "", placeholder = "Start writing…", onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-cb-navy underline hover:text-cb-green" },
      }),
      Placeholder.configure({ placeholder, emptyEditorClass: "is-editor-empty" }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "tiptap-editor prose prose-studio max-w-none focus:outline-none min-h-[400px]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // When initialHtml changes externally (e.g. after server save returns new
  // content), sync without breaking the user's typing if they're mid-edit.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (initialHtml && initialHtml !== current && !editor.isFocused) {
      editor.commands.setContent(initialHtml, { emitUpdate: false });
    }
  }, [editor, initialHtml]);

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="tiptap-shell rounded-2xl border border-studio-border bg-studio-panel overflow-hidden">
      {/* Top toolbar */}
      <div className="sticky top-0 z-10 bg-studio-panel/95 backdrop-blur-sm border-b border-studio-border px-3 py-2 flex items-center gap-1 flex-wrap">
        <ToolGroup>
          <ToolButton
            label="Heading 1"
            icon={<Heading1 className="w-4 h-4" />}
            active={editor.isActive("heading", { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          />
          <ToolButton
            label="Heading 2"
            icon={<Heading2 className="w-4 h-4" />}
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          />
          <ToolButton
            label="Heading 3"
            icon={<Heading3 className="w-4 h-4" />}
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          />
        </ToolGroup>
        <Divider />
        <ToolGroup>
          <ToolButton
            label="Bold"
            icon={<Bold className="w-4 h-4" />}
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolButton
            label="Italic"
            icon={<Italic className="w-4 h-4" />}
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolButton
            label="Underline"
            icon={<UnderlineIcon className="w-4 h-4" />}
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <ToolButton
            label="Strikethrough"
            icon={<Strikethrough className="w-4 h-4" />}
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
        </ToolGroup>
        <Divider />
        <ToolGroup>
          <ToolButton
            label="Bullet list"
            icon={<List className="w-4 h-4" />}
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolButton
            label="Numbered list"
            icon={<ListOrdered className="w-4 h-4" />}
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <ToolButton
            label="Quote"
            icon={<Quote className="w-4 h-4" />}
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
          <ToolButton
            label="Code"
            icon={<Code className="w-4 h-4" />}
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          />
        </ToolGroup>
        <Divider />
        <ToolGroup>
          <ToolButton
            label="Link"
            icon={<LinkIcon className="w-4 h-4" />}
            active={editor.isActive("link")}
            onClick={setLink}
          />
        </ToolGroup>
        <div className="ml-auto flex items-center gap-1">
          <ToolButton
            label="Undo"
            icon={<Undo className="w-4 h-4" />}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          />
          <ToolButton
            label="Redo"
            icon={<Redo className="w-4 h-4" />}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          />
        </div>
      </div>

      {/* Floating selection toolbar */}
      <BubbleMenu
        editor={editor}
        className="rounded-lg border border-studio-border bg-studio-ink text-white shadow-xl px-1 py-1 flex items-center gap-0.5"
      >
        <BubbleBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-3.5 h-3.5" />
        </BubbleBtn>
        <BubbleBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-3.5 h-3.5" />
        </BubbleBtn>
        <BubbleBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-3.5 h-3.5" />
        </BubbleBtn>
        <BubbleBtn active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon className="w-3.5 h-3.5" />
        </BubbleBtn>
      </BubbleMenu>

      <div className="px-8 py-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function Divider() {
  return <span className="w-px h-5 bg-studio-border mx-1" />;
}

function ToolButton({
  icon,
  label,
  active,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "h-8 w-8 rounded-md inline-flex items-center justify-center transition-colors",
        "text-studio-ink-2 hover:bg-studio-soft hover:text-studio-ink",
        active && "bg-studio-ink/8 text-studio-ink",
        disabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
      )}
    >
      {icon}
    </button>
  );
}

function BubbleBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-7 w-7 rounded-md inline-flex items-center justify-center",
        "text-white/80 hover:text-white hover:bg-white/10",
        active && "bg-white/20 text-white",
      )}
    >
      {children}
    </button>
  );
}
