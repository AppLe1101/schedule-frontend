import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Profile = ({ user, token, apiUrl }) => {
  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroupAndStudents = async () => {
      try {
        // Убедимся, что есть groupId
        if (user.role === "teacher" && user.groupId) {
          const groupId = user.groupId;

          const groupRes = await axios.get(`${apiUrl}/api/groups/${groupId}`);
          setGroup(groupRes.data);

          const studentsRes = await axios.get(
            `${apiUrl}/api/groups/${groupId}/students`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setStudents(studentsRes.data);
        }
      } catch (err) {
        console.error("Ошибка при загрузке группы или учеников:", err);
      } finally {
        setLoading(false);
      }
    };

    loadGroupAndStudents();
  }, [user, apiUrl, token]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Профиль</h2>
      <p>
        <strong>Имя:</strong> {user.username}
      </p>
      <p>
        <strong>Роль:</strong> {user.role}
      </p>

      {user.role === "teacher" && (
        <>
          <h3>Ваша группа</h3>
          {loading ? (
            <p>Загрузка...</p>
          ) : group ? (
            <>
              <p>
                <strong>Название:</strong> {group.name}
              </p>
              <h4>Ученики:</h4>
              <ul>
                {students.length > 0 ? (
                  students.map((student) => (
                    <li key={student._id}>
                      {student.username} —{" "}
                      <Link to={`/grades/${student._id}`}>Открыть дневник</Link>
                    </li>
                  ))
                ) : (
                  <p>Ученики не найдены</p>
                )}
              </ul>
            </>
          ) : (
            <p>Группа не найдена</p>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;
