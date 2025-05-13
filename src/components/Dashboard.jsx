// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useState, useEffect } from "react";
import ReportTab from "./ReportsTab";
import DeleteReqTab from "./DeleteReqTab";
import UserRegisterTab from "./UserRegisterTab";
import BadgesTab from "./BadgesTab";
import GroupsTab from "./GroupsTab";
import axios from "axios";
import "./styles/Dashboard.css";

const Dashboard = ({ user, apiUrl, token }) => {
  const [activeTab, setActiveTab] = useState("reports");

  return (
    <div className="dashboard-container">
      <div className="sidebar-left">
        <p>Администрация</p>

        {/* TABS */}
        <div className="tabs-buttons">
          <button onClick={() => setActiveTab("reports")}>Жалобы</button>
          <button onClick={() => setActiveTab("deletion")}>
            Запросы на удаление
          </button>
          <button onClick={() => setActiveTab("register")}>
            Регистрация пользователя
          </button>
          <button onClick={() => setActiveTab("groups")}>Группы</button>
          <button onClick={() => setActiveTab("give-badge")}>Значки</button>
        </div>

        {/* ABOUT ADMIN PANEL */}
        <div className="ap-info">v1.5.0</div>
      </div>

      {/* MAIN CONTENT */}
      <div className="tabs-content">
        {activeTab === "reports" && <ReportTab apiUrl={apiUrl} token={token} />}
        {activeTab === "deletion" && (
          <DeleteReqTab apiUrl={apiUrl} token={token} user={user} />
        )}
        {activeTab === "register" && (
          <UserRegisterTab apiUrl={apiUrl} token={token} user={user} />
        )}
        {activeTab === "give-badge" && (
          <BadgesTab apiUrl={apiUrl} user={user} token={token} />
        )}
        {activeTab === "groups" && (
          <GroupsTab apiUrl={apiUrl} token={token} user={user} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
