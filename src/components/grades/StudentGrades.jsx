import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentGrades = ({ token, user, apiUrl }) => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/grades/${user?._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGrades(res.data);
      } catch (err) {
        console.error("Ошиюка при получении оценок", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [user._id, apiUrl, token]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Журнал оценок</h2>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Предмет</th>
              <th>Оценка</th>
              <th>Дата</th>
              <th>Преподаватель</th>
              <th>Комментарий</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade._id}>
                <td>{grade.subject}</td>
                <td>{grade.value}</td>
                <td>{new Date(grade.date).toLocaleDateString()}</td>
                <td>{grade.teacherId?.username}</td>
                <td>{grade.comment || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentGrades;
