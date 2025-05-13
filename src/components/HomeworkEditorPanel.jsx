// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useState, useEffect } from "react";
import axios from "axios";
import HomeworkItem from "./HomeworkItem";
import "./styles/HomeworkEditorPanel.css";

const HomeworkEditorPage = ({ token, apiUrl, user }) => {
  const [groups, setGroups] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    groupId: "",
    subject: "",
    date: "",
    description: "",
    files: [],
  });
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const endpoint =
          user.role === "director"
            ? `${apiUrl}/api/groups`
            : `${apiUrl}/api/groups/teacher/${user._id}`;
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(res.data);
      } catch (err) {
        console.error("Ошибка при загрузке групп:", err);
      }
    };

    fetchGroups();
  }, [user, apiUrl, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, files: Array.from(e.target.files) }));
  };

  const uploadFiles = async () => {
    if (!formData.files.length) return [];

    try {
      setUploading(true);
      const uploaded = [];

      for (const file of formData.files) {
        const form = new FormData();
        form.append("file", file);

        const res = await axios.post(`${apiUrl}/api/homework/upload`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        uploaded.push(res.data.url);
      }

      return uploaded;
    } catch (err) {
      console.error("Ошибка при загрузке файла:", err);
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const uploadedUrls = await uploadFiles();

      const payload = {
        groupId: formData.groupId,
        subjectId: formData.subject,
        date: formData.date,
        description: formData.description,
        files: uploadedUrls,
      };

      await axios.post(`${apiUrl}/api/homework`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFormData({
        groupId: "",
        subject: "",
        date: "",
        description: "",
        files: [],
      });
      fetchHomeworkList();
    } catch (err) {
      console.error("Ошибка при создании ДЗ:", err);
    }
  };

  const fetchHomeworkList = async () => {
    if (!formData.groupId) return;
    try {
      const res = await axios.get(
        `${apiUrl}/api/homework/group/${formData.groupId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHomeworkList(res.data);
    } catch (err) {
      console.error("Ошибка при загрузке списка ДЗ:", err);
    }
  };

  const handleDeleteHomework = async (homeworkId) => {
    if (!window.confirm("Вы точно хотите удалить это задание?")) return;
    try {
      await axios.delete(`${apiUrl}/api/homework/${homeworkId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHomeworkList(); // Обновляем список после удаления
    } catch (err) {
      console.error("Ошибка при удалении домашки:", err);
    }
  };

  useEffect(() => {
    if (formData.groupId) {
      const fetchSubjects = async () => {
        try {
          const res = await axios.get(
            `${apiUrl}/api/subjects/${formData.groupId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setSubjects(res.data);
        } catch (err) {
          console.error("Ошибка при загрузке предметов:", err);
        }
      };

      fetchSubjects();
    }
  }, [formData.groupId]);

  useEffect(() => {
    fetchHomeworkList();
  }, [formData.groupId]);

  return (
    <div className="homework-editor">
      <div className="homework-main-header">
        <h2>Добавить домашнее задание</h2>

        <div className="homework-main-header-h1">
          <select
            name="groupId"
            value={formData.groupId}
            onChange={handleChange}
          >
            <option disabled value="">
              Выбрать группу
            </option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>

          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            disabled={!formData.groupId || subjects.length === 0}
          >
            <option disabled value="">
              Выбрать предмет
            </option>
            {subjects.map((subj) => (
              <option key={subj._id} value={subj._id}>
                {subj.name}
              </option>
            ))}
          </select>

          <input
            className="input-type-date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        <textarea
          className="input-type-area"
          name="description"
          placeholder="Описание домашнего задания"
          value={formData.description}
          onChange={handleChange}
        />

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="input-type-file"
        />

        {uploading && <p>Загрузка файлов...</p>}

        {formData.files.length > 0 && (
          <div className="uploaded-file-preview">
            <p>Прикрепленные файлы:</p>
            {formData.files.map((f, index) => (
              <div key={index} className="file-preview-item">
                {f.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(f)}
                    alt={`preview-${index}`}
                    className="preview-image"
                  />
                ) : (
                  <div>
                    📎 <strong>{f.name}</strong>
                  </div>
                )}
                <button
                  className="delete-file-button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      files: prev.files.filter((_, i) => i !== index),
                    }))
                  }
                >
                  ❌ Удалить
                </button>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleSubmit}>Добавить</button>
      </div>

      <h3>Список ДЗ:</h3>
      <div className="homework-search-bar">
        <input
          type="text"
          placeholder="Поиск по ДЗ (например: предмет дд.мм.гг)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {homeworkList
        .filter((hw) => {
          const lowerQuery = searchQuery.toLowerCase();
          const dateRegex = /(\d{2})[./-](\d{2})[./-](\d{2,4})/;
          const dateMatch = lowerQuery.match(dateRegex);
          let foundDateStr = null;
          if (dateMatch) {
            const [_, day, month, year] = dateMatch;
            const shortYear = year.length === 2 ? year : year.slice(-2);
            foundDateStr = `${day}.${month}.${shortYear}`;
          }
          const textQuery = lowerQuery.replace(dateRegex, "").trim();
          const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = String(date.getFullYear()).slice(-2);
            return `${day}.${month}.${year}`;
          };
          const hwDate = formatDate(hw.date);
          const subjectMatch =
            hw.subject &&
            typeof hw.subject === "object" &&
            hw.subject.name?.toLowerCase().includes(textQuery);
          const descriptionMatch = hw.description
            .toLowerCase()
            .includes(textQuery);
          const dateMatches = foundDateStr ? hwDate === foundDateStr : true;
          if (foundDateStr && textQuery) {
            return (subjectMatch || descriptionMatch) && dateMatches;
          } else if (foundDateStr) {
            return hwDate === foundDateStr;
          } else {
            return subjectMatch || descriptionMatch;
          }
        })
        .map((hw) => (
          <HomeworkItem
            user={user}
            token={token}
            apiUrl={apiUrl}
            key={hw._id}
            hw={hw}
            onDelete={handleDeleteHomework}
            onUpdate={fetchHomeworkList}
          />
        ))}
    </div>
  );
};

export default HomeworkEditorPage;
