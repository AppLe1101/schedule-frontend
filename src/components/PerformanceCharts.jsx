import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import "./styles/PerformanceCharts.css";

const PerformanceCharts = ({ apiUrl, token, userId, isPremium }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${apiUrl}/api/users/${userId}/performance`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data);
      } catch (err) {
        console.error("Ошибка загрузки графиков успеваемости:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, token, userId]);

  if (loading) return <p>Загрузка графиков...</p>;

  if (!isPremium) {
    return (
      <div className="charts-locked">
        <div className="charts-blur">
          <p className="charts-locked-text">
            🔒 Графики успеваемости доступны только премиум-пользователям.
          </p>
          <a href="/premium" className="charts-premium-btn">
            Оформить премиум
          </a>
        </div>
      </div>
    );
  }

  const { subjectAverages, overallOverTime } = data;

  const subjectData = Object.entries(subjectAverages).map(
    ([subject, average]) => ({
      subject,
      average,
    })
  );

  return (
    <div className="performance-charts">
      <div className="chart1">
        <h3>📈 Общий прогресс по времени</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={overallOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="average"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart2">
        <h3>📊 Средние оценки по предметам</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="average" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceCharts;
