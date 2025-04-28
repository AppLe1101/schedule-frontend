import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loading from "./Loading";
import axios from "axios";
import { motion } from "framer-motion";

const ReportTab = ({ apiUrl, token, user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  //const enableAnimations = !user.enableAnimations;

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
      console.log(user);
    } catch (err) {
      console.error("Ошибка при загрузке жалоб", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id) => {
    try {
      await axios.patch(
        `${apiUrl}/api/reports/${id}/resolve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchReports();
    } catch (err) {
      console.error("Ошибка при пометке как решенной", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReports();
    } catch (err) {
      console.error("Ошибка при удалении жалобы", err);
    }
  };

  if (loading) return <Loading />;

  if (!reports.length) return <p>Жалоб пока нет 🎉</p>;

  return (
    <div className="reports-container">
      <h2>Жалобы</h2>
      <div className="counter">Жалоб: {reports.length}</div>
      {reports.map((report, index) => (
        <motion.div
          key={report._id}
          className="report-item"
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
          <div className="report-content">
            <strong>
              <Link to={`/profile/${report.author?._id}`}>
                {report.author?.username}
              </Link>
            </strong>
            {report.target && (
              <>
                {" "}
                →{" "}
                <strong>
                  <Link to={`/profile/${report.target?._id}`}>
                    {report.target?.username}
                  </Link>
                </strong>
              </>
            )}
          </div>
          <div className="report-message">{report.message}</div>
          <div className="report-date">
            {new Date(report.createdAt).toLocaleString()}
          </div>
          <div className="report-controls">
            {report.resolved ? (
              <span style={{ color: "#00d26a" }}>✅ Рассмотрено</span>
            ) : (
              <button onClick={() => handleResolve(report._id)}>
                Пометить как решенную
              </button>
            )}
            <button onClick={() => handleDelete(report._id)}>Удалить</button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ReportTab;
