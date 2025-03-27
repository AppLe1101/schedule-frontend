import React, { useEffect, useState } from "react";
import axios from "axios";
import GradesByStudent from "./GradesByStudent";

const Grades = ({ user, token, apiUrl }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  const handleGroupClick = (groupId) => {
    if (selectedGroup === groupId) {
      setSelectedGroup(null);
      setStudents([]);
      return;
    }
    setSelectedGroup(groupId);
    axios
      .get(`${apiUrl}/api/groups/${groupId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStudents(res.data))
      .catch((err) => console.error("Ошибка при загрузке учеников:", err));
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
    <div>
      <h2>Журнал</h2>
      {groups.map((group) => (
        <div key={group._id} style={{ marginBottom: "10px" }}>
          <div
            onClick={() => handleGroupClick(group._id)}
            style={{
              cursor: "pointer",
              background: "#f0f0f0",
              padding: "8px",
              borderRadius: "5px",
            }}
          >
            {group.name}
            {user.role === "director" && (
              <button
                style={{ marginLeft: "10px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Открыть редактор группы (добавление учеников/учителей)
                }}
              >
                ✏️ Редактировать
              </button>
            )}
          </div>

          {selectedGroup === group._id && (
            <div style={{ marginTop: "8px", marginLeft: "15px" }}>
              {students.map((student) => (
                <div
                  key={student._id}
                  onClick={() => setSelectedStudent(student)}
                  style={{ cursor: "pointer", padding: "4px 0" }}
                >
                  👤 {student.username}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {selectedStudent && (
        <div style={{ marginTop: "20px" }}>
          <h3>Дневник ученика: {selectedStudent.username}</h3>
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
};

export default Grades;
