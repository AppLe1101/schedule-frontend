import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./styles/SearchBar.css";

const SearchBar = ({ token, apiUrl, user }) => {
  const [searchType, setSearchType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

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
        placeholder="Поиск..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <button onClick={handleSearch}>Найти</button>

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
                  <Link to={`/groups/${result._id}`}>
                    <p>🏫 {result.name}</p>
                  </Link>
                ) : result.type === "homework" ? (
                  <Link
                    to={
                      user.role === "student"
                        ? `/homework?highlight=${result._id}`
                        : `/homework?highlight=${result._id}`
                    }
                  >
                    <p>
                      📘 {result.subject} —{" "}
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
