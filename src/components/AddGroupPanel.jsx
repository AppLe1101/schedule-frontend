// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useState } from "react";
import "./styles/AddGroupPanel.css";
import axios from "axios";

function AddGroupPanel({ token, user, onGroupAdded, apiUrl }) {
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [schedule, setSchedule] = useState([]);

  if (user.role !== "director") return null;

  const handleShowNewGroup = () => {
    setShowNewGroup(true);
  };

  const handleAddSchedule = () => {
    if (schedule.length === 0) {
      setSchedule([{ day: "Новый день", lessons: [] }]);
    }
  };

  const addLessonToDay = (dayIndex) => {
    const newLesson = { time: "", subject: "", teacher: "", room: "" };
    const newSchedule = [...schedule];
    newSchedule[dayIndex].lessons.push(newLesson);
    setSchedule(newSchedule);
  };

  const addDay = () => {
    const newDay = { day: `Новый день ${schedule.length + 1}`, lessons: [] };
    setSchedule([...schedule, newDay]);
  };

  const updateDayName = (dayIndex, newGroupName) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].day = newGroupName;
    setSchedule(newSchedule);
  };

  const updateLessonField = (dayIndex, lessonIndex, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].lessons[lessonIndex][field] = value;
    setSchedule(newSchedule);
  };

  const deleteLesson = (dayIndex, lessonIndex) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].lessons.splice(lessonIndex, 1);
    setSchedule(newSchedule);
  };

  const handleSave = () => {
    if (!groupName) {
      alert("Имя группы не может быть пустым");
      return;
    }
    const newGroup = {
      name: groupName,
      schedule: schedule,
    };

    axios
      .post(`${apiUrl}/api/groups`, newGroup, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        alert("Группа успешно добавлена");
        if (onGroupAdded) onGroupAdded(res.data);
        // Сброс состояния
        setShowNewGroup(false);
        setGroupName("");
        setSchedule([]);
      })
      .catch((err) => {
        console.error(err);
        alert("Ошибка при добавлении группы");
      });
  };

  const handleCancel = () => {
    setShowNewGroup(false);
    setGroupName("");
    setSchedule([]);
  };

  return (
    <div className="new-group-panel">
      {!showNewGroup ? (
        <button onClick={handleShowNewGroup}>Добавить группу</button>
      ) : (
        <div className="new-group">
          <div style={{ marginBottom: "10px" }}>
            <label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Введите название группы"
                style={{ marginLeft: "10px" }}
              />
            </label>
          </div>

          {/* Кнопка для добавления расписания */}
          <div style={{ marginBottom: "10px" }}>
            <button onClick={handleAddSchedule}>Добавить расписание</button>
          </div>

          {/* Если расписание добавлено, рендерим его */}
          {schedule.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <h4>Расписание</h4>
              {schedule.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  style={{
                    border: "1px solid #aaa",
                    padding: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <label>
                      День:
                      <input
                        type="text"
                        value={day.day}
                        onChange={(e) =>
                          updateDayName(dayIndex, e.target.value)
                        }
                        style={{ marginLeft: "10px" }}
                      />
                    </label>
                    <button
                      onClick={() => addLessonToDay(dayIndex)}
                      style={{ marginLeft: "10px" }}
                    >
                      Добавить урок
                    </button>
                  </div>
                  {/* Список уроков */}
                  {day.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lessonIndex}
                      style={{ display: "flex", gap: "10px", marginTop: "5px" }}
                    >
                      <input
                        type="time"
                        placeholder="Время"
                        value={lesson.time}
                        onChange={(e) =>
                          updateLessonField(
                            dayIndex,
                            lessonIndex,
                            "time",
                            e.target.value
                          )
                        }
                      />
                      <input
                        type="text"
                        placeholder="Урок"
                        value={lesson.subject}
                        onChange={(e) =>
                          updateLessonField(
                            dayIndex,
                            lessonIndex,
                            "subject",
                            e.target.value
                          )
                        }
                      />
                      <input
                        type="text"
                        placeholder="Преподаватель"
                        value={lesson.teacher}
                        onChange={(e) =>
                          updateLessonField(
                            dayIndex,
                            lessonIndex,
                            "teacher",
                            e.target.value
                          )
                        }
                      />
                      <input
                        type="text"
                        placeholder="Кабинет"
                        value={lesson.room}
                        onChange={(e) =>
                          updateLessonField(
                            dayIndex,
                            lessonIndex,
                            "room",
                            e.target.value
                          )
                        }
                      />
                      <button
                        onClick={() => deleteLesson(dayIndex, lessonIndex)}
                      >
                        Удалить урок
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              <button onClick={addDay}>Добавить день</button>
            </div>
          )}

          {/* Кнопки сохранения и отмены */}
          <div style={{ marginTop: "20px" }}>
            <button onClick={handleSave}>Сохранить</button>
            <button onClick={handleCancel} style={{ marginLeft: "10px" }}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddGroupPanel;
