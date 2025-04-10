import React from "react";
import { Link } from "react-router-dom";

/**
 * Рекурсивная отрисовка контента TipTap JSON
 */
const renderNode = (node, index) => {
  const { type, attrs, content, text } = node;

  switch (type) {
    case "paragraph":
      return <p key={index}>{content?.map(renderNode)}</p>;

    case "text":
      let el = text;

      if (node.marks) {
        node.marks.forEach((mark) => {
          switch (mark.type) {
            case "bold":
              el = <strong key={index}>{el}</strong>;
              break;
            case "italic":
              el = <em key={index}>{el}</em>;
              break;
            case "underline":
              el = <u key={index}>{el}</u>;
              break;
            case "strike":
              el = <s key={index}>{el}</s>;
              break;
            case "highlight":
              el = <mark key={index}>{el}</mark>;
              break;
            default:
              break;
          }
        });
      }

      return el;

    case "mention":
      return (
        <Link key={index} to={`/profile/${attrs.id}`} className="mention-link">
          {attrs.label}
        </Link>
      );

    default:
      return null;
  }
};

const NewsRenderer = ({ content }) => {
  if (!content || content.type !== "doc") return null;

  return <div className="news-renderer">{content.content.map(renderNode)}</div>;
};

export default NewsRenderer;
