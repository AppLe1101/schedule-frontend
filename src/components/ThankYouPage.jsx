// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "./Loading";
import { toast } from "react-toastify";

const ThankYouPage = ({ apiUrl }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  const token = localStorage.getItem("token");
  const sessionId = localStorage.getItem("paymentId");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!token || !sessionId) {
        navigate("/");
        return;
      }

      try {
        const res = await axios.get(`${apiUrl}/api/payments/verify`, {
          params: { paymentId: sessionId },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          toast.success("Подписка успешно оформлена!");
          localStorage.removeItem("paymentId");
        } else {
          toast.error("Ошибка подтверждения оплаты");
          navigate("/");
        }
      } catch (err) {
        console.error("Ошибка при проверке оплаты:", err);
        toast.error("Ошибка проверки оплаты");
        navigate("/");
      } finally {
        setChecking(false);
      }
    };

    verifyPayment();
  }, [sessionId, token, navigate]);

  if (checking) return <Loading />;

  return (
    <div className="thank-you-container">
      <h1>Спасибо За покупку LearningPortal Premium!</h1>
      <p>Ваша подписка активирована. Наслождайтесь новыми возможностями 🎉</p>
      <button onClick={() => navigate("/")} style={{ marginTop: "20px" }}>
        На главную
      </button>
    </div>
  );
};

export default ThankYouPage;
