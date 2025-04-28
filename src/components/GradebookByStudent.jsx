import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./styles/GradebookByStudent.css";

const GradebookByStudent = ({ studentId, token, apiUrl }) => {
  const [gradebook, setGradebook] = useState([]);

  useEffect(() => {
    const fetchGradebook = async () => {
      try {
        const res = await axios.get(
          `${apiUrl}/api/gradebook/by-student/${studentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setGradebook(res.data);
      } catch (err) {
        console.error("Ошибка при загрузке зачетки учащегося", err);
      }
    };
    fetchGradebook();
  }, [apiUrl, studentId, token]);

  const getGradeClass = (grade) => {
    if (grade === "Зачёт" || grade === "зачёт") return "grade-pass";
    if (grade === "Не зачёт" || grade === "незачёт") return "grade-fail";

    const numeric = parseInt(grade);
    if (numeric === 5) return "grade-5";
    if (numeric === 4) return "grade-4";
    if (numeric === 3) return "grade-3";
    if (numeric === 2) return "grade-2";
    return "";
  };

  return (
    <div className="student-gradebook-table">
      <h2>Зачетная книжка</h2>
      <table className="gradebook-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Предмет</th>
            <th>Преподаватель</th>
            <th>Семестр</th>
            <th>Тип</th>
            <th>Оценка</th>
            <th>Дата</th>
          </tr>
        </thead>
        <tbody>
          {gradebook.map((entry, index) => (
            <tr key={entry._id}>
              <td>{index + 1}</td>
              <td>{entry.subject?.name || "—"}</td>
              <td>
                <Link
                  to={`/profile/${entry.teacher?._id}`}
                  className="gradebook-teacher-link"
                >
                  {entry.teacher?.username || "—"}
                </Link>
              </td>
              <td>{entry.semester}</td>
              <td>{entry.type}</td>
              <td className={getGradeClass(entry.grade)}>{entry.grade}</td>
              <td>{new Date(entry.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GradebookByStudent;
