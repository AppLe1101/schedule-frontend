// src/components/Groups.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import GroupDetail from "./GroupDetail";
import AddGroupPanel from "./AddGroupPanel";
import { CSSTransition } from "react-transition-group";
import { useSearchParams } from "react-router-dom";
import Loading from "./Loading";
import "./styles/Groups.css";
import { motion } from "framer-motion";

function Groups({ token, user, apiUrl }) {
  const [groups, setGroups] = useState([]);
  const [editing, setEditing] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [searchParams] = useSearchParams();
  const highlightGroupId = searchParams.get("highlight");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setGroups(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleGroup = (groupId) => {
    // Если группа уже раскрыта — закрываем, иначе открываем
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
    } else {
      setExpandedGroupId(groupId);
    }
  };

  useEffect(() => {
    if (highlightGroupId) {
      setExpandedGroupId(highlightGroupId);
      setTimeout(() => {
        const el = document.getElementById(`group-${highlightGroupId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("highlighted");
          setTimeout(() => {
            el.classList.remove("highlighted");
          }, 3000);
        }
      }, 300);
    }
  }, [highlightGroupId]);

  const handleGroupAdded = (newGroup) => {
    setGroups([...groups, newGroup]);
    setShowAddGroup(false);
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm("Вы уверенны что хотите удалить группу?")) {
      axios
        .delete(`${apiUrl}/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setGroups(groups.filter((group) => group._id !== groupId));
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <motion.div
      className="groups-container"
      initial={{ opacity: 1, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <h1 style={{ marginBottom: "15px" }}>Расписание занятий</h1>
      <div className="groups-list">
        <h2>Группы</h2>
        {loading && <Loading className="profile-loading" />}
        {groups.map((group, index) => (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              bounce: 0.5,
              delay: index * 0.1,
            }}
            key={group._id}
            className="group-item "
            id={`group-${group._id}`}
          >
            <div
              className="group-header"
              onClick={() => toggleGroup(group._id)}
            >
              {group.name}
              <span className="toggle-icon">
                {expandedGroupId === group._id ? " ▲" : " ▼"}
              </span>
              {user.role === "director" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // чтобы клик не раскрывал группу
                    handleDeleteGroup(group._id);
                  }}
                  className="delete-group-btn"
                >
                  {/* Можно использовать иконку вместо текста */}
                  Удалить
                </button>
              )}
            </div>
            {expandedGroupId === group._id && (
              <div className="group-details">
                <GroupDetail
                  group={group}
                  token={token}
                  user={user}
                  apiUrl={apiUrl}
                />
              </div>
            )}
          </motion.div>
        ))}

        {showAddGroup && (
          <AddGroupPanel
            token={token}
            user={user}
            onGroupAdded={handleGroupAdded}
          />
        )}

        {user.role === "director" && (
          <button onClick={() => setShowAddGroup(!showAddGroup)}>
            {showAddGroup ? "Отмена" : "Добавить"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default Groups;
