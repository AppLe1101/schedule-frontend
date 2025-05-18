// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search } from "lucide-react";
import "./styles/SearchBar.css";

const placeholderVariants = [
  "Поиск...",
  "Иван Иванов",
  "32-П",
  "Математика 16.05.25",
  "log(5)25",
  "Новости колледжа",
  "user123",
];

const SearchBar = ({ token, apiUrl, user }) => {
  const [searchType, setSearchType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const [placeholder, setPlaceholder] = useState("");
  const [variantIndex, setVariantIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (searchQuery) return;

    const currentText = placeholderVariants[variantIndex];

    if (searchType !== "all") {
      switch (searchType) {
        case "users":
          setPlaceholder("Иванов Иван");
          break;
        case "news":
          setPlaceholder("Новости колледжа");
          break;
        case "groups":
          setPlaceholder("12-П");
          break;
        case "homework":
          setPlaceholder("Математика 16.05.25");
          break;
        default:
          setPlaceholder("Поиск...");
          break;
      }
      return;
    }

    if (pause) {
      const pauseTimeout = setTimeout(() => setPause(false), 1000);
      return () => clearTimeout(pauseTimeout);
    }

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setPlaceholder(currentText.slice(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);

          if (charIndex + 1 === currentText.length) {
            setPause(true);
            setIsDeleting(true);
          }
        } else {
          setPlaceholder(currentText.slice(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);

          if (charIndex - 1 === 0) {
            setIsDeleting(false);
            setVariantIndex((prev) => (prev + 1) % placeholderVariants.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, variantIndex, pause, searchQuery, searchType]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const query = encodeURIComponent(searchQuery.trim());
    try {
      let endpoint = "";
      switch (searchType) {
        case "users":
          endpoint = `${apiUrl}/api/users/search?query=${query}`;
          break;
        case "news":
          endpoint = `${apiUrl}/api/news/search?query=${query}`;
          break;
        case "groups":
          endpoint = `${apiUrl}/api/groups/search?query=${query}`;
          break;
        case "homework":
          endpoint = `${apiUrl}/api/homework/search?query=${query}`;
          break;
        default:
          endpoint = `${apiUrl}/api/search?query=${query}`;
      }

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (searchType === "all") {
        const { users, news, groups, homework } = res.data;
        const combined = [
          ...users.map((u) => ({ ...u, type: "user" })),
          ...news.map((n) => ({ ...n, type: "news" })),
          ...groups.map((g) => ({ ...g, type: "group" })),
          ...homework.map((h) => ({ ...h, type: "homework" })),
        ];
        setSearchResults(combined);
      } else {
        const typedData = res.data.map((item) => ({
          ...item,
          type:
            searchType === "users"
              ? "user"
              : searchType === "news"
              ? "news"
              : searchType === "groups"
              ? "group"
              : searchType === "homework"
              ? "homework"
              : "unknown",
        }));
        setSearchResults(typedData);
      }
    } catch (err) {
      console.error("Error searching:", err);
    }
  };

  return (
    <div className="search-bar-container">
      <div
        className="search-filter"
        onClick={() => setShowFilterOptions(!showFilterOptions)}
      >
        {searchType === "all" && "Всё"}
        {searchType === "users" && "Люди"}
        {searchType === "news" && "Новости"}
        {searchType === "groups" && "Группы"}
        {searchType === "homework" && "ДЗ"}
        <span className="arrow">▾</span>
        {showFilterOptions && (
          <div className="filter-dropdown">
            <div onClick={() => setSearchType("all")}>Всё</div>
            <div onClick={() => setSearchType("users")}>Люди</div>
            <div onClick={() => setSearchType("news")}>Новости</div>
            <div onClick={() => setSearchType("groups")}>Группы</div>
            <div onClick={() => setSearchType("homework")}>ДЗ</div>
          </div>
        )}
      </div>

      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <button onClick={handleSearch} style={{ padding: "9px 10px" }}>
        <Search color="black" height={"15px"} />
      </button>

      <div
        className="clear-button"
        onClick={() => {
          setSearchQuery("");
          setSearchResults([]);
        }}
      >
        Очистить
      </div>

      {searchResults && searchResults.length > 0 && (
        <div className="search-results-count">
          Найдено: <span>{searchResults.length}</span> результатов
          <div className="search-results">
            {searchResults.map((result) => (
              <div key={result._id} className="search-result-item">
                {/* В зависимости от типа результата */}

                {result.type === "user" ? (
                  <Link to={`/profile/${result._id}`}>
                    <p className="search-result-item-link">
                      👤 {result.username}
                    </p>
                  </Link>
                ) : result.type === "news" ? (
                  <Link to={`/news?highlight=${result._id}`}>
                    📰 {result.title}
                  </Link>
                ) : result.type === "group" ? (
                  <Link to={`/groups?highlight=${result._id}`}>
                    <p>🏫 {result.name}</p>
                  </Link>
                ) : result.type === "homework" ? (
                  <Link
                    to={
                      user.role === "student"
                        ? `/homework/${result._id}`
                        : `/homework/${result._id}`
                    }
                  >
                    <p>
                      📘 {result.subject?.name} —{" "}
                      {new Date(result.date).toLocaleDateString()}
                    </p>
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
