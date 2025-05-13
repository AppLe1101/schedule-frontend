// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./styles/GradesByStudent.css";

const GradesByStudent = ({ studentId, token, apiUrl, user }) => {
  const [grades, setGrades] = useState([]);
  const [student, setStudent] = useState(null);
  const [uniqueDates, setUniqueDates] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const todayRef = useRef(null);
  const groupId = user.groupId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gradesRes, studentRes, subjectsRes] = await Promise.all([
          axios.get(`${apiUrl}/api/grades/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/users/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/subjects/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const gradesData = gradesRes.data;
        setGrades(gradesData);
        setStudent(studentRes.data);
        setSubjects(subjectsRes.data);

        const todayTimestamp = new Date().setHours(0, 0, 0, 0);
        const rawTimestamps = gradesData.map((g) =>
          new Date(g.date).setHours(0, 0, 0, 0)
        );
        const uniqueTimestamps = [...new Set(rawTimestamps)].sort(
          (a, b) => a - b
        );

        if (!uniqueTimestamps.includes(todayTimestamp)) {
          uniqueTimestamps.push(todayTimestamp);
        }

        const unique = uniqueTimestamps.map((t) => new Date(t));
        setUniqueDates(unique);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
      }
    };

    fetchData();
  }, [studentId, apiUrl, token, groupId]);

  const getGradeFor = (subjectId, date) => {
    const targetDate = new Date(date).toDateString();

    return grades.find((g) => {
      const gradeDate = new Date(g.date).toDateString();
      const matchSubject =
        g.subjectId === subjectId ||
        g.subjectId?._id === subjectId ||
        g.subjectId?.toString() === subjectId.toString();

      return matchSubject && gradeDate === targetDate;
    });
  };

  return (
    <div className="student-grade-table">
      <h2>Оценки ученика: {student?.username}</h2>
      <div className="grades-table-wrapper-student">
        <table className="grades-table">
          <thead>
            <tr>
              <th className="fixed-column">Предмет</th>
              {uniqueDates.map((date, i) => (
                <th
                  key={i}
                  ref={
                    date.toDateString() === new Date().toDateString()
                      ? todayRef
                      : null
                  }
                >
                  {date.toLocaleDateString()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects.map((subj) => (
              <tr key={subj._id}>
                <td className="fixed-column">{subj.name}</td>
                {uniqueDates.map((date, i) => {
                  const grade = getGradeFor(subj._id, date);
                  return (
                    <td key={i} className="student-grade-cell">
                      {grade ? (
                        <span title={grade.comment}>{grade.value}</span>
                      ) : (
                        ""
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradesByStudent;
