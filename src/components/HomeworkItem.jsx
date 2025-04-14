import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/HomeworkItem.css";

const HomeworkItem = ({ user, hw, isHighlighted, isEditable, onDelete }) => {
  const isAuthor = hw.createdBy._id === user._id;
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/homework/${hw._id}`);
  };

  return (
    <div className="homework-container">
      <div
        className={`homework-item ${isHighlighted ? "highlighted" : ""}`}
        onClick={handleClick}
      >
        {/* Предмет */}
        <div className="homework-field homework-subject">
          <strong>{hw.subject}</strong>
        </div>

        {/* Описание */}
        <div className="homework-field homework-description">
          <span>{hw.description}</span>
        </div>

        {/* Файлы */}
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
                📎 Файл {index + 1}
              </a>
            ))}
          </div>
        )}

        {/* Дата и преподаватель */}
        <div className="homework-meta-block">
          <span className="homework-date">
            📅 {new Date(hw.createdAt).toLocaleDateString()}
          </span>
          <Link to={`/profile/${hw.createdBy._id}`} className="homework-meta">
            👨‍🏫 {hw.createdBy.username}
          </Link>
        </div>
        {isAuthor && (
          <button onClick={() => onDelete(hw._id)} className="delete-btn">
            ❌
          </button>
        )}
      </div>
    </div>
  );
};

export default HomeworkItem;
