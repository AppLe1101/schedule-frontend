import React, { useState } from "react";

const DelReqModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");

  const handleSend = () => {
    onSubmit(reason);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="drm-container">
      <button onClick={onClose} className="">
        Отмена
      </button>
      <h2>Удалить акканут?</h2>
      <textarea
        onChange={(e) => setReason(e.target.value)}
        className="delete-reason"
      />
      <button onClick={handleSend} className="submit-deletion">
        Удалить
      </button>
    </div>
  );
};

export default DelReqModal;
