import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Loading from "./Loading";
import axios from "axios";

const DeleteReqTab = ({ user, apiUrl, token }) => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/deletion`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Ошибка при получении запросов на удлание", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDeleteRequest = async (requestId) => {
    try {
      await axios.delete(`${apiUrl}/api/deletion/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequests();
      toast.success("Запрос удалён");
    } catch (err) {
      console.error("Ошибка при удалении запроса", err);
      toast.error("Ошибка при удалении запроса");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.delete(`${apiUrl}/api/deletion/${requestId}/delete-user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequests();
      toast.success("Пользователь удалён");
    } catch (err) {
      console.error("Ошибка при удалении пользователя", err);
      toast.error("Ошибка при удалении пользователя");
    }
  };

  if (loading) return <Loading />;

  if (requests.length === 0) return <p>Запросов на удаление нет 🎉</p>;

  return (
    <div className="delete-request-tab-container">
      <h2>Запросы на удаление аккаунта</h2>
      <div className="counter">Запросов: {requests.length}</div>
      {requests.map((request) => (
        <div key={request._id} className="drt-item">
          <div className="drt-content">
            <div className="drt-user-info">
              <div className="drt-req-username">
                <Link to={`/profile/${request.user._id}`}>
                  {request.user.username}
                </Link>
              </div>
              <div className="divider"> | </div>
              <div className="drt-req-role">{request.user.role}</div>
            </div>
            <div className="drt-req-reason">{request.reason}</div>
            <small>{new Date(request.createdAt).toLocaleString()}</small>
          </div>
          <div className="drt-buttons">
            <button onClick={() => handleAcceptRequest(request._id)}>
              🗑 Удалить
            </button>
            <button onClick={() => handleDeleteRequest(request._id)}>
              ❌ Отменить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeleteReqTab;
