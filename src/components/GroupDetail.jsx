// src/components/GroupDetail.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
//import "./GroupDetail.css";

function GroupDetail({ group, token, user }) {
  const [editing, setEditing] = useState(false);
  const [schedule, setSchedule] = useState(group.schedule);

  const prevGroupIdRef = useRef(group._id);

  useEffect(() => {
    if (prevGroupIdRef.current !== group._id) {
      setSchedule(group.schedule);
      setEditing(false);
      prevGroupIdRef.current = group._id;
    }
  }, [group]);

  const handleLessonInputChange = (dayIndex, lessonIndex, field, value) => {
    const newSchedule = [...schedule];
    const lessons = [...newSchedule[dayIndex].lessons];
    lessons[lessonIndex] = { ...lessons[lessonIndex], [field]: value };
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], lessons };
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/groups/${group._id}/schedule`,
        { schedule },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Ошибка при сохранении расписания");
    }
  };

  return (
    <div className="group-detail">
      <h3>Расписание для группы: {group.name}</h3>
      {schedule && schedule.length > 0 ? (
        schedule.map((daySchedule, dayIndex) => (
          <div key={dayIndex} className="day-schedule">
            <h4>{daySchedule.day}</h4>
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Время</th>
                  <th>Урок</th>
                  <th>Преподаватель</th>
                  <th>Кабинет</th>
                </tr>
              </thead>
              <tbody>
                {daySchedule.lessons.map((lesson, lessonIndex) => (
                  <tr key={lessonIndex}>
                    <td>
                      {editing ? (
                        <input
                          type="text"
                          value={lesson.time}
                          onChange={(e) =>
                            handleLessonInputChange(
                              dayIndex,
                              lessonIndex,
                              "time",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        lesson.time
                      )}
                    </td>
                    <td>
                      {editing ? (
                        <input
                          type="text"
                          value={lesson.subject}
                          onChange={(e) =>
                            handleLessonInputChange(
                              dayIndex,
                              lessonIndex,
                              "subject",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        lesson.subject
                      )}
                    </td>
                    <td>
                      {editing ? (
                        <input
                          type="text"
                          value={lesson.teacher}
                          onChange={(e) =>
                            handleLessonInputChange(
                              dayIndex,
                              lessonIndex,
                              "teacher",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        lesson.teacher
                      )}
                    </td>
                    <td>
                      {editing ? (
                        <input
                          type="text"
                          value={lesson.room || ""}
                          onChange={(e) =>
                            handleLessonInputChange(
                              dayIndex,
                              lessonIndex,
                              "room",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        lesson.room || "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>Расписание не найдено.</p>
      )}

      {/* Кнопки для редактирования доступны только для пользователей с ролью teacher или director */}
      {user && (user.role === "teacher" || user.role === "director") && (
        <div className="edit-actions">
          {!editing ? (
            <button onClick={() => setEditing(true)}>Редактировать</button>
          ) : (
            <>
              <button onClick={handleSave}>Сохранить</button>
              <button
                onClick={() => {
                  setEditing(false);
                  setSchedule(group.schedule); // откат изменений
                }}
              >
                Отмена
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default GroupDetail;
