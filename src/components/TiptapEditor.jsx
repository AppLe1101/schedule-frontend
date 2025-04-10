import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Highlight from "@tiptap/extension-highlight";
import Mention from "@tiptap/extension-mention";
import Suggestion from "@tiptap/suggestion";
import Document from "@tiptap/extension-document";
import TextStyle from "@tiptap/extension-text-style";
import axios from "axios";

const TiptapEditor = ({ apiUrl, token, initialContent, onChange }) => {
  const editor = useEditor({
    extensions: [
      Document,
      TextStyle,
      StarterKit,
      Underline,
      Strike,
      Highlight,
      Mention.configure({
        HTMLAttributes: {
          class: "mention-link",
        },
        suggestion: {
          char: "@",
          startOfLine: false,
          items: async ({ query }) => {
            if (!query) return [];
            try {
              const res = await axios.get(
                `${apiUrl}/api/users/search?query=${query}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              return res.data.map((user) => ({
                id: user._id,
                label: user.username,
              }));
            } catch (err) {
              console.error("Ошибка при поиске пользователей:", err);
              return [];
            }
          },
          render: () => {
            let component;

            return {
              onStart: (props) => {
                component = document.createElement("div");
                component.className = "mention-dropdown";
                props.items.forEach((item) => {
                  const el = document.createElement("div");
                  el.className = "mention-item";
                  el.textContent = `@${item.label}`;
                  el.onclick = () => props.command(item);
                  component.appendChild(el);
                });
                const coords = props.clientRect?.();
                if (coords) {
                  component.style.position = "absolute";
                  component.style.top = `${coords.top + window.scrollY + 30}px`;
                  component.style.left = `${coords.left + window.scrollX}px`;
                  component.style.zIndex = 9999;
                }
                document.body.appendChild(component);
              },
              onUpdate(props) {
                if (!component) return;
                component.innerHTML = "";
                props.items.forEach((item) => {
                  const el = document.createElement("div");
                  el.className = "mention-item";
                  el.textContent = `@${item.label}`;
                  el.onclick = () => props.command(item);
                  component.appendChild(el);
                });
              },
              onExit() {
                component?.remove();
              },
            };
          },
        },
      }),
    ],
    content: initialContent || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  return <EditorContent editor={editor} />;
};

export default TiptapEditor;
