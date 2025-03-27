import React, { useEffect, useState } from "react";
import axios from "axios";
import { Await, useParams } from "react-router-dom";

const GradesByStudent = ({ studentId: propStudentId, token, user, apiUrl }) => {
  const params = useParams();
  const studentId =
    propStudentId ||
    params.studentId ||
    (user?.role === "student" ? user._id : null);
  const [grades, setGrades] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newGrade, setNewGrade] = useState({
    subject: "",
    value: "",
    comment: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) {
        return <p>Ошибка: не удалось определить ID ученика.</p>;
      }
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

  const handleAddGrade = async () => {
    try {
      await axios.post(
        `${apiUrl}/api/grades`,
        {
          ...newGrade,
          studentId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const res = await axios.get(`${apiUrl}/api/grades/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGrades(res.data);

      setNewGrade({ subject: "", value: "", comment: "" });
    } catch (err) {
      console.error("Ошибка при добавлении оценки", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {loading ? (
        <p>Загрузка...</p>
      ) : grades.length === 0 ? (
        <p>Оценок пока нет.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Предмет</th>
              <th>Оценка</th>
              <th>Комментарий</th>
              <th>Дата</th>
              <th>Преподаватель</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade._id?.toString()}>
                <td>{grade.subject}</td>
                <td>{grade.value}</td>
                <td>{grade.comment || "-"}</td>
                <td>{new Date(grade.date).toLocaleDateString()}</td>
                <td>{grade.teacherId?.username || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {user && (user.role === "teacher" || user.role === "director") && (
        <div style={{ marginTop: "20px" }}>
          <h3>Добавить оценку</h3>
          <input
            type="text"
            placeholder="Предмет"
            value={newGrade.subject}
            onChange={(e) =>
              setNewGrade({ ...newGrade, subject: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Оценка"
            value={newGrade.value}
            onChange={(e) =>
              setNewGrade({ ...newGrade, value: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Комментарий (необязательно)"
            value={newGrade.comment}
            onChange={(e) =>
              setNewGrade({ ...newGrade, comment: e.target.value })
            }
          />
          <button onClick={handleAddGrade}>Сохранить</button>
        </div>
      )}
    </div>
  );
};

export default GradesByStudent;
