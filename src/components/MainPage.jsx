import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MainPage.css";

const MainPage = ({ user, token, apiUrl }) => {
  const [news, setNews] = useState([]);
  const [postNews, setPostNews] = useState({ title: "", content: "" });
  const [editingItem, setEditingItem] = useState(null);
  const [newNews, setNewNews] = useState([]);
  const [marked, setMarked] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    image: "",
  });

  const isAuthorized =
    user && (user.role === "director" || user.role === "editor");

  //  useEffect(() => {
  //    axios
  //      .get(`${apiUrl}/api/news`)
  //      .then((res) => setNews(res.data))
  //      .catch((err) => console.error("Ошибка при загрузке новостей", err));
  //  }, [apiUrl]);

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
        localStorage.setItem("user", JSON.stringify(updatedUser));
        //setUser(updatedUser);
        setMarked(true);
      }
    } catch (err) {
      console.error("Ошибка при загрузке новостей:", err);
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
      await axios.post(`${apiUrl}/api/news`, postNews, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    <div className="news-page glass-card">
      <h2 className="news-title">Новости</h2>
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
          <textarea
            placeholder="Контент"
            value={postNews.content}
            onChange={(e) =>
              setPostNews({ ...postNews, content: e.target.value })
            }
          />
          <button onClick={handlePublish}>Опубликовать</button>
        </div>
      )}

      {/* Список новостей */}
      {news.length > 0 ? (
        <div className="news-list">
          {news.map((item, index) => {
            const isNew = newNews.some((n) => n._id === item._id);
            const showDivider =
              index > 0 &&
              newNews.some((n) => n._id === news[index - 1]._id) &&
              !isNew;
            return (
              <React.Fragment key={item._id}>
                {showDivider && <hr className="news-divider" />}
                <div className="news-item">
                  {editingItem?._id === item._id ? (
                    <div className="edit-form">
                      <input
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        className="edit-input-field"
                      />
                      <textarea
                        value={editForm.content}
                        onChange={(e) =>
                          setEditForm({ ...editForm, content: e.target.value })
                        }
                        className="edit-input-textarea"
                      />
                      <input
                        value={editForm.image}
                        placeholder="Ссылка на изображение"
                        onChange={(e) =>
                          setEditForm({ ...editForm, image: e.target.value })
                        }
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
                      <p className="news-content">{item.content}</p>
                      <small>
                        Опубликовано:{" "}
                        {new Date(item.createdAt).toLocaleString()}
                        {item.author && ` • ${item.author?.username}`}
                      </small>
                    </div>
                  )}
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
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <p>Новостей нет</p>
      )}
    </div>
  );
};

export default MainPage;
