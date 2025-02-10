// src/components/Groups.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import GroupDetail from "./GroupDetail";
import { CSSTransition } from "react-transition-group";
import "./Groups.css";

function Groups({ token, user }) {
  const [groups, setGroups] = useState([]);
  const [expandedGroupId, setExpandedGroupId] = useState(null);

  useEffect(() => {
    axios
      .get("https://schedule-backend-production-ef03.up.railway.app/api/groups")
      .then((res) => setGroups(res.data))
      .catch((err) => console.error(err));
  }, []);

  const toggleGroup = (groupId) => {
    // Если группа уже раскрыта — закрываем, иначе открываем
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
    } else {
      setExpandedGroupId(groupId);
    }
  };

  return (
    <div className="groups-container">
      <div className="groups-list">
        <h2>Группы</h2>
        {groups.map((group) => (
          <div key={group._id} className="group-item">
            <div
              className="group-header"
              onClick={() => toggleGroup(group._id)}
            >
              {group.name}
              <span className="toggle-icon">
                {expandedGroupId === group._id ? "▲" : "▼"}
              </span>
            </div>
            {expandedGroupId === group._id && (
              <div className="group-details">
                <GroupDetail group={group} token={token} user={user} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Groups;
