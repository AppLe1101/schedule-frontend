// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Loading from "./Loading";
import TwoFAVerifyModal from "./TwoFAVerifyModal";
import PasswordConfirmModal from "./PasswordConfirmModal";
import DelReqModal from "./DelReqModal";
import "./styles/Settings.css";
import { motion } from "framer-motion";

const Settings = ({ token, apiUrl, user, theme, setTheme }) => {
  const { id } = useParams();
  const [stage, setStage] = useState("idle"); // "password" | "2fa" | "confirm"
  const [password, setPassword] = useState("");
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQRCodeUrl] = useState(null);
  const [secret, setSecret] = useState(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [allowComments, setAllowComments] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [enableTrustAI, setEnableTrustAI] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/users/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res.data);
        setTwoFAEnabled(res.data.twoFAEnabled);
        setAllowComments(res.data.allowComments);
        setEnableAnimations(res.data.enableAnimations);
        setEnableTrustAI(res.data.trustAI);
        setEmail(res.data.email || "");
        setPhone(res.data.phone || "");
        setEmailVerified(res.data.emailVerified);
        const cardsRes = await axios.get(`${apiUrl}/api/payments/methods`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPaymentMethods(cardsRes.data.methods || []);
      } catch (err) {
        console.error("Ошибка при получении настроек:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSettings();
    }
  }, [token, apiUrl]);

  const toggle2FA = async () => {
    if (twoFAEnabled) {
      setShowDisableModal(true);
      return;
    }

    try {
      const res = await axios.post(
        `${apiUrl}/api/users/2fa/setup`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQRCodeUrl(res.data.qrCodeUrl);
      setSecret(res.data.secret);
      setTwoFAEnabled(res.data.twoFAEnabled);
      setShowEnableModal(true);
    } catch (err) {
      console.error("Ошибка при включении 2FA:", err);
      setError("Не удалось включить 2FA");
    }
  };

  const disable2FA = async () => {
    try {
      await axios.post(
        `${apiUrl}/api/users/2fa/disable`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTwoFAEnabled(false);
    } catch (err) {
      console.error("Ошибка при отключении 2FA:", err);
      setError("Не удалось отключить 2FA");
    }
  };

  const handleContactSave = async (field) => {
    try {
      await axios.put(
        `${apiUrl}/api/users/${user._id}/update-contacts`,
        {
          email: field === "email" ? email : user.email,
          phone: field === "phone" ? phone : user.phone,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Контактные данные обновлены");

      if (field === "email") setEditingEmail(false);
      if (field === "phone") setEditingPhone(false);
    } catch (err) {
      toast.error("Ошибка при сохранении контактов");
      console.log("Ошибка при сохранении контактов", err);
    }
  };

  const handleDeleteClick = () => {
    setStage("password");
  };

  const handleDeleteRequestSend = async (reason) => {
    try {
      await axios.post(
        `${apiUrl}/api/deletion`,
        {
          reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Запрос на удлаение аккаунта отправлен");
    } catch (err) {
      toast.error("Ошибка при отправке запроса");
    }
  };

  const requestVerificationCode = async () => {
    try {
      await axios.post(
        `${apiUrl}/api/users/request-email-verification`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Код отправлен на почту!");
      setIsVerifying(true);
    } catch (err) {
      toast.error("Ошибка при отправке кода");
    }
  };

  const verifyEmailCode = async () => {
    try {
      const res = await axios.post(
        `${apiUrl}/api/users/verify-email`,
        {
          code: verificationCode,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(res.data.message);
      setEmailVerified(true);
      setIsVerifying(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Ошибка подтверждения");
    }
  };

  // Временно добавим фейковый способ оплаты для скрина
  const mockedCard = {
    id: "test_1234",
    card: {
      type: "Visa",
      last4: "1234",
      expiry_month: "12",
      expiry_year: "2030",
    },
    brandIcon:
      "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png", // или локальную иконку
  };
  const methodsToRender =
    paymentMethods.length === 0 ? [mockedCard] : paymentMethods;

  const getCardIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "visa":
        return "/img/visa.svg";
      case "mastercard":
        return "/img/mastercard.svg";
      case "mir":
      case "мир":
        return "/img/mir.svg";
      default:
        return "/img/credit-card.svg";
    }
  };

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );

  return (
    <motion.div
      style={{ padding: "20px" }}
      className="settings-container"
      initial={{ opacity: 1, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <h2>Настройки</h2>

      <button onClick={() => navigate(-1)} className="back-button">
        ← Назад
      </button>

      {/* НАСТРОЙКИ ПРОФИЛЯ */}
      <div className="contacts-settings">
        <h3>Контактные данные</h3>

        {!emailVerified && (
          <div className="email-verification">
            {isVerifying ? (
              <div className="verifyingContacts">
                <input
                  className="email-code-input"
                  type="text"
                  placeholder="Введите код"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <div className="buttons-container">
                  <button onClick={verifyEmailCode}>Подтвердить</button>
                  <button onClick={() => setIsVerifying(false)}>Отмена</button>
                </div>
              </div>
            ) : (
              <div className="verifyingContacts">
                <p style={{ color: "white" }}>Ваша почта не подтверждена!</p>

                <button onClick={requestVerificationCode}>Подтвердить</button>
              </div>
            )}
          </div>
        )}

        <div className="contact-field">
          <label>Email:</label>
          {editingEmail ? (
            <>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={user.email || "example@example.com"}
              />
              <button onClick={() => handleContactSave("email")}>
                💾 Сохранить
              </button>
            </>
          ) : (
            <>
              <span style={{ color: emailVerified ? "green" : "inherit" }}>
                {email || "Не указано"}
              </span>
              <button
                onClick={() => setEditingEmail(true)}
                className="edit-button"
              >
                <img src="/img/edit.svg" />
              </button>
            </>
          )}
        </div>

        <div className="contact-field">
          <label>Телефон:</label>
          {editingPhone ? (
            <>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={user.phone || "+7 (XXX) XXX-XX-XX"}
              />
              <button onClick={() => handleContactSave("phone")}>
                💾 Сохранить
              </button>
            </>
          ) : (
            <>
              <span>{phone || "Не указано"}</span>
              <button
                onClick={() => setEditingPhone(true)}
                className="edit-button"
              >
                <img src="/img/edit.svg" />
              </button>
            </>
          )}
        </div>

        <div className="payments-methods-settings">
          <h3>Способы оплаты</h3>
          {paymentMethods.length === 0 ? (
            <p>Нет привязанных карт</p>
          ) : (
            paymentMethods.map((method) => (
              <div key={method.id} className="payment-method-item">
                <img
                  src={getCardIcon(method.card.card_type)}
                  alt={method.card.card_type}
                  className="card-icon"
                />
                <span>
                  {method.card.first6}******
                  {method.card.last4} ({method.card.expiry_month},{" "}
                  {method.card.expiry_year})
                </span>
                <button
                  className="delete-card-button"
                  onClick={async () => {
                    try {
                      await axios.delete(
                        `${apiUrl}/api/payments/methods/${method.id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      toast.success("Карта удалена");
                      setPaymentMethods((prev) =>
                        prev.filter((m) => m.id !== method.id)
                      );
                    } catch (err) {
                      toast.error("Ошибка при удалении карты");
                    }
                  }}
                >
                  Удалить
                </button>
              </div>
            ))
          )}
          <button
            style={{ marginTop: "10px" }}
            onClick={() => navigate("/payment-history")}
          >
            История оплат
          </button>
        </div>
      </div>

      {/* НАСТРОЙКА ДВУХФАКТОРКИ */}
      <div className="twofa-settings">
        <h4>Двухфакторная аутентификация (2FA)</h4>

        {twoFAEnabled ? (
          <p style={{ color: "green", fontWeight: "bold" }}>2FA включена ✅</p>
        ) : (
          <p style={{ color: "red", fontWeight: "bold" }}>2FA отключена ❌</p>
        )}

        <button
          onClick={() =>
            twoFAEnabled ? setShowDisableModal(true) : toggle2FA()
          }
          style={{ marginTop: "10px" }}
        >
          {twoFAEnabled ? "Выключить 2FA" : "Включить 2FA"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <div className="theme-toggle-setting">
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="default-light">Светлая</option>
          <option value="default-dark">Темная</option>
          <option value="default-ultra-dark">Ночь</option>
        </select>
      </div>

      <div className="comments-toggle-setting">
        <label className="switch">
          <input
            type="checkbox"
            checked={allowComments}
            onChange={async (e) => {
              const newVal = e.target.checked;
              setAllowComments(newVal);
              try {
                await axios.put(
                  `${apiUrl}/api/users/${user._id}/update-comments-setting`,
                  {
                    allowComments: newVal,
                  },
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
              } catch (err) {
                console.error(
                  "Ошибка при обновлении настроек комментариев:",
                  err
                );
              }
            }}
          />
          <span className="slider"></span>
          <span className="switch-label">
            Разрешить другим оставлять комментарии
          </span>
        </label>
      </div>

      <div className="comments-toggle-setting">
        <label className="switch">
          <input
            type="checkbox"
            checked={enableAnimations}
            onChange={async (e) => {
              const newVal = e.target.checked;
              setEnableAnimations(newVal);
              try {
                await axios.put(
                  `${apiUrl}/api/users/${user._id}/update-animations-usage`,
                  {
                    enableAnimations: newVal,
                  },
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
              } catch (err) {
                console.error("Ошибка при обновлении настроек анимаций:", err);
              }
            }}
          />
          <span className="slider"></span>
          <span className="switch-label">Анимации</span>
        </label>
      </div>

      <div className="comments-toggle-setting">
        <label className="switch">
          <input
            type="checkbox"
            checked={enableTrustAI}
            onChange={async (e) => {
              const newVal = e.target.checked;
              setEnableTrustAI(newVal);
              try {
                await axios.put(
                  `${apiUrl}/api/users/${user._id}/update-trustAI-setting`,
                  {
                    trustAI: newVal,
                  },
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
              } catch (err) {
                console.error(
                  "Ошибка при обновлении настроек доверия ИИ:",
                  err
                );
              }
            }}
          />
          <span className="slider"></span>
          <span className="switch-label">Доверять ИИ</span>
        </label>
      </div>

      <div className="account-deletion">
        <button onClick={handleDeleteClick}>Удалить Аккаунт</button>
      </div>

      {/* ===================================================МОДАЛКИ================================================== */}

      {/* Шаг 1: подтверждение пароля */}
      {stage === "password" && (
        <PasswordConfirmModal
          onClose={() => setStage("idle")}
          onConfirm={(enteredPassword) => {
            setPassword(enteredPassword);
            if (twoFAEnabled) {
              setStage("2fa");
            } else {
              setStage("confirm");
            }
          }}
        />
      )}

      {/* Шаг 2: 2FA (если включена) */}
      {stage === "2fa" && (
        <TwoFAVerifyModal
          mode=""
          apiUrl={apiUrl}
          userId={user._id}
          showQRCode={false}
          onClose={() => setStage("idle")}
          onSuccess={() => setStage("confirm")}
        />
      )}

      {/* Шаг 3: подтверждение причины удаления */}
      {stage === "confirm" && (
        <DelReqModal
          isOpen={true}
          onClose={() => setStage("idle")}
          onSubmit={handleDeleteRequestSend}
        />
      )}

      {/* Модалка при включении */}
      {showEnableModal && qrCodeUrl && (
        <TwoFAVerifyModal
          mode="verify-only"
          apiUrl={apiUrl}
          userId={user._id}
          showQRCode={true}
          qrCodeUrl={qrCodeUrl}
          onClose={() => setShowEnableModal(false)}
          onSuccess={() => {
            setTwoFAEnabled(true);
            setQRCodeUrl(null);
            setShowEnableModal(false);
          }}
        />
      )}

      {/* Модалка при выключении */}
      {showDisableModal && (
        <TwoFAVerifyModal
          mode=""
          apiUrl={apiUrl}
          userId={user._id}
          showQRCode={false}
          onClose={() => setShowDisableModal(false)}
          onSuccess={() => {
            disable2FA();
            setShowDisableModal(false);
          }}
        />
      )}
    </motion.div>
  );
};

export default Settings;
