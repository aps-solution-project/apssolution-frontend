import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Placeholder } from "@tiptap/extensions";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Palette,
  Highlighter,
  ChevronDown,
  List as ListIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ===== 색상 ===== */

const TEXT_COLORS = [
  "#000000",
  "#333333",
  "#666666",
  "#999999",
  "#FFFFFF",
  "#FF0000",
  "#FFA500",
  "#FFD700",
  "#008000",
  "#00CED1",
  "#0000FF",
  "#4B0082",
  "#800080",
  "#FF1493",
  "#8B0000",
];

const HIGHLIGHT_COLORS = [
  "#FFFF00",
  "#FFF3B0",
  "#FFB3B3",
  "#FFD59E",
  "#B6F2C2",
  "#9EE7F5",
  "#B5CCFF",
  "#D6C2FF",
  "#FFC1E3",
  "#E0E0E0",
];

/* ===== Toolbar ===== */

const Toolbar = ({ editor }) => {
  if (!editor) return null;

  const fileInputRef = useRef(null);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      editor.chain().focus().setImage({ src: event.target.result }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL 입력", prev || "");
    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const valid = url.startsWith("http") ? url : `https://${url}`;

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: valid })
      .run();
  }, [editor]);

  return (
    <div className="border-b bg-gray-50 sticky top-0 z-10 flex flex-wrap gap-1 p-2">
      {/* Undo / Redo */}
      <div className="flex gap-1 border-r pr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={<Undo size={16} />}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={<Redo size={16} />}
        />
      </div>

      {/* Text style */}
      <div className="flex gap-1 border-r pr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          icon={<Bold size={16} />}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          icon={<Italic size={16} />}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          icon={<UnderlineIcon size={16} />}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          icon={<Strikethrough size={16} />}
        />
      </div>

      {/* Color */}
      <div className="flex gap-1 border-r pr-2">
        <ColorPicker
          icon={<Palette size={16} />}
          colors={TEXT_COLORS}
          active={editor.getAttributes("textStyle").color}
          onSelect={(c) => editor.chain().focus().setColor(c).run()}
          onReset={() => editor.chain().focus().unsetColor().run()}
          show={showTextColorPicker}
          setShow={setShowTextColorPicker}
          closeOther={() => setShowHighlightPicker(false)}
        />

        <ColorPicker
          icon={<Highlighter size={16} />}
          colors={HIGHLIGHT_COLORS}
          active={editor.getAttributes("highlight").color}
          onSelect={(c) =>
            editor.chain().focus().toggleHighlight({ color: c }).run()
          }
          onReset={() => editor.chain().focus().unsetHighlight().run()}
          show={showHighlightPicker}
          setShow={setShowHighlightPicker}
          closeOther={() => setShowTextColorPicker(false)}
        />
      </div>

      {/* Align */}
      <div className="flex gap-1 border-r pr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          icon={<AlignLeft size={16} />}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          icon={<AlignCenter size={16} />}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          icon={<AlignRight size={16} />}
        />
      </div>

      {/* Link / Image */}
      <div className="flex gap-1">
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive("link")}
          icon={<LinkIcon size={16} />}
        />
        <ToolbarButton
          onClick={() => fileInputRef.current.click()}
          icon={<ImageIcon size={16} />}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageUpload}
        />
      </div>
    </div>
  );
};

/* ===== Color Picker ===== */

const ColorPicker = ({
  icon,
  colors,
  active,
  onSelect,
  onReset,
  show,
  setShow,
  closeOther,
}) => (
  <div className="relative flex items-center">
    <button
      type="button"
      onClick={() => {
        setShow(!show);
        closeOther();
      }}
      className={cn(
        "flex items-center gap-1 h-8 px-2 rounded-md hover:bg-gray-100 transition-colors",
        show && "bg-gray-100",
      )}
    >
      {icon}
      <ChevronDown size={12} />
    </button>

    {show && (
      <>
        <div className="absolute top-full left-0 mt-2 bg-white border shadow-lg rounded p-2 z-50 w-48">
          <div className="grid grid-cols-5 gap-1 mb-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  onSelect(c);
                  setShow(false);
                }}
                className={cn(
                  "w-6 h-6 rounded-full border",
                  active === c && "ring-2 ring-black",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={onReset}
          >
            색상 제거
          </Button>
        </div>
        <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
      </>
    )}
  </div>
);

const ToolbarButton = ({ onClick, isActive, disabled, icon }) => (
  <Button
    type="button"
    size="sm"
    variant="ghost"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "h-8 w-8 p-0",
      isActive && "bg-gray-200 ring-1 ring-gray-300",
    )}
  >
    {icon}
  </Button>
);

/* ===== Main Editor ===== */

export default function BoardEditor({ value, onChange }) {
  const router = useRouter();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder: "내용을 입력하세요..." }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: true, allowBase64: true }),
      TextAlign.configure({ types: ["paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-[400px] px-6 py-4 focus:outline-none max-w-none [&_p]:my-1 [&_br]:block",
      },
    },

    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <Toolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
