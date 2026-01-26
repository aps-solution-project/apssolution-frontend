import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  ImageIcon,
  LinkIcon,
  Highlighter,
  Paintbrush,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = [
  "#000000",
  "#ef4444",
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
];

export default function Editor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const addImage = () => {
    const url = prompt("이미지 URL 입력");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = prompt("링크 입력");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={16} />
        </Btn>

        <Btn onClick={addLink}>
          <LinkIcon size={16} />
        </Btn>

        <Btn onClick={addImage}>
          <ImageIcon size={16} />
        </Btn>

        {/* 글자색 */}
        {COLORS.map((c) => (
          <button
            key={c}
            className="w-5 h-5 rounded-full border"
            style={{ background: c }}
            onClick={() => editor.chain().focus().setColor(c).run()}
          />
        ))}

        {/* 하이라이트 */}
        <Btn
          onClick={() =>
            editor.chain().focus().toggleHighlight({ color: "#fde047" }).run()
          }
        >
          <Highlighter size={16} />
        </Btn>

        {/* 색상 초기화 */}
        <Btn onClick={() => editor.chain().focus().unsetColor().run()}>
          <Paintbrush size={16} />
        </Btn>
      </div>

      <EditorContent
        editor={editor}
        className="min-h-[320px] p-4 prose max-w-none focus:outline-none"
      />
    </div>
  );
}

function Btn({ children, onClick }) {
  return (
    <Button size="icon" variant="ghost" onClick={onClick}>
      {children}
    </Button>
  );
}
