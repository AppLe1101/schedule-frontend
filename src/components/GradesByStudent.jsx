import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./GradesByStudent.css";

const GradesByStudent = ({ studentId, token, apiUrl, user }) => {
  const [grades, setGrades] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState({
    gradeId: null,
    field: null,
  });
  const [editedFields, setEditedFields] = useState({});
  const [newGrade, setNewGrade] = useState({
    subject: "",
    value: "",
    comment: "",
  });
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gradesRes, studentRes] = await Promise.all([
          axios.get(`${apiUrl}/api/grades/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/users/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setGrades(gradesRes.data);
        setStudent(studentRes.data);
      } catch (err) {
        console.error("Ошибка при загрузке дневника", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, apiUrl, token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setEditingField({ gradeId: null, field: null });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFieldChange = (gradeId, field, value) => {
    setEditedFields((prev) => ({
      ...prev,
      [gradeId]: {
        ...prev[gradeId],
        [field]: value,
      },
    }));
  };

  const saveEditedGrade = async (gradeId) => {
    const updates = editedFields[gradeId];
    if (!updates) return;

    try {
      await axios.patch(`${apiUrl}/api/grades/${gradeId}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedGrades = grades.map((g) =>
        g._id === gradeId ? { ...g, ...updates } : g
      );
      setGrades(updatedGrades);
      setEditingField({ gradeId: null, field: null });
      setEditedFields((prev) => {
        const updated = { ...prev };
        delete updated[gradeId];
        return updated;
      });
    } catch (err) {
      console.error("Ошибка при сохранении оценки:", err);
    }
  };

  const deleteGrade = async (gradeId) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту оценку?")) return;
    try {
      await axios.delete(`${apiUrl}/api/grades/${gradeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGrades((prev) => prev.filter((g) => g._id !== gradeId));
    } catch (err) {
      console.error("Ошибка при удалении оценки:", err);
    }
  };

  const handleAddGrade = async () => {
    if (!newGrade.subject || !newGrade.value) return;

    try {
      const res = await axios.post(
        `${apiUrl}/api/grades`,
        { ...newGrade, studentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGrades([...grades, res.data.grade]);
      setNewGrade({ subject: "", value: "", comment: "" });
    } catch (err) {
      console.error("Ошибка при добавлении оценки:", err);
    }
  };

  const isEditable = (grade) =>
    user?.role === "director" || grade.teacherId?._id === user._id;

  if (loading) return <div>Загрузка...</div>;

  return (
    <div ref={containerRef} className="dairy-container">
      <h2>Оценки ученика {student?.username}</h2>
      <table className="dairy-table">
        <thead>
          <tr>
            <th>Предмет</th>
            <th>Оценка</th>
            <th>Комментарий</th>
            <th>Дата</th>
            <th>Учитель</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade) => (
            <tr key={grade._id}>
              {["subject", "value", "comment"].map((field) => (
                <td key={field} className="editable-field">
                  {editingField.gradeId === grade._id &&
                  editingField.field === field &&
                  isEditable(grade) ? (
                    <input
                      value={
                        editedFields[grade._id]?.[field] || grade[field] || ""
                      }
                      onChange={(e) =>
                        handleFieldChange(grade._id, field, e.target.value)
                      }
                      onBlur={() => saveEditedGrade(grade._id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEditedGrade(grade._id);
                      }}
                      autoFocus
                      className="table-item"
                    />
                  ) : (
                    <span
                      onClick={() =>
                        isEditable(grade) &&
                        setEditingField({ gradeId: grade._id, field })
                      }
                      style={{
                        cursor: isEditable(grade) ? "pointer" : "default",
                      }}
                    >
                      {grade[field] || "—"}
                    </span>
                  )}
                </td>
              ))}
              <td>{new Date(grade.date).toLocaleDateString()}</td>
              <td>{grade.teacherId?.username || "—"}</td>
              <td>
                {isEditable(grade) && (
                  <button onClick={() => deleteGrade(grade._id)}>❌</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {user && (user.role === "teacher" || user.role === "director") && (
        <div className="add-grade-container">
          <h3>Добавить оценку</h3>
          <input
            type="text"
            placeholder="Предмет"
            value={newGrade.subject}
            onChange={(e) =>
              setNewGrade({ ...newGrade, subject: e.target.value })
            }
            className="add-grade-field"
          />
          <input
            type="text"
            placeholder="Оценка"
            value={newGrade.value}
            onChange={(e) =>
              setNewGrade({ ...newGrade, value: e.target.value })
            }
            className="add-grade-field"
          />
          <input
            type="text"
            placeholder="Комментарий (необязательно)"
            value={newGrade.comment}
            onChange={(e) =>
              setNewGrade({ ...newGrade, comment: e.target.value })
            }
            className="add-grade-field"
          />
          <button onClick={handleAddGrade}>Добавить</button>
        </div>
      )}
    </div>
  );
};

export default GradesByStudent;
