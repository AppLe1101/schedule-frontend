import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "./Loading";
import TwoFAVerifyModal from "./TwoFAVerifyModal";

const Settings = ({ token, apiUrl, user }) => {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQRCodeUrl] = useState(null);
  const [secret, setSecret] = useState(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);
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
          onSuccess={(token, user) => {
            disable2FA();
            setShowDisableModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Settings;
