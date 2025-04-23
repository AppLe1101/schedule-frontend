import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "./styles/GradebookBySubject.css";

const GradebookBySubject = ({ subject, groupId, apiUrl, token, user }) => {
  const [students, setStudents] = useState([]);
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [form, setForm] = useState({
    semester: "",
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
        axios.get(`${apiUrl}/api/gradebook/by-subject/${subjectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setStudents(studentsRes.data);
      setEntries(entriesRes.data);
    } catch (err) {
      console.error("Ошибка при загрузке данных", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  const handleSave = async () => {
    if (!editingEntry) return;
    const payload = {
      studentId: editingEntry.studentId,
      teacher: user._id,
      subject: subjectId,
      semester: form.semester,
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
      setForm({ semester: "", type: "", grade: "", date: "" });
      fetchData();
    } catch (err) {
      console.error("Ошибка при сохранении записи", err);
      toast.error("Ошибка при сохранении");
    }
  };

  const handleEdit = (entry, studentId) => {
    setEditingEntry(entry || { studentId });
    setForm({
      semester: entry?.semester || "",
      type: entry?.type || "",
      grade: entry?.grade || "",
      date: entry?.date?.slice(0, 10) || "",
    });
  };

  return (
    <div className="gradebook-table-teacher">
      <h3 style={{ margin: "5px" }}>Зачётка по предмету: {subject.name}</h3>
      <table>
        <thead>
          <tr>
            <th>Ученик</th>
            <th>Семестр</th>
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
                        <input
                          className="gradebook-semester-input"
                          type="number"
                          value={form.semester}
                          onChange={(e) =>
                            setForm({ ...form, semester: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="gradebook-type-input"
                          type="text"
                          value={form.type}
                          onChange={(e) =>
                            setForm({ ...form, type: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="gradebook-grade-input"
                          type="text"
                          value={form.grade}
                          onChange={(e) =>
                            setForm({ ...form, grade: e.target.value })
                          }
                        />
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
                          Отмена
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{entry?.semester || "—"}</td>
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
