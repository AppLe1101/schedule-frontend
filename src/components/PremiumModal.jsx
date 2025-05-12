import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./styles/PremiumModal.css";
import Loading from "./Loading";

const PremiumModal = ({ user, onClose, apiUrl, token }) => {
  const [accepted, setAccepted] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/users/premium-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubscriptionInfo(res.data);
        console.log(res.data);
        console.log(user);
      } catch (err) {
        console.error("Ошибка при получении статуса подписки:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, [token, apiUrl]);

  const handlePremiumBuy = async () => {
    try {
      const res = await axios.post(`${apiUrl}/api/users/buy-premium`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) {
        toast.success("Поздравляем! Вы оформили Премиум 🎉");
        //reload page?
        setSubscriptionInfo(res.data);
      }
    } catch (err) {
      console.error("Ошибка при оформлении подписки:", err);
      toast.error("Ошибка покупки");
    }
  };

  const handleCancelPremium = async () => {
    try {
      await axios.post(`${apiUrl}/api/users/cancel-premium`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.info("Подписка будет отключена после окончания текущего периода");

      const res = await axios.get(`${apiUrl}/api/users/premium-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubscriptionInfo(res.data);
    } catch (err) {
      console.error("Ошибка отмены:", err);
      toast.error("Ошибка при отмене подписки");
    }
  };

  return (
    <div className="modal-overlay">
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {loading ? (
          <Loading />
        ) : (
          <>
            <h2>
              <span>🌟</span> Премиум подписка
            </h2>

            {subscriptionInfo?.active ? (
              <>
                <p>Вы уже оформили подписку 🎉</p>
                <p>
                  Активна с:{" "}
                  <b>
                    {new Date(subscriptionInfo.startDate).toLocaleDateString()}
                  </b>
                </p>
                <p>
                  До:{" "}
                  <b>
                    {new Date(subscriptionInfo.endDate).toLocaleDateString()}
                  </b>
                </p>
                {subscriptionInfo.canceled ? (
                  <p style={{ color: "red" }}>
                    Подписка будет отключена после окончания текущего периода
                  </p>
                ) : (
                  <button onClick={handleCancelPremium}>
                    Отменить подписку
                  </button>
                )}
              </>
            ) : (
              <>
                <p>
                  Премиум подписка откроет доступ к дополнительным возможностям
                  🎁
                </p>
                <ul>
                  <li>📈 Графики успеваемости</li>
                  <li>🧠 Расширенная статистика</li>
                  <li>🎨 Улучшенное оформление</li>
                  {/* Можно дополнять список */}
                </ul>
                <label>
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={() => setAccepted(!accepted)}
                  />
                  Я принимаю условия <a href="/rules">оферты и политики</a>
                </label>
                <button
                  disabled={!accepted || loading}
                  onClick={handlePremiumBuy}
                  style={{
                    cursor: accepted && !loading ? "pointer" : "default",
                    opacity: accepted ? 1 : 0.6,
                  }}
                >
                  {loading ? "Оформление..." : "Оформить за 99 ₽/мес"}
                </button>
              </>
            )}

            <div style={{ style: "flex", gap: "10px", marginTop: "5px" }}>
              <button onClick={onClose}>Закрыть</button>
            </div>
            <div style={{ marginTop: "10px" }}>
              <small style={{ fontSize: "10px", color: "#777" }}>
                Подписка активируется сразу после оплаты. Возврат средств
                возможен только в случае технических сбоев, по обращению в
                поддержку.
              </small>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PremiumModal;
