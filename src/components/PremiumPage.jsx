import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import "./styles/PremiumPage.css";

const PremiumPage = ({ user, token, apiUrl }) => {
  const navigate = useNavigate();
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const isActive = subscriptionInfo?.active;
  const isCanceled = subscriptionInfo?.canceled;
  const expired =
    subscriptionInfo?.endDate &&
    new Date(subscriptionInfo.endDate) < new Date() &&
    !isActive;

  const fetchSubscription = async () => {
    if (user && token) {
      try {
        const res = await axios.get(`${apiUrl}/api/users/premium-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubscriptionInfo(res.data);
      } catch (err) {
        console.error("Ошибка при получении статуса подписки:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [token, apiUrl]);

  const handlePremiumBuy = async () => {
    if (!token || !user) {
      toast.info("Войдите в аккаунт, чтобы оформить подписку");
      return navigate("/login");
    }

    if (!accepted) {
      toast.warn("Необходимо принять условия оферты и политики");
      return;
    }

    try {
      const res = await axios.post(
        `${apiUrl}/api/payments/create-payment`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { url, paymentId } = res.data;
      localStorage.setItem("paymentId", paymentId);
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Ошибка получения ссылки на оплату");
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
      setSubscriptionInfo((prev) => ({
        ...prev,
        autoCancel: true,
      }));
      fetchSubscription();
    } catch (err) {
      console.error("Ошибка отмены:", err);
      toast.error("Ошибка при отмене подписки");
    }
  };

  const handleRenewPremium = async () => {
    try {
      await axios.post(`${apiUrl}/api/users/renew-premium`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Продление подписки возобновено");
      setSubscriptionInfo((prev) => ({
        ...prev,
        autoCancel: false,
      }));
      fetchSubscription();
    } catch (err) {
      console.error("Ошибка при возобновлении подписки", err);
      toast.error("Ошибка при возобновлении подписки");
    }
  };

  return (
    <div className="premium-page-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.6 }}
      >
        {loading ? (
          <Loading />
        ) : (
          <div className="cards-container">
            <div className="premium-card">
              {/* Хедер карты */}
              <div className="premium-header">
                🌟 LearningPortal Premium – 1 месяц
              </div>

              {/* Инфоблок о подписке */}
              {isActive ? (
                <div
                  className={`self-subscription-info ${
                    isCanceled ? "canceled" : ""
                  } ${expired ? "expired" : ""}`}
                >
                  <p className="premium-status">
                    ✅ Подписка активна (99 ₽/мес)
                  </p>
                  <p>
                    С:{" "}
                    {new Date(subscriptionInfo.startDate).toLocaleDateString()}
                  </p>
                  <p>
                    До:{" "}
                    {new Date(subscriptionInfo.endDate).toLocaleDateString()}
                  </p>

                  {isCanceled ? (
                    <>
                      <p className="auto-cancel-label">
                        🔕 Продление отключено
                      </p>
                      <button onClick={handleRenewPremium}>
                        Возобновить подписку
                      </button>
                    </>
                  ) : (
                    <button onClick={handleCancelPremium}>
                      Отключить продление
                    </button>
                  )}
                </div>
              ) : expired ? (
                <div className="self-subscription-info">
                  <p className="expired-label">⏰ Подписка истекла</p>
                  <button onClick={handlePremiumBuy}>Продлить</button>
                </div>
              ) : (
                <div className="buy-container">
                  <label className="accept-terms">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={() => setAccepted(!accepted)}
                    />
                    Я принимаю <a href="/policy">условия оферты и политики</a>
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
                </div>
              )}

              {/* Список преимуществ */}
              <div className="subscription-info-container">
                <p>
                  Подписка открывает доступ к дополнительным возможностям 🎁
                </p>
                <ul className="benefits-list">
                  <li style={{ color: "red" }}>🚧 Все функции в разработке</li>
                  <li>📈 Графики успеваемости</li>
                  <li>📊 Расширенная статистика</li>
                  <li>🎨 Улучшенное оформление</li>
                </ul>
              </div>

              <div className="disclaimer">
                <small>
                  Подписка активируется сразу после оплаты. Возврат возможен
                  только при технических сбоях, по обращению в поддержку.
                </small>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PremiumPage;
