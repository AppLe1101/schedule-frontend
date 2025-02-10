import React, { useState } from "react";
import Login from "./components/Login";
import Groups from "./components/Groups";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const handleLogin = (token, userData) => {
    setToken(token);
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Расписание занятий</h1>
        {token && (
          <button className="logout-button" onClick={handleLogout}>
            Выход
          </button>
        )}
      </header>
      <main>
        {!token ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Groups token={token} user={user} />
        )}
      </main>
    </div>
  );
}

export default App;
