import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./styles/GradesBySubject.css";
const GradesBySubject = ({
  subject,
  groupId,
  token,
  user,
  apiUrl,
  availableStudents,
  fetchGroupMembers,
}) => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [hoveredGrade, setHoveredGrade] = useState(null);
  const [gradeDescription, setGradeDescription] = useState("");
  const [editingCell, setEditingCell] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const subjectId = subject._id;
  const todayRef = useRef(null);
  const hasScrolledRef = useRef(false);
  const menuRef = useRef(null);
  const today = new Date();
  const todayStr = today.toDateString();
  const gradeDates = grades.map((g) => new Date(g.date).toDateString());
  const startDate = new Date();
  startDate.setDate(today.getDate() - 21);
  const endDate = new Date();
  endDate.setDate(today.getDate() + 14);
  const rangeDates = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    rangeDates.push(new Date(d).toDateString());
  }
  const allDates = [...new Set([...gradeDates, ...rangeDates])].sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const uniqueDates = allDates.map((d) => new Date(d));

  const fetchStudentsAndGrades = async () => {
    try {
      const [studentsRes, gradesRes] = await Promise.all([
        axios.get(`${apiUrl}/api/groups/${groupId}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/api/grades/by-subject/${subjectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setStudents(studentsRes.data);
      setGrades(gradesRes.data);
    } catch (err) {
      console.error("Ошибка при загрузке данных:", err);
    }
  };

  useEffect(() => {
    fetchStudentsAndGrades();
  }, [subjectId]);

  useEffect(() => {
    if (todayRef.current && !hasScrolledRef.current) {
      const el = todayRef.current;
      const container = el.closest(".grades-table-wrapper");
      if (container) {
        const offset = el.offsetLeft - 575;
        container.scrollTo({ left: offset, behavior: "smooth" });
        hasScrolledRef.current = true;
      }
    }
  }, [uniqueDates]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setSelectedGrade(null);
      }
    };

    const timeout = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const startEditing = (grade) => {
    setEditingCell({
      studentId: grade.studentId,
      date: new Date(grade.date),
    });
    setInputValue(grade.value);
    setSelectedGrade(null);
  };

  const getGradeFor = (studentId, date) => {
    return grades.find(
      (g) =>
        g.studentId?._id.toString() === studentId?.toString() &&
        new Date(g.date).toDateString() === date.toDateString()
    );
  };

  const handleGradeSave = async (studentId, date) => {
    const grade = getGradeFor(studentId, date);
    if (inputValue < 2 || inputValue > 5) {
      alert("Оценка должна быть от 2 до 5");
      return;
    }

    try {
      if (grade) {
        // Обновление
        await axios.put(
          `${apiUrl}/api/grades/${grade._id}`,
          { value: inputValue },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Создание новой
        await axios.post(
          `${apiUrl}/api/grades`,
          {
            studentId,
            teacherId: user._id,
            subjectId: subject._id,
            value: inputValue,
            date: new Date(date).toISOString(),
            comment: gradeDescription,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const updatedGrades = await axios.get(
        `${apiUrl}/api/grades/by-subject/${subject._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGrades(updatedGrades.data);
      setEditingCell(null);
      setInputValue("");
    } catch (err) {
      console.error("Ошибка при сохранении оценки:", err);
    }
  };

  const deleteGrade = async (gradeId) => {
    try {
      await axios.delete(`${apiUrl}/api/grades/${gradeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedGrades = await axios.get(
        `${apiUrl}/api/grades/by-subject/${subject._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGrades(updatedGrades.data);
      setSelectedGrade(null);
    } catch (err) {
      console.error("Ошибка при удалении оценки:", err);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId) return;

    try {
      await axios.put(
        `${apiUrl}/api/groups/${groupId}/add-student`,
        { userId: selectedStudentId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedStudentId("");
      fetchStudentsAndGrades();
      toast.success("Ученик добавлен");
    } catch (err) {
      console.error("Ошибка при добавлении ученика:", err);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (window.confirm("Вы уверены, что хотите удалить ученика из группы?")) {
      try {
        await axios.put(
          `${apiUrl}/api/groups/${groupId}/remove-student`,
          { userId: studentId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchStudentsAndGrades();
        toast.success("Ученик удалён из группы.");
      } catch (err) {
        console.error("Ошибка при удалении ученика:", err);
        toast.error("Не удалось удалить ученика.");
      }
    }
  };

  return (
    <div className="grades-table" style={{ display: "grid" }}>
      <div className="table-info">
        <h3>Предмет: {subject.name}</h3>
        <div className="grade-desc-container">
          <label>Описание оценки:</label>
          <input
            type="text"
            value={gradeDescription}
            onChange={(e) => setGradeDescription(e.target.value)}
            placeholder="Например: Ответ на уроке"
          />
        </div>
      </div>

      <div className="grades-table-wrapper">
        <table className="grades-table" style={{ display: "contents" }}>
          <thead>
            <tr>
              <th className="fixed-column">Ученик</th>
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
            {[...students]
              .sort((a, b) => a.username.localeCompare(b.username))
              .map((student) => (
                <tr key={student._id}>
                  <td className="fixed-column">
                    <Link
                      to={`/profile/${student._id}`}
                      className="student-link"
                    >
                      {student.username}
                    </Link>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveStudent(student._id)}
                    >
                      ❌
                    </button>
                  </td>
                  {uniqueDates.map((date, i) => {
                    const grade = getGradeFor(student._id, date);
                    const isEditing =
                      editingCell?.studentId === student._id &&
                      editingCell?.date?.toDateString?.() ===
                        date.toDateString();

                    return (
                      <td
                        key={i}
                        ref={
                          date.toDateString() === new Date().toDateString()
                            ? todayRef
                            : null
                        }
                        onClick={() => {
                          if (grade) {
                            setSelectedGrade({
                              ...grade,
                              studentId: student._id,
                              date: new Date(grade.date),
                            });
                          } else {
                            setEditingCell({ studentId: student._id, date });
                          }
                        }}
                        onMouseEnter={() => setHoveredGrade(grade)}
                        onMouseLeave={() => setHoveredGrade(null)}
                        style={{ position: "relative", cursor: "pointer" }}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            autoFocus
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onBlur={() => handleGradeSave(student._id, date)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleGradeSave(student._id, date);
                              }
                            }}
                            className="grade-input"
                          />
                        ) : (
                          <>
                            {grade?.value ?? ""}
                            {hoveredGrade === grade && grade?.comment && (
                              <div className="tooltip">{grade.comment}</div>
                            )}
                            {selectedGrade?.studentId === student._id &&
                              selectedGrade?.date &&
                              new Date(selectedGrade.date).toDateString() ===
                                date.toDateString() && (
                                <div
                                  className="grade-menu"
                                  //ref={menuRef}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button onClick={() => startEditing(grade)}>
                                    ✏️ Редактировать
                                  </button>
                                  <button
                                    onClick={() => deleteGrade(grade._id)}
                                  >
                                    🗑️ Удалить
                                  </button>
                                  <button
                                    onClick={() => setSelectedGrade(null)}
                                  >
                                    ❌ Закрыть
                                  </button>
                                </div>
                              )}
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: "15px" }}>
        <label style={{ marginRight: "10px" }}>Добавить ученика: </label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          style={{ padding: "5px 10px" }}
        >
          <option value="" disabled>
            Выбрать ученика
          </option>
          {availableStudents
            .filter(
              (available) =>
                !students.some(
                  (s) => s._id.toString() === available._id.toString()
                )
            )
            .map((student) => (
              <option key={student._id} value={student._id}>
                {student.username}
              </option>
            ))}
        </select>
        <button
          onClick={handleAddStudent}
          disabled={!selectedStudentId}
          style={{ marginLeft: "10px", padding: "5px 12px" }}
        >
          ➕ Добавить
        </button>
      </div>
    </div>
  );
};

export default GradesBySubject;
