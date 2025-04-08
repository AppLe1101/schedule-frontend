import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as ProfileIcon } from "./icons/profile.svg";
import { ReactComponent as ScheduleIcon } from "./icons/schedule.svg";
import { ReactComponent as DiaryIcon } from "./icons/diary.svg";
import { ReactComponent as MainPageIcon } from "./icons/mainpage.svg";
import { ReactComponent as BellIcon } from "./icons/bell.svg";
import { ReactComponent as HomeworkIcon } from "./icons/homework.svg";

import { BookMarked, LogOut, Newspaper } from "lucide-react";
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
    { path: "/news", label: "главная", icon: <Newspaper color="black" /> },
    {
      path: "/homework",
      label: "ДЗ",
      icon: <BookMarked color="black" />,
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
                <LogOut color="black" />
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
