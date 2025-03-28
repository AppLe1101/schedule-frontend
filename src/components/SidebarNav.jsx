import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./SidebarNav.css";
import { ReactComponent as ProfileIcon } from "./icons/profile.svg";
import { ReactComponent as ScheduleIcon } from "./icons/schedule.svg";
import { ReactComponent as DiaryIcon } from "./icons/diary.svg";

const SidebarNav = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navItems = [
    { path: "/profile", label: "Профиль", icon: <ProfileIcon /> },
    { path: "/groups", label: "Расписание", icon: <ScheduleIcon /> },
    { path: "/grades", label: "Журнал", icon: <DiaryIcon /> },
  ];

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className={`sidebar-nav ${expanded ? "expanded" : ""}`}>
      {!showConfirm ? (
        <>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav__item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <div className="sidebar-icon">{item.icon}</div>
            </Link>
          ))}
          {/* кнопка выхода */}
          <button
            onClick={() => {
              setShowConfirm(true);
              setExpanded(true);
            }}
            className="logout-btn"
          >
            <div className="sidebar-icon">
              <svg
                fill="none"
                height="24"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17 16L21 12M21 12L17 8M21 12L7 12M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8"
                  stroke="#374151"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
          </button>
        </>
      ) : (
        <div className="confirm-logout">
          <p>Вы уверены что хотите выйти с аккаунта?</p>
          <button
            onClick={() => {
              setShowConfirm(false);
              setExpanded(false);
            }}
            className="cancel-logout"
          >
            Отмена
          </button>
          <button onClick={handleLogout} className="confirm-logout-btn">
            Выйти
          </button>
        </div>
      )}
    </div>
  );
};

export default SidebarNav;
