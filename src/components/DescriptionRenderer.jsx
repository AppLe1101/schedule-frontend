import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Highlight from "@tiptap/extension-highlight";
import Mention from "@tiptap/extension-mention";

const DescriptionRenderer = ({ content }) => {
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Mention.configure({
        HTMLAttributes: { class: "mention" },
      }),
    ],
    content,
  });

  if (!editor) return null;

  return <EditorContent editor={editor} />;
};

export default DescriptionRenderer;
