// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useState } from "react";
import "./styles/DelReqModal.css";

const DelReqModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");

  const handleSend = () => {
    onSubmit(reason);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="drm-container">
      <div className="modal">
        <h2>Удалить аккаунт?</h2>
        <textarea
          onChange={(e) => setReason(e.target.value)}
          className="delete-reason"
          placeholder="Причина удаления (обязательно)"
          required
        />
        <div
          style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
        >
          <button onClick={onClose} className="cancel-deletion">
            Отмена
          </button>
          <button onClick={handleSend} className="submit-deletion">
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

export default DelReqModal;
