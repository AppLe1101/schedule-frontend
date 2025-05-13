// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { saveAs } from "file-saver";
import axios from "axios";
import "./styles/GradebookBySubject.css";

const getCurrentAYAS = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  if (month >= 9) {
    return { year, semester: 1 };
  } else {
    return { year: year - 1, semester: 2 };
  }
};

const gradeOptions = {
  default: ["2", "3", "4", "5"],
  zachet: ["Зачёт", "Не зачёт"],
};

const typeOptions = ["Экзамен", "Зачёт", "Курсовая", "Практика"];

const GradebookBySubject = ({
  subject,
  groupId,
  selectedGroup,
  groupName,
  apiUrl,
  token,
  user,
}) => {
  const [students, setStudents] = useState([]);
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);

  const [availableYears, setAvailableYears] = useState([]);
  const [{ year, semester }, setCurrentPeriod] = useState(getCurrentAYAS());

  const [form, setForm] = useState({
    type: "",
    grade: "",
    date: "",
  });

  const subjectId = subject._id;

  const fetchData = async () => {
    try {
      const [studentsRes, entriesRes] = await Promise.all([
        axios.get(`${apiUrl}/api/groups/${groupId}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(
          `${apiUrl}/api/gradebook/by-subject/${subjectId}?academicYear=${year}&semester=${semester}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);
      setStudents(studentsRes.data);
      setEntries(entriesRes.data);

      const years = [...new Set(entriesRes.data.map((e) => e.academicYear))];
      setAvailableYears(years.sort((a, b) => b - a));
    } catch (err) {
      console.error("Ошибка при загрузке данных", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subjectId, year, semester]);

  const handleSave = async () => {
    if (!editingEntry) return;
    const payload = {
      studentId: editingEntry.studentId,
      teacher: user._id,
      subject: subjectId,
      semester,
      academicYear: year,
      type: form.type,
      grade: form.grade,
      date: form.date,
    };
    try {
      if (editingEntry._id) {
        await axios.put(
          `${apiUrl}/api/gradebook/${editingEntry._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(`${apiUrl}/api/gradebook/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      toast.success("Запись успешно сохранена");
      setEditingEntry(null);
      setForm({ type: "", grade: "", date: "" });
      fetchData();
    } catch (err) {
      console.error("Ошибка при сохранении записи", err);
      toast.error("Ошибка при сохранении");
    }
  };

  const handleEdit = (entry, studentId) => {
    setEditingEntry(entry || { studentId });
    setForm({
      type: entry?.type || "",
      grade: entry?.grade || "",
      date: entry?.date?.slice(0, 10) || "",
    });
  };

  const handleYearChange = (e) => {
    setCurrentPeriod((prev) => ({ ...prev, year: Number(e.target.value) }));
  };

  const handleSemesterChange = (selectedSemester) => {
    setCurrentPeriod((prev) => ({ ...prev, semester: selectedSemester }));
  };

  const downloadSubjectGradebook = async () => {
    try {
      const res = await axios.get(
        `${apiUrl}/api/gradebook/download/by-subject/${subjectId}/?group=${selectedGroup}&year=${year}&semester=${semester}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const fileName = `Ведомость_${groupName}_${subject.name}`.replace(
        /\s+/g,
        "_"
      );
      saveAs(blob, `${fileName}.pdf`);
    } catch (err) {
      console.error("Ошибка при скачивании ведомости:", err);
      toast.error("Ошибка при скачивании ведомости");
    }
  };

  const getGradeOptions = () => {
    if (form.type === "Зачёт") {
      return gradeOptions.zachet;
    }
    return gradeOptions.default;
  };

  return (
    <div className="gradebook-table-teacher">
      <h3 style={{ margin: "5px" }}>
        Зачетная книжка по предмету: {subject.name}
      </h3>

      {/* ВЫБОР ГОДА И СЕМЕСТРА */}
      <div
        style={{ marginBottom: "15px", display: "flex", gap: "20px" }}
        className="selection-panel"
      >
        <select value={year} onChange={handleYearChange}>
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}-{y + 1}
            </option>
          ))}
        </select>
        <div style={{ display: "flex", gap: "15px" }}>
          <button
            onClick={() => handleSemesterChange(1)}
            className={semester === 1 ? "active" : ""}
          >
            1 Семестр
          </button>
          <button
            onClick={() => handleSemesterChange(2)}
            className={semester === 2 ? "active" : ""}
          >
            2 Семестр
          </button>
        </div>
        <button onClick={downloadSubjectGradebook} className="download-button">
          📥 Скачать
        </button>
      </div>

      {/* ТАБЛИЦА ЗАЧЕТКИ */}
      <table>
        <thead>
          <tr>
            <th>Ученик</th>
            <th>Тип</th>
            <th>Оценка</th>
            <th>Дата</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {[...students]
            .sort((a, b) => a.username.localeCompare(b.username))
            .map((student) => {
              const entry = entries.find((e) => {
                const entryStudentId =
                  typeof e.studentId === "object"
                    ? e.studentId._id
                    : e.studentId;
                return entryStudentId === student._id;
              });
              const isEditing =
                (typeof editingEntry?.studentId === "object"
                  ? editingEntry?.studentId?._id
                  : editingEntry?.studentId) === student._id;
              return (
                <tr key={student._id}>
                  <td>{student.username}</td>
                  {isEditing ? (
                    <>
                      <td>
                        <select
                          className="gradebook-type-input"
                          value={form.type}
                          onChange={(e) =>
                            setForm({ ...form, type: e.target.value })
                          }
                        >
                          <option value="">Выберите</option>
                          {typeOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className="gradebook-grade-input"
                          value={form.grade}
                          onChange={(e) =>
                            setForm({ ...form, grade: e.target.value })
                          }
                        >
                          <option value="">Выберите</option>
                          {getGradeOptions().map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className="gradebook-date-input"
                          type="date"
                          value={form.date}
                          onChange={(e) =>
                            setForm({ ...form, date: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <button onClick={() => handleSave(student._id)}>
                          💾 Сохранить
                        </button>
                      </td>
                      <td>
                        <button onClick={() => setEditingEntry(null)}>
                          ❌ Отмена
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{entry?.type || "—"}</td>
                      <td>{entry?.grade || "—"}</td>
                      <td>{entry?.date?.slice(0, 10) || "—"}</td>
                      <td>
                        <button onClick={() => handleEdit(entry, student._id)}>
                          ✏️
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default GradebookBySubject;
