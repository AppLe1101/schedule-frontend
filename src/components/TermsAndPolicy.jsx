// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useState } from "react";
import "./styles/TermsAndPolicy.css";
import { motion } from "framer-motion";

const TermsAndPolicy = () => {
  const [activeTab, setActiveTab] = useState("rules");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="terms-container"
    >
      <div className="terms-tabs">
        <button
          onClick={() => setActiveTab("rules")}
          className={`terms-tab ${activeTab === "rules" ? "active" : ""}`}
        >
          Правила
        </button>
        <a
          href="https://learningportal.ru/docs/offer.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button
            onClick={() => setActiveTab("offer")}
            className={`offer-tab ${activeTab === "offer" ? "active" : ""}`}
          >
            Оферта
          </button>
        </a>
        <button
          onClick={() => setActiveTab("contacts")}
          className={`contacts-tab ${activeTab === "contacts" ? "active" : ""}`}
        >
          Контакты
        </button>
      </div>

      {activeTab === "rules" && (
        <div className="terms-box">
          <h1>Политика конфиденциальности и условия пользования</h1>
          <h2>1. Общие положения</h2>
          <p>
            Мы уважаем вашу конфиденциальность. Все данные, введённые на
            платформу, защищены и не передаются третьим лицам.
          </p>

          <h2>2. Учетные записи</h2>
          <p>
            Вы несёте ответственность за безопасность своей учётной записи. Не
            сообщайте пароль третьим лицам.
          </p>

          <h2>3. Поведение пользователей</h2>
          <p>
            Запрещено размещать оскорбительные комментарии, нецензурную лексику
            и другой нежелательный контент.
          </p>

          <h2>4. Контент и права</h2>
          <p>
            Весь контент (оценки, расписание, ДЗ и т.д.) принадлежит
            образовательному учреждению. Пользователь не может использовать его
            в коммерческих целях.
          </p>

          <h2>5. Изменения политики</h2>
          <p>
            Мы можем обновить условия в любое время. Актуальная версия всегда
            доступна на этой странице.
          </p>

          <p className="last-updated">Обновлено: 23 апреля 2025 г.</p>
        </div>
      )}
      {activeTab === "offer" && (
        <div className="offer-tab">
          <p>Документ открыт в новой вкладке</p>
          <a
            href="https://learningportal.ru/docs/offer.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            Открыть ещё раз
          </a>
        </div>
      )}
      {activeTab === "contacts" && (
        <div className="contacts-tab">
          <h2>Контактные данные</h2>
          <p>ФИО: Пономаренко Дмитрий Александрович</p>
          <p>ИНН: 930403656102</p>
          <p>Email: support@learningportal.ru</p>
          <p>Телефон: +7 (915) 257-12-65</p>
        </div>
      )}
    </motion.div>
  );
};

export default TermsAndPolicy;
