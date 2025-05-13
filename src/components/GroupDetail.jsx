// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useState, useEffect } from "react";
import GroupEditor from "./GroupEditor";
// import "./GroupDetail.css";

function GroupDetail({ group, token, user, apiUrl }) {
  const [localGroup, setLocalGroup] = useState(group);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setLocalGroup(group);
  }, [group]);

  // Обработчик нажатия кнопки "Редактировать"
  const handleEditClick = () => {
    setEditing(true);
  };

  const handleEditorClose = (updatedGroup) => {
    setLocalGroup(updatedGroup);
    setEditing(false);
  };

  return (
    <div className="group-detail">
      <h3>Расписание для группы: {localGroup.name}</h3>

      {!editing ? (
        <>
          {/* Отображение расписания в режиме только для чтения */}
          {localGroup.schedule && localGroup.schedule.length > 0 ? (
            localGroup.schedule.map((day, dayIndex) => (
              <div key={dayIndex} className="day-schedule">
                <h4>{day.day}</h4>
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
                    {day.lessons && day.lessons.length > 0 ? (
                      day.lessons.map((lesson, lessonIndex) => (
                        <tr key={lessonIndex}>
                          <td>{lesson.time}</td>
                          <td>{lesson.subject}</td>
                          <td>{lesson.teacher}</td>
                          <td>{lesson.room}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4">Нет уроков</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <p>Расписание не задано</p>
          )}

          {(user.role === "teacher" || user.role === "director") && (
            <button onClick={handleEditClick}>Редактировать</button>
          )}
        </>
      ) : (
        <GroupEditor
          group={localGroup}
          token={token}
          apiUrl={apiUrl}
          onEditorClose={handleEditorClose}
        />
      )}
    </div>
  );
}

export default GroupDetail;
