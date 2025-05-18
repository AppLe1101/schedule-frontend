import React, { useState } from "react";
import axios from "axios";
import "./styles/SupportForm.css";

const SupportForm = ({ user, apiUrl, token }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "feedback",
    message: "",
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await axios.post(`${apiUrl}/api/users/support`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200) {
        setStatus("success");
        setFormData({ name: "", email: "", type: "feedback", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <form className="support-form" onSubmit={handleSubmit}>
      <h2>Связаться с нами</h2>
      <p>Напиши нам, если у вас есть вопросы, предложения или проблемы.</p>

      <input
        type="text"
        name="name"
        placeholder="Ваше имя (необязательно)"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email для ответа"
        value={user.email}
        onChange={handleChange}
      />

      <select name="type" value={formData.type} onChange={handleChange}>
        <option value="feedback">Предложение</option>
        <option value="bug">Сообщить об ошибке</option>
        <option value="question">Вопрос</option>
        <option value="other">Другое</option>
      </select>

      <textarea
        name="message"
        placeholder="Введите ваше сообщение..."
        value={formData.message}
        onChange={handleChange}
        required
      ></textarea>

      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Отправка..." : "Отправить"}
      </button>

      {status === "success" && <p className="success">Сообщение отправлено!</p>}
      {status === "error" && (
        <p className="error">Ошибка при отправке. Попробуйте позже.</p>
      )}
    </form>
  );
};

export default SupportForm;
