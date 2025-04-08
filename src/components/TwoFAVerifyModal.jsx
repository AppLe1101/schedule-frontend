import React, { useState, useEffect, useRef, forwardRef } from "react";
import axios from "axios";
import "./styles/TwoFAVerifyModal.css";

const TwoFAVerifyModal = forwardRef(
  (
    { apiUrl, userId, onSuccess, onClose, showQRCode, qrCodeUrl, mode },
    ref
  ) => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const inputs = useRef([]);

    useEffect(() => {
      if (inputs.current[0]) inputs.current[0].focus();
    }, []);

    const handleChange = (value, index) => {
      if (!/^[0-9]?$/.test(value)) return;
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) inputs.current[index + 1].focus();
    };

    const handleKeyDown = (e, index) => {
      if (e.key === "Backspace" && !code[index] && index > 0) {
        inputs.current[index - 1].focus();
      }
    };

    const handleSubmit = async () => {
      const fullCode = code.join("");
      if (fullCode.length !== 6) return setError("Введите 6-значный код");
      setLoading(true);
      try {
        const res = await axios.post(`${apiUrl}/api/verify-2fa`, {
          userId,
          token: fullCode,
          mode,
        });

        const isSuccess =
          mode === "verify-only" ? res.data.success : res.data.token;

        if (isSuccess) {
          setSuccess(true);
          setError(null);

          // если пришёл токен — сохраняем
          if (res.data.token) {
            sessionStorage.setItem("token", res.data.token);
            sessionStorage.setItem("user", JSON.stringify(res.data.user));
          }

          onSuccess(res.data.token, res.data.user); // можно и null, если нет
        } else {
          setError("Неверный код");
          setSuccess(false);
        }
      } catch (err) {
        console.error("Ошибка при проверке 2FA:", err);
        setError("Ошибка при проверке кода");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="twofa-modal" ref={ref}>
        <div className="twofa-content">
          {showQRCode && qrCodeUrl && (
            <div className="qrcode-container">
              <small>
                Отсканируйте qr-код в прилождении Google Auth, Apple Password,
                тп...
              </small>
              <img
                src={qrCodeUrl}
                alt="QR-код для 2FA"
                className="twofa-qrcode"
              />
            </div>
          )}
          <h3>Код из приложения</h3>
          <small style={{ color: "gray" }}>
            Google Auth, Apple Password, ect...
          </small>
          <div className="twofa-inputs">
            {code.map((digit, index) => (
              <input
                type="tel"
                pattern="[0-9]*"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputs.current[index] = el)}
                key={index}
                className={success ? "success" : error ? "error" : ""}
                maxLength={1}
              />
            ))}
          </div>
          {error && <p className="twofa-error">{error}</p>}
          <div className="buttons">
            <button className="cancel-auth-btn" onClick={onClose}>
              Отмена
            </button>
            <button
              className="confirm-button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Проверка..." : "Подтвердить"}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default TwoFAVerifyModal;
