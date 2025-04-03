import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as ProfileIcon } from "./icons/profile.svg";
import { ReactComponent as ScheduleIcon } from "./icons/schedule.svg";
import { ReactComponent as DiaryIcon } from "./icons/diary.svg";
import { ReactComponent as MainPageIcon } from "./icons/mainpage.svg";
import { ReactComponent as BellIcon } from "./icons/bell.svg";
import { ReactComponent as HomeworkIcon } from "./icons/homework.svg";
import "./styles/SidebarNav.css";

const SidebarNav = ({ onLogout, user, apiUrl, token }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasNewNews, setHasNewNews] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const storedUser = JSON.parse(sessionStorage.getItem("user"));
        const token = sessionStorage.getItem("token");
        const response = await fetch(`${apiUrl}/api/news`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allNews = await response.json();
        const unread = allNews.some(
          (news) => !storedUser?.readNews?.includes(news._id)
        );
        setHasNewNews(unread);
      } catch (err) {
        console.error("Ошибка при получении новостей", err);
      }
    };

    fetchNews();
  }, [location]);

  const navItems = [
    { path: `/profile/${user._id}`, label: "Профиль", icon: <ProfileIcon /> },
    { path: "/news", label: "главная", icon: <MainPageIcon /> },
    {
      path: "/homework",
      label: "ДЗ",
      icon: <HomeworkIcon />,
    },
    { path: "/groups", label: "Расписание", icon: <ScheduleIcon /> },
    { path: "/grades", label: "Журнал", icon: <DiaryIcon /> },
  ];

  const navItemsMain = [{ path: "news", label: "главная", icon: <BellIcon /> }];

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="sidebar-main">
      {hasNewNews && (
        <div className="sidebar-nav-message">
          {navItemsMain.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav__item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span className="sidebar-icon">{item.icon}</span>
            </Link>
          ))}
        </div>
      )}
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
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
    </div>
  );
};

export default SidebarNav;
