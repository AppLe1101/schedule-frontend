import React, { useState, useEffect } from "react";
import axios from "axios";
import Loading from "./Loading";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import "./styles/PaymentHistoryPage.css";

const PaymentHistoryPage = ({ apiUrl, token }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/payments/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(res.data.payments || []);
      } catch (err) {
        console.error("Ошибка загрузки истории платежей", err);
        toast.error("Ошибка загрузки истории платежей");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [apiUrl, token]);

  if (loading) return <Loading />;

  return (
    <motion.div
      initial={{ opacity: 1, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="payment-history-container"
    >
      <h1>История оплат</h1>
      {payments.length === 0 ? (
        <p>Оплат пока нет</p>
      ) : (
        <div className="payment-history-items-container">
          {[...payments]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((p, i) => (
              <motion.div
                key={i}
                className="payment-history-item"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 25,
                  bounce: 0.5,
                  delay: i * 0.1,
                }}
              >
                <div>
                  <div style={{ fontWeight: "600" }}>{p.description}</div>
                  <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                    {new Date(p.date).toLocaleString()}
                  </div>
                </div>
                <div className="text-currency-amount">
                  <div style={{ fontWeight: "600", fontSize: "1rem" }}>
                    {p.amount} {p.currency}
                  </div>
                  <div
                    className={`text-status ${
                      p.status === "succeeded" ? "succeeded" : ""
                    }`}
                  >
                    {p.status === "succeeded" ? (
                      <div>Успешно</div>
                    ) : (
                      <div>Ошибка</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </motion.div>
  );
};

export default PaymentHistoryPage;
