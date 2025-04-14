import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "./components/Login";
import Groups from "./components/Groups";
import Grades from "./components/Grades";
import Profile from "./components/Profile";
import SidebarNav from "./components/SidebarNav";
import GradesByStudent from "./components/GradesByStudent";
import MainPage from "./components/MainPage";
import HomeworkPage from "./components/HomeworkPage";
import Settings from "./components/Settings";
import Dashboard from "./components/Dashboard";
import HomeworkItemPage from "./components/HomeworkItemPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./components/utils/axiosSetup";
import "./App.css";

//const apiUrl = process.env.REACT_APP_API_URL;
const apiUrl = "https://mk1-schedule-backend-ff28aedc0b67.herokuapp.com";

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation();

  function decodeBase64Url(base64url) {
    let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    return atob(base64);
  }

  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const [theme, setTheme] = useState(
    sessionStorage.getItem("theme") || (systemPrefersDark ? "dark" : "light")
  );

  useEffect(() => {
    const userDataStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userDataStr || !token) {
      handleLogout();
      return;
    }

    try {
      const userData = JSON.parse(userDataStr);
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) throw new Error("Некоректрый токен");
      const payload = decodeBase64Url(tokenParts[1]);
      const decoded = JSON.parse(payload);

      if (decoded.exp * 1000 < Date.now()) {
        console.warn("Токен истек");
        handleLogout();
        return;
      }

      setToken(token);
      setUser(userData);
    } catch (e) {
      console.error("Ошибка при разборке токена", e);
      handleLogout();
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    sessionStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (token && user) {
      if (location.pathname !== "/login") {
        sessionStorage.setItem("lastVisited", location.pathname);
      }
    }
  }, [location.pathname, token, user]);

  const handleLogin = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
  };

  return (
    <>
      {token && (
        <SidebarNav
          onLogout={handleLogout}
          token={token}
          user={user}
          apiUrl={apiUrl}
        />
      )}

      <div className="App" style={{ marginRight: token ? "120px" : "0" }}>
        <header className="App-header"></header>

        <main>
          <Routes>
            <Route
              path="/login"
              element={
                token && user ? (
                  <Navigate
                    to={
                      sessionStorage.getItem("lastVisited") === "/login"
                        ? "/news"
                        : sessionStorage.getItem("lastVisited") || "/news"
                    }
                  />
                ) : (
                  <Login onLogin={handleLogin} apiUrl={apiUrl} />
                )
              }
            />

            <Route
              path="/groups"
              element={
                token ? (
                  <Groups token={token} user={user} apiUrl={apiUrl} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/groups/:groupId"
              element={<Groups token={token} user={user} />}
            />

            <Route
              path="/grades"
              element={
                token ? (
                  <Grades token={token} user={user} apiUrl={apiUrl} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/profile/:id"
              element={
                token ? (
                  <Profile token={token} user={user} apiUrl={apiUrl} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/profile/:id/settings"
              element={
                token ? (
                  <Settings
                    token={token}
                    user={user}
                    apiUrl={apiUrl}
                    theme={theme}
                    setTheme={setTheme}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/news"
              element={
                token ? (
                  <MainPage token={token} user={user} apiUrl={apiUrl} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/grades/:studentId"
              element={
                token ? (
                  <GradesByStudent token={token} user={user} apiUrl={apiUrl} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/homework"
              element={
                token ? (
                  <HomeworkPage token={token} user={user} apiUrl={apiUrl} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/homework/:id"
              element={
                token ? (
                  <HomeworkItemPage token={token} user={user} apiUrl={apiUrl} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/dashboard"
              element={
                token ? (
                  <Dashboard token={token} user={user} apiUrl={apiUrl} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </main>
      </div>
      <ToastContainer />
    </>
  );
}

export default App;
