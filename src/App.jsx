import React, { useState } from "react";
import {
  BrowserRouter as Router,
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
import "./App.css";

//const apiUrl = process.env.REACT_APP_API_URL;
const apiUrl = "https://mk1-schedule-backend-ff28aedc0b67.herokuapp.com";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
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
  };

  return (
    <Router basename="/schedule-frontend">
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
                token ? (
                  <Navigate to="/groups" />
                ) : (
                  <Login onLogin={handleLogin} />
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
              path="/profile"
              element={
                token ? (
                  <Profile token={token} user={user} apiUrl={apiUrl} />
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
