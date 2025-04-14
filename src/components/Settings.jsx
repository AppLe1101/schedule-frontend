import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Loading from "./Loading";
import TwoFAVerifyModal from "./TwoFAVerifyModal";
import PasswordConfirmModal from "./PasswordConfirmModal";
import DelReqModal from "./DelReqModal";

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

  const verifyTwoFA = async () => {
    setVerifying(true);
    setError("");
    const userId = user._id || user.userId;
    try {
      const res = await axios.post(`${apiUrl}/api/verify-2fa`, {
        userId,
        token: code,
        mode: "verify-only",
      });

      if (res.data.success) {
        setTwoFAEnabled(true);
        setQRCodeUrl(null);
        setCode("");
        alert("2FA успешно включена");
      } else {
        setError("Неверный код 2FA");
      }
    } catch (err) {
      console.error("Ошибка при проверке 2FA:", err);
      alert("Неверный код 2FA");
    } finally {
      setVerifying(false);
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
    <div style={{ padding: "20px" }}>
      <h2>Настройки</h2>

      <button onClick={() => navigate(-1)} className="back-button">
        ← Назад
      </button>

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

      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="default-light">Светлая</option>
        <option value="default-dark">Темная</option>
        <option value="default-ultra-dark">Ночь</option>
      </select>

      <div className="account-deletion">
        <p>Удалить аккаунт</p>
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
