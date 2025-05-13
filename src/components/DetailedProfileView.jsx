// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React from "react";
import { Link } from "react-router-dom";
import "./styles/Profile.css";

const DetailedProfileView = ({ profile, groupName }) => {
  return (
    <div className="profile-details-tab">
      <h3>Подробная информация</h3>
      <div className="details-contacts">
        <p>
          Email:<strong> {profile.email || "Не добавлена"}</strong>
        </p>
        <p>
          Номер телефона:<strong> {profile.phone || "Не добавлен"}</strong>
        </p>
      </div>
      <div className="details-learning">
        <p>
          <strong>Направление обучения:</strong> {profile.direction || "--"}
        </p>
        <p>
          <strong>Курс:</strong> {profile.course || "--"}
        </p>
        <p>
          <strong>Группа:</strong> {groupName || "--"}
        </p>
      </div>
      {profile.curator && (
        <div className="curator-card">
          <h4>Куратор</h4>
          <div className="curator-container">
            <div className="curator-container-left">
              <img
                src={profile.curator.avatar}
                alt="аватар куратора"
                className="curator-avatar"
              />
            </div>
            <div className="curator-container-right">
              <Link to={`/profile/${profile.curator._id}`}>
                👤 {profile.curator.username}
              </Link>
              <p>📧 {profile.curator.email || "Не указано"}</p>
              <p>📞 {profile.curator.phone || "Не указано"}</p>
              <p>
                🛡️ Роль:{" "}
                {profile.curator.role === "teacher"
                  ? "Преподаватель"
                  : "Директор"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedProfileView;
