import React, { useState } from "react";
import axios from "axios";
import "./styles/Login.css";

function Login({ onLogin, apiUrl }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${apiUrl}/api/login`, {
        username,
        password,
      });
      const token = res.data.token;

      const payloadBase64 = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));

      const user = res.data.user;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      onLogin(token, user);
    } catch (err) {
      console.error(err);
      setError("Invalid username or password");
    }
  };

  return (
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
  );
}

export default Login;
