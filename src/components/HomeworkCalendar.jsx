import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HomeworkDay from "./HomeworkDay";
import "./styles/HomeworkCalendar.css";
import axios from "axios";

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const getWeekDates = (startDate) => {
  return Array.from({ length: 6 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });
};

const HomeworkCalendar = ({ token, apiUrl, user }) => {
  const [loading, setLoading] = useState(true);
  const groupId = Array.isArray(user.groupId)
    ? user.groupId[0]?.toString()
    : user.groupId;

  const [currentWeekStart, setCurrentWeekStart] = useState(
    getStartOfWeek(new Date())
  );
  const [homework, setHomework] = useState([]);

  const fetchHomework = async (startDate) => {
    if (!groupId) return;
    try {
      const isoDate = startDate.toISOString();
      const res = await axios.get(
        `${apiUrl}/api/homework/week/${startDate.toISOString()}?groupId=${groupId}`,
        {
          //${apiUrl}/api/homework/group/${groupId}
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHomework(res.data);
    } catch (err) {
      console.error("Ошибка при загрузке дз:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework(currentWeekStart);
  }, [currentWeekStart, groupId]);

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const weekDates = getWeekDates(currentWeekStart);

  return (
    <div className="homework-calendar">
      <div className="week-navigation">
        <button onClick={handlePrevWeek}>← Назад</button>
        <span>
          Неделя с {weekDates[0].toLocaleDateString()} по{" "}
          {weekDates[5].toLocaleDateString()}
        </span>
        {loading && <p className="loading-hw">Обновление...</p>}
        <button onClick={handleNextWeek}>Вперед →</button>
      </div>

      <div className="week-days">
        {weekDates.map((date) => (
          <HomeworkDay
            key={date.toISOString()}
            token={token}
            apiUrl={apiUrl}
            user={user}
            date={date}
            homework={homework.filter(
              (hw) => new Date(hw.date).toDateString() === date.toDateString()
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeworkCalendar;
