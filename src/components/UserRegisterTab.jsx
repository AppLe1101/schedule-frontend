// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const UserRegisterTab = ({ apiUrl, token }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const generatePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let newPass = "";
    for (let i = 0; i < 10; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPass);
  };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    toast.info("Пароль скопирован");
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !role) {
      toast.error("Заполните все поля!");
      return;
    }

    try {
      await axios.post(
        `${apiUrl}/api/users`,
        { username, email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Пользователь успешно создан");
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("student");
    } catch (err) {
      console.error("Ошибка при создании пользователя:", err);
      if (err.response?.status === 409) {
        toast.error("Пользователь с такой почтой уже существует");
      } else {
        toast.error("Ошибка при создании пользователя");
      }
    }
  };

  return (
    <div className="reg-user-container">
      <h2>Регистрация нового пользователя</h2>
      <div className="name-field-container">
        <label>Имя пользователя</label>
        <input
          type="text"
          className="name-input"
          placeholder="Ф.И.О"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="email-field-container">
        <label>Почта</label>
        <input
          type="text"
          className="email-input"
          placeholder="example@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="pass-field-container">
        <label>Пароль</label>
        <div className="pass-field-controls">
          <input
            type="text"
            className="pass-input"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={generatePassword} className="pass-gen-button">
            🎲
          </button>
          <button onClick={copyToClipboard} className="copy-button">
            📋
          </button>
        </div>
      </div>

      <div className="role-select-container">
        <select
          className="role-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Студент</option>
          <option value="teacher">Преподаватель</option>
          <option value="director">Директор</option>
          <option value="editor">Редактор</option>
        </select>
      </div>

      <button onClick={handleRegister} className="reg-button">
        Зарегистрировать
      </button>
    </div>
  );
};

export default UserRegisterTab;
