// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import axios from "axios";
import TwoFAVerifyModal from "./TwoFAVerifyModal";
import "./styles/Login.css";

function Login({ onLogin, apiUrl }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showTwoFAModal, setShowTwoFAModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const nodeRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${apiUrl}/api/login`, {
        username,
        password,
      });
      if (res.data.requires2FA) {
        setUserId(res.data.userId);
        setShowTwoFAModal(true);
        return;
      }

      const token = res.data.token;
      const user = res.data.user;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onLogin(token, user);
    } catch (err) {
      console.error(err);
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Вход</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Имя пользователя:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Введите имя"
            />
          </div>
          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Введите пароль"
            />
          </div>
          <button type="submit" className="submit-button">
            Войти
          </button>
        </form>
      </div>

      <div className="premium-link-login">
        <Link to={"/premium"}>LearningPortal Premium</Link>
      </div>

      {showTwoFAModal && (
        <CSSTransition
          nodeRef={nodeRef}
          in={showTwoFAModal}
          timeout={300}
          classNames="fade-zoom"
          unmountOnExit
        >
          <TwoFAVerifyModal
            showQrCode={false}
            ref={nodeRef}
            show={true}
            apiUrl={apiUrl}
            userId={userId}
            onClose={() => setShowTwoFAModal(false)}
            onSuccess={(token, user) => {
              localStorage.setItem("token", token);
              localStorage.setItem("user", JSON.stringify(user));
              onLogin(token, user);
            }}
          />
        </CSSTransition>
      )}
    </div>
  );
}

export default Login;
