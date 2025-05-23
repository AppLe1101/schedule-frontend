// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import SearchBar from "./SearchBar";
import Loading from "./Loading";
import TiptapEditor from "./TiptapEditor";
import NewsRenderer from "./NewsRenderer";
import "./styles/MainPage.css";
import { motion } from "framer-motion";

const premiumTexts = [
  {
    title: "Открой новые возможности с LearningPortal Premium",
    description:
      "Получи доступ к автопроверке ДЗ с помощью ИИ, подробным графикам успеваемости, уникальному оформлению профиля и другим премиум-функциям.",
  },
  {
    title: "Прокачай свой учебный опыт!",
    description:
      "Premium-аккаунт откроет для тебя новые горизонты: умная проверка заданий, аналитика по предметам, эксклюзивные темы и бонусы профиля.",
  },
  {
    title: "Premium — всё лучшее в одном аккаунте.",
    description: "Успеваемость. ИИ. Стиль. Контроль.",
  },
  {
    title: "Сделай учёбу удобнее и интереснее.",
    description:
      "С премиум-доступом ты получаешь больше: умные функции, индивидуальные графики, красивые профили и удобство на каждом шагу.",
  },
];

const MainPage = ({ user, token, apiUrl }) => {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const highlightRef = useRef(null);
  const [news, setNews] = useState([]);
  const [postNews, setPostNews] = useState({ title: "", content: "" });
  const [editingItem, setEditingItem] = useState(null);
  const [newNews, setNewNews] = useState([]);
  const [marked, setMarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    image: "",
  });
  const [text] = useState(() => {
    return premiumTexts[Math.floor(Math.random() * premiumTexts.length)];
  });

  const isAuthorized =
    user && (user.role === "director" || user.role === "editor");

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      const timer = setTimeout(() => {
        highlightRef.current?.classList.remove("highlighted");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightId]);

  useEffect(() => {
    fetchNews();
  }, [token, apiUrl, user, marked]);

  const fetchNews = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/news`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allNews = res.data;
      setNews(allNews);

      // ОПРЕДЕЛЯЕТ НОВЫЙ СООБЩЕНИЯ (непрочитанные)
      const unread = allNews.filter(
        (n) => !(user.readNews || []).includes(n._id)
      );
      setNewNews(unread);

      // ОТМЕЧАЕТ СООБЩЕНИЕ КАК ПРОЧТЕННОЕ
      if (unread.length > 0 && !marked) {
        const unreadNewsIds = unread.map((n) => n._id);

        await axios.post(
          `${apiUrl}/api/news/mark-read`,
          { newsIds: unreadNewsIds },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedUser = {
          ...user,
          readNews: [...(user.readNews || []), ...unreadNewsIds],
        };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        //setUser(updatedUser);
        setMarked(true);
      }
    } catch (err) {
      console.error("Ошибка при загрузке новостей:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitEdit = () => {
    axios
      .put(
        `${apiUrl}/api/news/${editingItem._id}`,
        { ...editForm },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setNews((prev) =>
          prev.map((n) => (n._id === res.data._id ? res.data : n))
        );
        setEditingItem(null);
      })
      .catch((err) => console.error("Ошибка при редактировании", err));
  };

  // PUBLISH

  const handlePublish = async () => {
    try {
      await axios.post(
        `${apiUrl}/api/news`,
        {
          title: postNews.title,
          content: content,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPostNews({ title: "", content: "" });
      const res = await axios.get(`${apiUrl}/api/news`);
      setNews(res.data);
    } catch (err) {
      console.error("Ошибка при публикации новости", err);
    }
    fetchNews();
  };

  // BUTTONS

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNews(news.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Ошибка при удалении новости", err);
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      title: item.title,
      content: item.content,
      image: item.image || "",
    });
  };

  // RETURN
  return (
    <motion.div
      className="news-page glass-card"
      initial={{ opacity: 1, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="news-title" style={{ marginTop: "0" }}>
        Новости
      </h2>
      <SearchBar token={token} apiUrl={apiUrl} user={user} />
      {/* Запостить новое сообщение */}
      {isAuthorized && (
        <div className="news-form">
          <input
            type="text"
            placeholder="Заголовок"
            value={postNews.title}
            onChange={(e) =>
              setPostNews({ ...postNews, title: e.target.value })
            }
          />
          <TiptapEditor
            apiUrl={apiUrl}
            token={token}
            initialContent={news?.content}
            onChange={(json) => setContent(json)}
            className="edit-input-textarea"
          />
          <button onClick={handlePublish}>Опубликовать</button>
        </div>
      )}
      {/* Список новостей */}
      {loading && <Loading className="profile-loading" />}
      {news.length > 0 ? (
        <div className="news-list">
          {!user.premium?.isActive && (
            <div className="premium-ad">
              <div className="news-item-ad">
                <div className="ad-image">
                  <img
                    src="img/onboarding/premium-main_full.png"
                    alt="premium-ad-image"
                  />
                </div>
                <div className="ad-text">
                  <h2>{text.title}</h2>
                  <p>{text.description}</p>
                  <a href="/premium">
                    <button>Оформить премиум</button>
                  </a>
                </div>
              </div>
            </div>
          )}

          {news.map((item, index) => {
            const isNew = newNews.some((n) => n._id === item._id);
            const showDivider =
              index > 0 &&
              newNews.some((n) => n._id === news[index - 1]._id) &&
              !isNew;
            return (
              <React.Fragment key={item._id}>
                {showDivider && <hr className="news-divider" />}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                    bounce: 0.5,
                    delay: index * 0.1,
                  }}
                  ref={item._id === highlightId ? highlightRef : null}
                  className={`news-item ${
                    item._id === highlightId ? "highlighted" : ""
                  }`}
                >
                  {editingItem?._id === item._id ? (
                    <div className="edit-form">
                      <input
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        className="edit-input-field"
                      />
                      <TiptapEditor
                        apiUrl={apiUrl}
                        token={token}
                        initialContent={editForm.content}
                        onChange={(json) =>
                          setEditForm((prev) => ({ ...prev, content: json }))
                        }
                        className="edit-input-textarea"
                      />
                      <input
                        value={editForm.image}
                        placeholder="Ссылка на изображение"
                        onChange={(e) =>
                          setEditForm({ ...editForm, image: e.target.value })
                        }
                        style={{ display: "none" }}
                      />
                      <div className="edit-btns">
                        <button onClick={submitEdit}>💾 Сохранить</button>
                        <button onClick={() => setEditingItem(null)}>
                          ❌ Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3>{item.title}</h3>
                      {item.image && (
                        <img src={item.image} alt="" className="news-image" />
                      )}
                      <NewsRenderer content={item.content} />
                      <small>
                        Опубликовано:{" "}
                        {new Date(item.createdAt).toLocaleString()}
                        {item.author && ` • ${item.author?.username}`}
                      </small>
                    </div>
                  )}
                  <div className="news-control-buttons">
                    {isAuthorized && (
                      <button onClick={() => handleDelete(item._id)}>
                        Удалить
                      </button>
                    )}
                    {user.role === "director" ||
                    user.username === item.author?.username ? (
                      <button onClick={() => startEdit(item)}>
                        Редактировать
                      </button>
                    ) : null}
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>
      ) : null}
    </motion.div>
  );
};

export default MainPage;
