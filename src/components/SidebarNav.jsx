import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as ProfileIcon } from "./icons/profile.svg";
import { ReactComponent as ScheduleIcon } from "./icons/schedule.svg";
import { ReactComponent as DiaryIcon } from "./icons/diary.svg";
import { ReactComponent as BellIcon } from "./icons/bell.svg";
import TooltipWrapper from "./TooltipWrapper";
import { BookMarked, LogOut, Newspaper, LayoutDashboard } from "lucide-react";
import "./styles/SidebarNav.css";
import "./styles/TooltipWrapper.css";
import { motion } from "framer-motion";

const SidebarNav = ({ onLogout, user, apiUrl, token }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasNewNews, setHasNewNews] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
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
    {
      path: `/profile/${user._id}`,
      label: "Профиль",
      icon: <ProfileIcon />,
    },
    { path: "/news", label: "Главная", icon: <Newspaper color="black" /> },
    {
      path: "/homework",
      label: "ДЗ",
      icon: <BookMarked color="black" />,
    },
    { path: "/groups", label: "Расписание", icon: <ScheduleIcon /> },
    { path: "/grades", label: "Журнал", icon: <DiaryIcon /> },
  ];

  const navItemsMain = [{ path: "news", label: "Главная", icon: <BellIcon /> }];

  const adminItems = [
    {
      path: "/dashboard",
      label: "Админ панель",
      icon: <LayoutDashboard color="black" />,
    },
  ];

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="sidebar-main">
      <motion.div
        initial={{ x: 60 }}
        animate={{ x: 0 }}
        exit={{ x: 60 }}
        transition={{ duration: 0.5 }}
        style={{
          gap: "15px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        className="sidebar-inside"
      >
        {/* NOTIFICATIONS */}
        {hasNewNews && (
          <div className={`sidebar-nav-message ${expanded ? "none" : ""}`}>
            {navItemsMain.map((item) => (
              <TooltipWrapper key={item.path} label={item.label}>
                <Link
                  to={item.path}
                  className={`sidebar-nav__item ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                </Link>
              </TooltipWrapper>
            ))}
          </div>
        )}

        {/* ADMIN SIDEBAR ELEMENTS */}
        {(user.role === "director" || user.role === "admin") && (
          <div
            className={`sidebar-nav-admin ${expanded ? "none" : ""}`}
            style={{ padding: "15px 0" }}
          >
            {adminItems.map((item) => (
              <TooltipWrapper key={item.path} label={item.label}>
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-nav__item ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                </Link>
              </TooltipWrapper>
            ))}
          </div>
        )}

        {/* MAIN SIDEBAR */}
        <div className={`sidebar-nav ${expanded ? "expanded" : ""}`}>
          {!showConfirm ? (
            <>
              {navItems.map((item) => (
                <TooltipWrapper key={item.path} label={item.label}>
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`sidebar-nav__item ${
                      location.pathname === item.path ? "active" : ""
                    }`}
                  >
                    <div className="sidebar-icon">{item.icon}</div>
                  </Link>
                </TooltipWrapper>
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
      </motion.div>
    </div>
  );
};

export default SidebarNav;
