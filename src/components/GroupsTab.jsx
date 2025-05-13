// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useState, useEffect, useRef } from "react";
import Loading from "./Loading";
import axios from "axios";
import "./styles/Dashboard.css";
import { motion } from "framer-motion";

const GroupsTab = ({ apiUrl, token, user }) => {
  const groupRefs = useRef({});
  const [groupSearchTerm, setGroupSearchTerm] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [groups, setGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [form, setForm] = useState({
    direction: "",
    course: "",
    curator: "",
  });

  useEffect(() => {
    setLoading(true);
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(res.data);
      } catch (err) {
        console.error("Ошибка при загрузке групп:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [apiUrl, token]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!groupSearchTerm.trim()) {
        setFilteredGroups([]);
        return;
      }

      try {
        const res = await axios.get(
          `${apiUrl}/api/groups/search?query=${groupSearchTerm}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFilteredGroups(res.data);
      } catch (err) {
        console.error("Ошибка при поиске групп:", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [groupSearchTerm]);

  const startEdit = (group) => {
    setEditingGroup(group._id);
    setForm({
      direction: group.direction || "",
      course: group.course || "",
      curator: group.curator || "",
    });
  };

  const saveGroup = async () => {
    try {
      await axios.put(
        `${apiUrl}/api/groups/${editingGroup}/update-info`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditingGroup(null);
    } catch (err) {
      console.error("Ошибка при обновлении группы:", err);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="groups-tab">
      <div className="groups-tab-header">
        <h2>Группы</h2>
        <p className="groups-count">Групп: {groups.length}</p>
        <div className="group-search-container">
          <input
            type="text"
            placeholder="Поиск группы..."
            className="group-search-input"
            value={groupSearchTerm}
            onChange={(e) => setGroupSearchTerm(e.target.value)}
          />
          {filteredGroups.length > 0 && (
            <ul className="group-search-results">
              {filteredGroups.map((group) => (
                <motion.li
                  key={group._id}
                  onClick={() => {
                    const element = groupRefs.current[group._id];
                    if (element) {
                      element.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                      element.classList.add("highlighted");
                      setTimeout(
                        () => element.classList.remove("highlighted"),
                        2000
                      );
                    }
                    setFilteredGroups([]);
                    setGroupSearchTerm("");
                  }}
                >
                  {group.name}
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {groups.map((group, index) => (
        <motion.div
          key={group._id}
          className="group-card"
          ref={(el) => (groupRefs.current[group._id] = el)}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
            bounce: 0.5,
            delay: index * 0.1,
          }}
        >
          <h4>{group.name}</h4>
          {editingGroup === group._id ? (
            <>
              <input
                type="text"
                placeholder="Направление"
                value={form.direction}
                onChange={(e) =>
                  setForm((f) => ({ ...f, direction: e.target.value }))
                }
                className="group-direction-input"
              />
              <input
                type="text"
                placeholder="Курс"
                value={form.course}
                onChange={(e) =>
                  setForm((f) => ({ ...f, course: e.target.value }))
                }
                className="group-course-input"
              />
              <input
                type="text"
                placeholder="Поиск куратора..."
                value={searchTerm}
                onChange={async (e) => {
                  const value = e.target.value;
                  setSearchTerm(value);

                  try {
                    const res = await axios.get(
                      `${apiUrl}/api/users/search?query=${value}`,
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    setSearchResults(
                      res.data.filter((u) =>
                        ["teacher", "admin"].includes(u.role)
                      )
                    );
                  } catch (err) {
                    console.error("Ошибка поиска:", err);
                  }
                }}
                className="group-curator-input"
              />

              <ul className="curator-search-results">
                {searchResults.map((user) => (
                  <li
                    key={user._id}
                    onClick={() => {
                      setForm((f) => ({ ...f, curator: user._id }));
                      setSearchTerm(user.username);
                      setSearchResults([]);
                    }}
                  >
                    {user.username}
                  </li>
                ))}
              </ul>
              <button onClick={saveGroup}>💾 Сохранить</button>
            </>
          ) : (
            <div className="group-details-container">
              <p className="group-direction">
                Направление: {group.direction || "-"}
              </p>
              <p className="group-course">Курс: {group.course || "-"}</p>
              <p className="group-curator">
                Куратор: {group.curator?.username || "-"}
              </p>
              <button className="group-save" onClick={() => startEdit(group)}>
                ✏️ Редактировать
              </button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default GroupsTab;
