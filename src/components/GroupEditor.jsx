import React, { useState, useEffect } from "react";
import axios from "axios";
import binIcon from "./icons/delete.svg";

function GroupEditor({ group, token, apiUrl, onEditorClose }) {
  const [localGroup, setLocalGroup] = useState(group);

  // Обновляем локальное состояние при изменении group
  useEffect(() => {
    setLocalGroup(group);
  }, [group]);

  // Функция для добавления нового дня
  const addDay = () => {
    const newDay = { day: "Новый день", lessons: [] };
    setLocalGroup({
      ...localGroup,
      schedule: [...localGroup.schedule, newDay],
    });
  };

  // Функция для обновления названия дня
  const updateDayName = (index, newName) => {
    const newSchedule = localGroup.schedule.map((day, i) =>
      i === index ? { ...day, day: newName } : day
    );
    setLocalGroup({ ...localGroup, schedule: newSchedule });
  };

  // Функция для добавления нового урока в день
  const addLesson = (dayIndex) => {
    const newLesson = { time: "", subject: "", teacher: "", cabinet: "" };
    const newSchedule = localGroup.schedule.map((day, i) => {
      if (i === dayIndex) {
        return { ...day, lessons: [...(day.lessons || []), newLesson] };
      }
      return day;
    });
    setLocalGroup({ ...localGroup, schedule: newSchedule });
  };

  // Функция для обновления данных урока
  const updateLesson = (dayIndex, lessonIndex, field, value) => {
    const newSchedule = localGroup.schedule.map((day, i) => {
      if (i === dayIndex) {
        const updatedLessons = day.lessons.map((lesson, j) =>
          j === lessonIndex ? { ...lesson, [field]: value } : lesson
        );
        return { ...day, lessons: updatedLessons };
      }
      return day;
    });
    setLocalGroup({ ...localGroup, schedule: newSchedule });
  };

  // Функция для удаления урока
  const deleteLesson = (dayIndex, lessonIndex) => {
    const newSchedule = localGroup.schedule.map((day, i) => {
      if (i === dayIndex) {
        const updatedLessons = day.lessons.filter((_, j) => j !== lessonIndex);
        return { ...day, lessons: updatedLessons };
      }
      return day;
    });
    setLocalGroup({ ...localGroup, schedule: newSchedule });
  };

  // Сохранение изменений: отправляем PUT-запрос на сервер
  const handleSave = async () => {
    try {
      const res = await axios.put(
        `https://schedule-backend-production-ef03.up.railway.app/api/groups/${localGroup._id}/schedule`,
        { schedule: localGroup.schedule },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Расписание сохранено");
      onEditorClose(res.data.group || localGroup);
    } catch (err) {
      console.error(err);
      alert("Ошибка при сохранении расписания");
    }
  };

  // Отмена редактирования: закрываем редактор без сохранения изменений
  const handleCancel = () => {
    onEditorClose(group);
  };

  return (
    <div className="group-editor">
      {localGroup.schedule.map((day, dayIndex) => (
        <div key={dayIndex} className="group-editor-item">
          <input
            type="text"
            value={day.day}
            onChange={(e) => updateDayName(dayIndex, e.target.value)}
            placeholder="Название дня"
            style={{ fontWeight: "bold" }}
          />
          <button
            onClick={() => addLesson(dayIndex)}
            style={{ marginLeft: "10px" }}
          >
            Добавить урок
          </button>
          {day.lessons &&
            day.lessons.map((lesson, lessonIndex) => (
              <div
                key={lessonIndex}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "5px",
                  alignItems: "center",
                }}
              >
                {/* Время урока с ограничением (например, от 08:00 до 18:00) */}
                <input
                  type="time"
                  min="08:00"
                  max="18:00"
                  value={lesson.time}
                  onChange={(e) =>
                    updateLesson(dayIndex, lessonIndex, "time", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Урок"
                  value={lesson.subject}
                  onChange={(e) =>
                    updateLesson(
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
                    updateLesson(
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
                    updateLesson(dayIndex, lessonIndex, "room", e.target.value)
                  }
                />
                <button
                  onClick={() => deleteLesson(dayIndex, lessonIndex)}
                  className="delete-lesson-btn"
                >
                  <img src={binIcon} alt="Удалить урок" />
                </button>
              </div>
            ))}
        </div>
      ))}
      <button onClick={addDay}>Добавить день</button>
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleSave} style={{ backgroundColor: "#16db65" }}>
          Сохранить изменения
        </button>
        <button onClick={handleCancel} style={{ backgroundColor: "#ff3c38" }}>
          Отмена
        </button>
      </div>
    </div>
  );
}

export default GroupEditor;
