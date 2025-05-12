import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HomeworkDay from "./HomeworkDay";
import "./styles/HomeworkCalendar.css";
import { motion } from "framer-motion";
import axios from "axios";
import { useCheckUpdates } from "./hooks/checkUpdates";

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // понедельник
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return new Date(d);
};

const getWeekDates = (startDate) => {
  return Array.from({ length: 6 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });
};

const HomeworkCalendar = ({ token, apiUrl, user }) => {
  const [startDate, setStartDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const groupId = Array.isArray(user.groupId)
    ? user.groupId[0]?.toString()
    : user.groupId;

  const [currentWeekStart, setCurrentWeekStart] = useState(
    getStartOfWeek(new Date())
  );
  const [homework, setHomework] = useState([]);

  //useCheckUpdates({
  //  url:
  //    currentWeekStart && groupId
  //      ? `${apiUrl}/api/homework/week/${currentWeekStart.toISOString()}?groupId=${groupId}`
  //      : null,
  //  token,
  //  interval: 600000,
  //  onData: (data) => setHomework(data),
  //});

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
    <motion.div
      initial={{ opacity: 1, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="homework-calendar"
    >
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
        {weekDates.map((date, index) => (
          <motion.div
            key={date.toISOString()}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              bounce: 0.5,
              delay: index * 0.1,
            }}
          >
            <HomeworkDay
              token={token}
              apiUrl={apiUrl}
              user={user}
              date={date}
              homework={homework.filter((hw) => {
                const hwDate = new Date(hw.date);
                return (
                  hwDate.getFullYear() === date.getFullYear() &&
                  hwDate.getMonth() === date.getMonth() &&
                  hwDate.getDate() === date.getDate()
                );
              })}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default HomeworkCalendar;
