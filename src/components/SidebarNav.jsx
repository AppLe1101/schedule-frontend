import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./SidebarNav.css";
import logoutIcon from "./icons/logout.svg";
import { ReactComponent as ProfileIcon } from "./icons/profile.svg";
import { ReactComponent as ScheduleIcon } from "./icons/schedule.svg";
import { ReactComponent as DiaryIcon } from "./icons/diary.svg";

const SidebarNav = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

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
    <div className="sidebar-nav">
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
        onClick={handleLogout}
        style={{
          padding: "12px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#c00",
          fontWeight: "bold",
        }}
      >
        <img src={logoutIcon} alt="Выйти" width="34" />
      </button>
    </div>
  );
};

export default SidebarNav;
