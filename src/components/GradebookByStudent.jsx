import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import axios from "axios";
import "./styles/GradebookByStudent.css";

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

const GradebookByStudent = ({ studentId, studentName, token, apiUrl }) => {
  const [gradebook, setGradebook] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [{ year, semester }, setCurrentPeriod] = useState(getCurrentAYAS());

  useEffect(() => {
    fetchGradebook();
  }, [apiUrl, studentId, token, year, semester]);

  const fetchGradebook = async () => {
    try {
      const res = await axios.get(
        `${apiUrl}/api/gradebook/by-student/${studentId}?academicYear=${year}&semester=${semester}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGradebook(res.data);

      const years = [...new Set(res.data.map((e) => e.academicYear))];
      setAvailableYears(years.sort((a, b) => b - a));
    } catch (err) {
      console.error("Ошибка при загрузке зачетки учащегося", err);
    }
  };

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

  const handleYearChange = (e) => {
    setCurrentPeriod((prev) => ({ ...prev, year: Number(e.target.value) }));
  };

  const handleSemesterChange = (selectedSemester) => {
    setCurrentPeriod((prev) => ({ ...prev, semester: selectedSemester }));
  };

  const downloadGradebook = async () => {
    try {
      const res = await axios.get(
        `${apiUrl}/api/gradebook/download/${studentId}?semester=${semester}&year=${year}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      saveAs(blob, `Зачётная_книжка_${studentName}.pdf`);
    } catch (err) {
      console.error("Ошибка при скачивании зачётки:", err);
      toast.error("Ошибка при скачивании зачётки");
    }
  };

  return (
    <div className="student-gradebook-table">
      <h2>Зачетная книжка</h2>

      {/* выбор года и семестра */}
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
        <button onClick={downloadGradebook} className="download-button">
          📄 Скачать
        </button>
      </div>

      <table className="gradebook-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Предмет</th>
            <th>Преподаватель</th>
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
