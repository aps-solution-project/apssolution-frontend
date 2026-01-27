import { Button } from "@/components/ui/button";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Highlighter,
  ImageIcon,
  Italic,
  LinkIcon,
  Paintbrush,
  Underline as UnderlineIcon,
} from "lucide-react";
import { useEffect } from "react";

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
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  /** ✅ 외부 value 변경 시 에디터 내용 동기화 */
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  /** ✅ 이미지 삽입 */
  const addImage = () => {
    const url = prompt("이미지 URL 입력");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  /** ✅ 링크 삽입 (프로토콜 자동 보정) */
  const addLink = () => {
    let url = prompt("링크 입력");
    if (!url) return;

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    editor.chain().focus().setLink({ href: url }).run();
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
            type="button"
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

/** ✅ form 내부에서도 submit 안 되도록 type="button" 필수 */
function Btn({ children, onClick }) {
  return (
    <Button type="button" size="icon" variant="ghost" onClick={onClick}>
      {children}
    </Button>
  );
}
