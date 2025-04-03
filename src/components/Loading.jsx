import React from "react";
import "./styles/Loading.css";

const Loading = () => {
  return (
    <div className="glass-loader-container">
      <div className="glass-loader">
        <div className="pulse-ring" />
        <span className="glass-text">Загрузка...</span>
      </div>
    </div>
  );
};

export default Loading;
