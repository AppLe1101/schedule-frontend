// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import GradesByStudent from "./GradesByStudent";
import GradesBySubject from "./GradesBySubject";
import GradebookBySubject from "./GradebookBySubject";
import GradebookByStudent from "./GradebookByStudent";
import "./styles/Grades.css";

const Grades = ({ user, token, apiUrl }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  //const [students, setStudents] = useState([]);
  //const [selectedStudent, setSelectedStudent] = useState(null);
  const [subjects, setSubjects] = useState({});
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [showSubjectInputFor, setShowSubjectInputFor] = useState(null);
  //const [editingGroupId, setEditingGroupId] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  //const [selectedStudentToAdd, setSelectedStudentToAdd] = useState("");
  const [activeTab, setActiveTab] = useState("grades");
  const [selectedTeacherToAdd, setSelectedTeacherToAdd] = useState("");
  const [groupMembers, setGroupMembers] = useState({});

  useEffect(() => {
    if (user.role === "teacher") {
      axios
        .get(`${apiUrl}/api/groups/teacher/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setGroups(res.data))
        .catch((err) => console.error("Ошибка при загрузке групп:", err));
    } else if (user.role === "director") {
      axios
        .get(`${apiUrl}/api/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setGroups(res.data))
        .catch((err) => console.error("Ошибка при загрузке всех групп:", err));
    }
  }, [user, apiUrl, token]);

  const fetchGroupMembers = async (groupId) => {
    try {
      const res = await axios.get(`${apiUrl}/api/groups/${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroupMembers((prev) => ({ ...prev, [groupId]: res.data }));
    } catch (err) {
      console.error("Ошибка при загрузке участников группы:", err);
    }
  };

  const handleGroupClick = async (groupId) => {
    if (selectedGroup === groupId) {
      setSelectedGroup(null);
      setSelectedSubject(null);
      return;
    }

    setSelectedGroup(groupId);
    setSelectedSubject(null);

    try {
      const subjectRes = await axios.get(`${apiUrl}/api/subjects/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubjects((prev) => ({
        ...prev,
        [groupId]: subjectRes.data,
      }));

      if (user.role === "director") {
        fetchGroupMembers(groupId);
        fetchAvailableUsers();
      }
    } catch (err) {
      console.error("Ошибка при загрузке предметов группы:", err);
    }
  };

  const handleCreateSubject = async (groupId) => {
    if (!newSubjectName.trim()) return;

    try {
      await axios.post(
        `${apiUrl}/api/subjects`,
        {
          name: newSubjectName,
          groupId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const res = await axios.get(`${apiUrl}/api/subjects/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubjects((prev) => ({ ...prev, [groupId]: res.data }));
      setNewSubjectName("");
      setShowSubjectInputFor(null);
    } catch (err) {
      console.error("Ошибка при создании предмета:", err);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        axios.get(`${apiUrl}/api/users?role=student`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/api/users?role=teacher`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setAvailableStudents(studentsRes.data);
      setAvailableTeachers(teachersRes.data);
    } catch (err) {
      console.error("Ошибка при загрузке доступных пользователей:", err);
    }
  };

  const addUserToGroup = async (groupId, userId, role) => {
    try {
      await axios.put(
        `${apiUrl}/api/groups/${groupId}/add-${role}`,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchGroupMembers(groupId);
      alert(`${role === "student" ? "Ученик" : "Преподаватель"} добавлен`);
    } catch (err) {
      console.error("Ошибка при добавлении пользователя в группу:", err);
    }
  };

  const removeUserFromGroup = async (groupId, userId, role) => {
    try {
      await axios.put(
        `${apiUrl}/api/groups/${groupId}/remove-${role}`,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchGroupMembers(groupId);
    } catch (err) {
      console.error("Ошибка при удалении пользователя из группы:", err);
    }
  };

  if (user.role === "student") {
    return (
      <>
        <GradesByStudent
          studentId={user._id}
          user={user}
          token={token}
          apiUrl={apiUrl}
          subjects={subjects}
        />
        <GradebookByStudent
          studentId={user._id}
          studentName={user.username}
          apiUrl={apiUrl}
          token={token}
        />
      </>
    );
  }

  return (
    <div className="grades-container">
      <h2>Журнал</h2>
      {groups.map((group) => {
        const members = groupMembers[group._id] || {
          students: [],
          teachers: [],
        };
        const currentTeacherIds = members.teachers.map((t) => t._id);

        return (
          <div key={group._id} className="group-card">
            <div
              onClick={() => handleGroupClick(group._id)}
              style={{
                cursor: "pointer",
                padding: "8px",
                borderRadius: "5px",
              }}
            >
              {group.name}
            </div>

            {selectedGroup === group._id && (
              <div className="group-members">
                {/* Предметы */}
                <div className="group-item">
                  <h4>Предметы</h4>
                  <div className="subject-items">
                    {subjects[group._id]?.map((subject) => (
                      <div key={subject._id} className="subject-item">
                        <span
                          onClick={() => setSelectedSubject(subject)}
                          style={{ cursor: "pointer" }}
                        >
                          📚 {subject.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  {showSubjectInputFor === group._id ? (
                    <div style={{ marginTop: "10px" }}>
                      <input
                        type="text"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        placeholder="Название предмета"
                        style={{ marginBottom: "5px" }}
                        className="subject-name-input"
                      />
                      <div>
                        <button onClick={() => handleCreateSubject(group._id)}>
                          Добавить
                        </button>
                        <button onClick={() => setShowSubjectInputFor(null)}>
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowSubjectInputFor(group._id)}>
                      ➕ Новый предмет
                    </button>
                  )}
                </div>

                {/* Преподаватели */}
                {user.role === "director" && (
                  <div className="group-item">
                    <h4>Преподаватели</h4>
                    {members.teachers.map((teacher) => (
                      <div key={teacher._id} className="member-item">
                        <Link
                          style={{ textDecoration: "none", color: "black" }}
                          to={`/profile/${teacher._id}`}
                        >
                          <span>👨‍🏫 {teacher.username}</span>
                        </Link>
                        <button
                          onClick={() =>
                            removeUserFromGroup(
                              group._id,
                              teacher._id,
                              "teacher"
                            )
                          }
                        >
                          ❌
                        </button>
                      </div>
                    ))}

                    <div style={{ display: "flex", gap: "10px" }}>
                      <select
                        value={selectedTeacherToAdd}
                        onChange={(e) =>
                          setSelectedTeacherToAdd(e.target.value)
                        }
                      >
                        <option value="">Выбрать преподавателя</option>
                        {availableTeachers
                          .filter((t) => !currentTeacherIds.includes(t._id))
                          .map((teacher) => (
                            <option key={teacher._id} value={teacher._id}>
                              {teacher.username}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={() =>
                          addUserToGroup(
                            group._id,
                            selectedTeacherToAdd,
                            "teacher"
                          )
                        }
                      >
                        Добавить преподавателя
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedSubject && selectedGroup === group._id && (
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => {
                    setSelectedSubject(null);
                  }}
                  className="close-grades-btn"
                >
                  Скрыть журнал
                </button>
                <div className="grade-tabs">
                  <button
                    className={`grades-tab-button ${
                      activeTab === "grades" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("grades")}
                  >
                    Оценки
                  </button>
                  <button
                    className={`gradebook-tab-button ${
                      activeTab === "gradebook" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("gradebook")}
                  >
                    Зачетная книжка
                  </button>
                </div>
                {activeTab === "grades" ? (
                  <GradesBySubject
                    subject={selectedSubject}
                    availableStudents={availableStudents}
                    fetchGroupMembers={() => fetchGroupMembers()}
                    groupId={group._id}
                    token={token}
                    user={user}
                    apiUrl={apiUrl}
                  />
                ) : (
                  <GradebookBySubject
                    apiUrl={apiUrl}
                    token={token}
                    subject={selectedSubject}
                    user={user}
                    groupId={group._id}
                    selectedGroup={selectedGroup}
                    groupName={group.name}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Grades;
