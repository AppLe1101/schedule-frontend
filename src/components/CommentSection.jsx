import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import "./styles/CommentSection.css";

const CommentSection = ({ apiUrl, token, targetUserId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/comments/${targetUserId}`);
      if (Array.isArray(res.data)) {
        setComments(res.data);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Ошбика при загрузке комментариев:", err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    try {
      await axios.post(
        `${apiUrl}/api/comments`,
        { targetUser: targetUserId, text },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setText("");
      fetchComments();
    } catch (err) {
      toast("Ошибка при отправке комментария");
      console.error("Ошибка при отправке комментария:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [targetUserId]);

  return (
    <div className="comment-section">
      <h3>Комментарии</h3>
      {currentUser && currentUser._id !== targetUserId && (
        <div className="comment-input">
          <textarea
            placeholder="Написать комментарий..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={handleSubmit}>Отправить</button>
        </div>
      )}
      {loading ? (
        <p>Загрузка...</p>
      ) : comments.length === 0 ? (
        <p>Комментариев нет</p>
      ) : (
        <ul className="comments-list">
          {comments.map((c) => (
            <li key={c._id} className="comment-item">
              <Link to={`/profile/${c.author?._id}`}>
                <span className="comment-author">
                  <img
                    className="comments-user-avatar"
                    src={c.author?.avatar}
                    alt="user avatar"
                  />
                  {c.author?.username}
                </span>
              </Link>
              -<span className="comment-text"> {c.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommentSection;
