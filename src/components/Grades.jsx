import React, { useEffect, useState } from "react";
import axios from "axios";
import GradesByStudent from "./GradesByStudent";
import "./Grades.css";

const Grades = ({ user, token, apiUrl }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  //const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [editingGroupId, setEditingGroupId] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState("");
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
      return;
    }
    setSelectedGroup(groupId);
    if (user.role === "teacher") {
      try {
        const res = await axios.get(
          `${apiUrl}/api/groups/${groupId}/students`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setGroupMembers((prev) => ({
          ...prev,
          [groupId]: { students: res.data, teachers: [] },
        }));
      } catch (err) {
        console.error("Ошибка при загрузке учеников группы:", err);
      }
    } else if (user.role === "director") {
      fetchGroupMembers(groupId);
      fetchAvailableUsers();
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
      <GradesByStudent
        studentId={user._id}
        user={user}
        token={token}
        apiUrl={apiUrl}
      />
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
        const currentStudentIds = members.students.map((s) => s._id);
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
                {/* Ученики */}
                <div className="group-item">
                  <h4>Ученики</h4>
                  {members.students.map((student) => (
                    <div key={student._id} className="member-item">
                      <span
                        onClick={() => setSelectedStudent(student)}
                        style={{ cursor: "pointer" }}
                      >
                        👤 {student.username}
                      </span>
                      {user.role === "director" && (
                        <button
                          onClick={() =>
                            removeUserFromGroup(
                              group._id,
                              student._id,
                              "student"
                            )
                          }
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  ))}

                  {user.role === "director" && (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <select
                        value={selectedStudentToAdd}
                        onChange={(e) =>
                          setSelectedStudentToAdd(e.target.value)
                        }
                      >
                        <option value="">Выбрать ученика</option>
                        {availableStudents
                          .filter((s) => !currentStudentIds.includes(s._id))
                          .map((student) => (
                            <option key={student._id} value={student._id}>
                              {student.username}
                              {Array.isArray(student.groupId) &&
                              student.groupId.length > 0
                                ? " (в другой группе)"
                                : ""}
                            </option>
                          ))}
                      </select>

                      <button
                        disabled={
                          !selectedStudentToAdd ||
                          availableStudents.find(
                            (s) => s._id === selectedStudentToAdd
                          )?.groupId?.length > 0
                        }
                        onClick={() =>
                          addUserToGroup(
                            group._id,
                            selectedStudentToAdd,
                            "student"
                          )
                        }
                      >
                        Добавить ученика
                      </button>
                      {availableStudents.find(
                        (s) => s._id === selectedStudentToAdd
                      )?.groupId?.length > 0 && (
                        <p className="warning-text">
                          Этот ученик уже находится в другой группе.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Преподаватели */}
                {user.role === "director" && (
                  <div className="group-item">
                    <h4>Преподаватели</h4>
                    {members.teachers.map((teacher) => (
                      <div key={teacher._id} className="member-item">
                        <span>👨‍🏫 {teacher.username}</span>
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

            {selectedStudent && selectedGroup === group._id && (
              <div style={{ marginTop: "20px" }}>
                <GradesByStudent
                  studentId={selectedStudent._id}
                  token={token}
                  apiUrl={apiUrl}
                  user={user}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Grades;
