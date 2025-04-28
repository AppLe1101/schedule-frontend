import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Loading from "./Loading";
import TwoFAVerifyModal from "./TwoFAVerifyModal";
import PasswordConfirmModal from "./PasswordConfirmModal";
import DelReqModal from "./DelReqModal";
import "./styles/Settings.css";

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
  const [showAccountDeletionModal, setShowAccountDeletionModal] =
    useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/users/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTwoFAEnabled(res.data.twoFAEnabled);
        setAllowComments(res.data.allowComments);
        setEnableAnimations(res.data.enableAnimations);
        setEmail(res.data.email || "");
        setPhone(res.data.phone || "");
        console.log(res.data);
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

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );

  return (
    <div style={{ padding: "20px" }} className="settings-container">
      <h2>Настройки</h2>

      <button onClick={() => navigate(-1)} className="back-button">
        ← Назад
      </button>

      {/* НАСТРОЙКИ ПРОФИЛЯ */}
      <div className="contacts-settings">
        <h3>Контактные данные</h3>

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
              <span>{email || "Не указано"}</span>
              <button onClick={() => setEditingEmail(true)}>
                ✏ Редактировать
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
              <button onClick={() => setEditingPhone(true)}>
                ✏ Редактировать
              </button>
            </>
          )}
        </div>
      </div>

      {/* НАСТРОЙКА ДВУХФАКТОРКИ */}
      <div style={{ marginTop: "20px" }}>
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
    </div>
  );
};

export default Settings;
