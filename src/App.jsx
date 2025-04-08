import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Route,
  Routes,
  Navigate,
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
import "./components/utils/axiosSetup";
import "./App.css";

//const apiUrl = process.env.REACT_APP_API_URL;
const apiUrl = "https://mk1-schedule-backend-ff28aedc0b67.herokuapp.com";

function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");
  const [user, setUser] = useState(
    JSON.parse(sessionStorage.getItem("user")) || null
  );

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("user"));
    const token = sessionStorage.getItem("token");

    if (userData && token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        if (decoded.exp * 1000 < Date.now()) {
          handleLogout();
          window.location.href = "/login";
          throw new Error("Token expired");
        }
      } catch (e) {
        handleLogout();
        window.location.href = "/login";
        throw new Error("Invalid token");
      }
    }
  }, []);

  const handleLogin = (token, userData) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  };

  return (
    <Router>
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
              path="/"
              element={<Navigate to={token ? "/groups" : "/login"} />}
            />

            <Route
              path="/login"
              element={
                token && user ? (
                  <Navigate to="/groups" />
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
                  <Settings token={token} user={user} apiUrl={apiUrl} />
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
