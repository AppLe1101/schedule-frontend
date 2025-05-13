// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React from "react";
import HomeworkItem from "./HomeworkItem";
import "./styles/HomeworkDay.css";

const HomeworkDay = ({ date, homework, token, user, apiUrl }) => {
  const formattedDate = new Date(date).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const formatLocalDate = (d) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const dayHomework = homework.filter(
    (item) => formatLocalDate(item.date) === formatLocalDate(date)
  );

  return (
    <div className="homework-day">
      <h3>{formattedDate}</h3>
      {dayHomework.length === 0 ? (
        <p className="no-homework">Домашних заданий нет</p>
      ) : (
        dayHomework.map((hw) => (
          <HomeworkItem
            key={hw._id}
            hw={hw}
            user={user}
            token={token}
            apiUrl={apiUrl}
          />
        ))
      )}
    </div>
  );
};

export default HomeworkDay;
