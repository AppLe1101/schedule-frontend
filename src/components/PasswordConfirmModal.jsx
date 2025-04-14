import React, { useState } from "react";
import "./styles/PasswordConfirmModal.css";

const PasswordConfirmModal = ({ onClose, onConfirm }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!password.trim()) {
      setError("Введите пароль");
      return;
    }

    onConfirm(password);
    setPassword("");
    setError("");
  };

  return (
    <div className="pcm-container">
      <div className="pcm-modal">
        <h2>Подтвердите пароль</h2>
        <input
          type="password"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pcm-input"
        />
        {error && <p className="pcm-error">{error}</p>}
        <div className="pcm-buttons">
          <button className="pcm-cancel" onClick={onClose}>
            Отмена
          </button>
          <button className="pcm-confirm" onClick={handleSubmit}>
            Далее
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordConfirmModal;
