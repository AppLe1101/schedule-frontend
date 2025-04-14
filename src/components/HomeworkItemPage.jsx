import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Loading from "./Loading";
import "./styles/HomeworkItemPage.css";

const HomeworkItemPage = ({ user, apiUrl, token }) => {
  const { id } = useParams();
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const navigate = useNavigate();

  const fetchHomework = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/homework/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHomework(res.data);
      setForm({
        title: res.data.subject,
        description: res.data.description,
      });
    } catch (err) {
      console.error("Ошибка при получении ДЗ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, [id, apiUrl, token]);

  const handleUpdate = async () => {
    try {
      await axios.patch(`${apiUrl}/api/homework/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHomework((prev) => ({ ...prev, ...form }));
      setEditMode(false);
    } catch (err) {
      console.error("Ошибка при обновлении ДЗ:", err);
    }
  };

  if (loading) return <Loading />;
  if (!homework)
    return (
      <div className="hw-error-page">
        Ошибка загрузки информации о дз
        <button onClick={() => navigate(-1)} className="back-button">
          Вернуться назад
        </button>
      </div>
    );

  return (
    <div className="hw-container">
      <button onClick={() => navigate(-1)} className="back-button">
        Назад
      </button>

      {editMode ? (
        <div className="hw-editmode">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <button onClick={handleUpdate}>Сохранить</button>
          <button onClick={() => setEditMode(false)}>Отмена</button>
        </div>
      ) : (
        <div className="hw-info">
          <div className="hw-info-header">
            <h1>{homework.subject}</h1>
            <h3>{new Date(homework.date).toLocaleDateString()}</h3>
          </div>
          <div className="hw-about">
            <p className="hw-teacher">
              Преподаватель:{" "}
              <Link
                to={`/profile/${homework.createdBy?._id}`}
                className="hw-author"
              >
                {homework.createdBy?.username}
              </Link>
            </p>
            <h3>{new Date(homework.createdAt).toLocaleDateString()}</h3>
          </div>
          <p className="hw-description">{homework.description}</p>

          {homework.files && homework.files.length > 0 && (
            <div className="hw-files">
              <p>Файлы:</p>
              <ul className="hw-files-list">
                {homework.files.map((file, index) => (
                  <a
                    key={index}
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-link"
                  >
                    📎 Файл {index + 1}
                  </a>
                ))}
              </ul>
            </div>
          )}

          {(user.role === "teacher" || user.role === "director") && (
            <button onClick={() => setEditMode(true)}>Редактировать</button>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeworkItemPage;
