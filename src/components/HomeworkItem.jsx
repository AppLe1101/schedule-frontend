import React, { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./styles/HomeworkItem.css";

const HomeworkItem = ({ hw, user, token, apiUrl, onUpdate, onDelete }) => {
  const [editingField, setEditingField] = useState(null);
  const [editedHomework, setEditedHomework] = useState({ ...hw });
  const itemRef = useRef(null);
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const isHighlighted = hw._id === highlightId;

  useEffect(() => {
    if (isHighlighted && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      const timeout = setTimeout(() => {
        itemRef.current.classList.remove("highlighted");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isHighlighted]);

  const handleFieldChange = (field, value) => {
    setEditedHomework({ ...editedHomework, [field]: value });
  };

  const handleFieldSave = async (field) => {
    try {
      await axios.patch(
        `${apiUrl}/api/homework/${hw._id}`,
        { [field]: editedHomework[field] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingField(null);
      onUpdate();
    } catch (err) {
      console.error("Ошибка при обновлении ДЗ:", err);
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") handleFieldSave(field);
  };

  const isEditable = user.role === "teacher" || user.role === "director";
  const isAuthor = user._id === hw.createdBy._id;

  return (
    <div
      ref={itemRef}
      className={`homework-item ${isHighlighted ? "highlighted" : ""}`}
    >
      <div
        className="homework-field"
        style={{ position: "absolute", left: "12px" }}
      >
        {editingField === "subject" ? (
          <input
            value={editedHomework.subject}
            onChange={(e) => handleFieldChange("subject", e.target.value)}
            onBlur={() => handleFieldSave("subject")}
            onKeyDown={(e) => handleKeyDown(e, "subject")}
            autoFocus
          />
        ) : (
          <span
            onClick={() => isEditable && isAuthor && setEditingField("subject")}
            className="editable-text"
          >
            {hw.subject}
          </span>
        )}
      </div>

      <div
        className="homework-field"
        style={{ display: "flex", width: "100%", justifyContent: "center" }}
      >
        {editingField === "description" ? (
          <textarea
            value={editedHomework.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            onBlur={() => handleFieldSave("description")}
            onKeyDown={(e) => handleKeyDown(e, "description")}
            autoFocus
            style={{
              width: "60%",
              display: "flex",
              transform: "translateX(-100%)",
              maxWidth: "60%",
            }}
          />
        ) : (
          <span
            onClick={() =>
              isEditable && isAuthor && setEditingField("description")
            }
            className="editable-text"
            style={{
              maxWidth: "60%",
              display: "flex",
              transform: "translateX(-50px)",
            }}
          >
            {hw.description}
          </span>
        )}
      </div>

      {/* Отображение прикрепленных файлов */}
      {hw.files && hw.files.length > 0 && (
        <div className="homework-files">
          {hw.files.map((fileUrl, index) => (
            <a
              key={index}
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="homework-file-link"
            >
              📎 Прикреплённый файл {index + 1}
            </a>
          ))}
        </div>
      )}

      <div
        className="homework-field"
        style={{ position: "absolute", right: "125px" }}
      >
        {editingField === "date" ? (
          <input
            type="date"
            value={editedHomework.date.split("T")[0]}
            onChange={(e) => handleFieldChange("date", e.target.value)}
            onBlur={() => handleFieldSave("date")}
            onKeyDown={(e) => handleKeyDown(e, "date")}
            autoFocus
          />
        ) : (
          <span
            onClick={() => isEditable && isAuthor && setEditingField("date")}
            className="editable-text"
          >
            от {new Date(hw.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <Link to={`/profile/${hw.createdBy._id}`} className="homework-meta">
        👨‍🏫 {hw.createdBy.username}{" "}
      </Link>

      {isEditable && isAuthor && (
        <button onClick={() => onDelete(hw._id)} className="delete-btn">
          ❌
        </button>
      )}
    </div>
  );
};

export default HomeworkItem;
