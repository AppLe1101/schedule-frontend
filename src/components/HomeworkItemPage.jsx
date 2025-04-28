import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Loading from "./Loading";
import "./styles/HomeworkItemPage.css";
import { toast } from "react-toastify";

const HomeworkItemPage = ({ user, apiUrl, token }) => {
  const { id } = useParams();
  const [homework, setHomework] = useState({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });

  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mySubmission, setMySubmission] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

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

  const fetchSubmission = async () => {
    try {
      if (user.role === "student") {
        try {
          const res = await axios.get(
            `${apiUrl}/api/submission/my/${homework._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setMySubmission(res.data);
        } catch (err) {
          if (err.response?.status === 404) {
            setMySubmission(null);
          } else {
            toast.error("Ошибка при загрузке сдачи");
            console.error("Ошибка при загрузке сдачи:", err);
          }
        }
      } else {
        const res = await axios.get(
          `${apiUrl}/api/submission/by-homework/${homework._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSubmissionsList(res.data);
      }
    } catch (err) {
      console.error("Ошибка при загрузке сдач:", err);
    }
  };

  useEffect(() => {
    if (homework._id) {
      fetchSubmission();
    }
  }, [homework, token, apiUrl]);

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

  const uploadFilesToCloudinary = async (files) => {
    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("homeworkSubmission", file);

      toast.info(`Загрузка файла ${i + 1} из ${files.length}...`, {
        autoClose: 1000,
      });

      const res = await axios.post(
        `${apiUrl}/api/submission/upload-submission`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      res.data.files.forEach((f) => {
        uploadedUrls.push(f.url);
      });
    }
    return uploadedUrls;
  };

  const handleSubmitHomework = async () => {
    if (!submissionText && submissionFile.length === 0) {
      toast.error("Пожалуйста, добавьте текст или файл!");
      return;
    }
    if (!homework._id) {
      toast.error("Ошибка: ID домашнего задания не найден");
      return;
    }
    try {
      setIsSubmitting(true);

      let fileUrls = [];
      if (submissionFile.length > 0) {
        fileUrls = await uploadFilesToCloudinary(submissionFile);
      }

      await axios.post(
        `${apiUrl}/api/submission`,
        {
          homeworkId: homework._id,
          text: submissionText,
          fileUrls,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Работа успешно отправлена!");
      setSubmissionText("");
      setSubmissionFile([]);
      await fetchSubmission();
    } catch (err) {
      console.error("Ошибка при отправке работы:", err);
      toast.error("Ошибка при отправке работы");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSubmissionFile(files);
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
          <div className="edit-buttons-container">
            <button onClick={handleUpdate}>Сохранить</button>
            <button onClick={() => setEditMode(false)}>Отмена</button>
          </div>
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

      {/* СДАЧА ДОМАШКИ */}
      {user.role === "student" && !mySubmission && (
        <div className="homework-submission">
          <h3>Сдать ДЗ</h3>
          <textarea
            placeholder="Текст ответа..."
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
          />
          <input
            type="file"
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
            multiple
            onChange={handleFileChange}
          />
          <button
            onClick={handleSubmitHomework}
            disabled={isSubmitting}
            className="submit-homework-button"
          >
            {isSubmitting ? "Отправка..." : "Отправить"}
          </button>
          {submissionFile.length > 0 && (
            <div className="file-preview-container">
              {submissionFile.map((file, idx) => (
                <div key={idx} className="file-preview">
                  📄 {file.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {user.role === "student" && mySubmission && (
        <div className="your-submission">
          <p>{mySubmission.text || "Нет ответа"}</p>
          {mySubmission.fileUrls?.length > 0 && (
            <div className="submitted-files">
              {mySubmission.fileUrls.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="file-download-card"
                >
                  📎 Файл {idx + 1}
                </a>
              ))}
            </div>
          )}
          <p>📅 Сдано: {new Date(mySubmission.createdAt).toLocaleString()}</p>
        </div>
      )}

      {user.role !== "student" && submissionsList.length > 0 && (
        <div className="submission-list">
          <h3 style={{ margin: "10px auto" }}>Работы учащихся</h3>
          <table className="submission-table">
            <thead>
              <tr>
                <th>Ученик</th>
                <th>Ответ</th>
                <th>Файл</th>
              </tr>
            </thead>
            <tbody>
              {submissionsList.map((sub) => (
                <tr key={sub._id}>
                  <td>
                    <Link to={`/profile/${sub.studentId._id}`}>
                      {sub.studentId?.username || "Неизвестный студент"}
                    </Link>
                  </td>
                  <td>
                    {sub.text && (
                      <button
                        className="open-homework-text-button"
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        🔍 Посмотреть весь ответ
                      </button>
                    )}
                  </td>
                  <td>
                    {sub.fileUrls?.length > 0
                      ? sub.fileUrls.map((file, idx) => (
                          <a
                            key={idx}
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="download-button"
                          >
                            📎 Скачать файл {idx + 1}
                          </a>
                        ))
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSubmission && (
        <div
          className="submission-modal-overlay"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="submission-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Ответ учащегося</h4>
            <div className="submission-text">{selectedSubmission.text}</div>
            <button
              className="close-modal-button"
              onClick={() => setSelectedSubmission(null)}
            >
              ✖ Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeworkItemPage;
