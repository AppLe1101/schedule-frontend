import React from "react";

const trustAIModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Вы уверены, что хотите доверить свои оценки ИИ?</h3>
        <p>
          При включении этой опции оценки, выставленные ИИ, будут
          <strong> автоматически</strong> записываться в журнал{" "}
          <strong>без проверки учителем!</strong>
        </p>
        <p style={{ color: "rgba(255, 10, 10, 0.7)" }}>ИИ может ошибаться!</p>
        <p>Вы можете отключить это в любой момент в настройках.</p>
        <div className="modal-buttons">
          <button onClick={onCancel} className="cancel-button">
            Отмена
          </button>
          <button onClick={onConfirm} className="confirm-button">
            Я доверяю
          </button>
        </div>
      </div>
    </div>
  );
};

export default trustAIModal;
