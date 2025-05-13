// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { shorterName } from "./utils/shorterName";
import "./styles/CommentSection.css";
import { motion } from "framer-motion";

const CommentSection = ({ apiUrl, token, targetUserId, currentUser }) => {
  const enableAnimations = !currentUser?.enableAnimations;
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
          {comments.map((c, index) => (
            <motion.li
              key={c._id}
              className="comment-item"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                bounce: 0.5,
                delay: index * 0.1,
              }}
            >
              <Link to={`/profile/${c.author?._id}`}>
                <span className="comment-author">
                  <img
                    className="comments-user-avatar"
                    src={c.author?.avatar}
                    alt="user avatar"
                  />
                  {shorterName(c.author?.username)}
                </span>
              </Link>
              -<span className="comment-text"> {c.text}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommentSection;
