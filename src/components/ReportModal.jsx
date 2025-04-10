import React, { useState } from "react";
import "./styles/ReportModal.css";

const ReportModal = ({ isOpen, onClose, onSubmit, targetId }) => {
  const [reason, setReason] = useState("Оскорбительное поведение");
  const [customReason, setCustomReason] = useState("");

  const reasons = [
    "Оскорбительное поведение",
    "Нецензурная лексика",
    "Спам",
    "Другое",
  ];

  const handleSend = () => {
    const message = reason === "Другое" ? customReason : reason;
    onSubmit(targetId, message);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="rep-modal-header">Пожаловаться</h2>

        <label className="rep-modal-reason-text">Причина жалобы:</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="rep-modal-reason-select"
        >
          {reasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {reason === "Другое" && (
          <textarea
            placeholder="Введите причину..."
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            className="rep-modal-reason-textarea"
          />
        )}

        <div className="rep-modal-buttons">
          <button onClick={onClose} className="rep-modal-cancel-button">
            Отмена
          </button>
          <button onClick={handleSend} className="rep-modal-send-button">
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
