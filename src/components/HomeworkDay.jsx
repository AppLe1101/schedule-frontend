import React from "react";
import HomeworkItem from "./HomeworkItem";
import "./styles/HomeworkDay.css";

const HomeworkDay = ({ date, homework, token, user, apiUrl }) => {
  const formattedDate = new Date(date).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const dayHomework = homework.filter(
    (item) =>
      new Date(item.date).toDateString() === new Date(date).toDateString()
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
