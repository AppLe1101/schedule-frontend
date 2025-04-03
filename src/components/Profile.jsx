import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "./Loading";
//import DefaultAvatar from "./icons/default-avatar.png";
import "./styles/Profile.css";

const Profile = ({ user, token, apiUrl }) => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const isSelf = user?._id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);

        if (res.data.role === "student" && res.data.groupId) {
          const groupRes = await axios.get(
            `${apiUrl}/api/groups/${res.data.groupId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setGroupName(groupRes.data.name);
        }
      } catch (err) {
        console.error("Ошибка при загрузке профиля:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, apiUrl, token]);

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const uploadRes = await axios.post(
        `${apiUrl}/api/users/upload-avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newAvatarUrl = uploadRes.data.url;
      await axios.patch(
        `${apiUrl}/api/users/avatar`,
        { avatarUrl: newAvatarUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      user.avatar = newAvatarUrl;
    } catch (err) {
      console.error("Ошибка при загрузке аватара:", err);
    }
  };
  useEffect(() => {
    setAvatarUrl(user?.avatar || "");
  }, [user]);

  if (loading) return <Loading className="profile-loading" />;
  if (!profile)
    return <div className="profile-not-found">Профиль не найден</div>;

  return (
    <div style={{ padding: "20px" }} className="user-profile">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Назад
      </button>
      <div className="profile-card">
        <div className="profile-avatar">
          <img
            src={avatarUrl || "/default-avatar.png"}
            alt="Аватар профиля"
            onClick={handleAvatarClick}
            className="avatar-img"
            style={{ cursor: "pointer" }}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </div>
        <div className="profile-info">
          <div className="profile-name">
            {profile.username}{" "}
            {isSelf && <span className="self-label">(вы)</span>}{" "}
          </div>
          <p>
            <small>
              <strong>ID:</strong> {profile._id}
            </small>
          </p>
          <p>
            <strong>Статус:</strong>{" "}
            {profile.role === "student"
              ? "Ученик"
              : profile.role === "teacher"
              ? "Преподаватель"
              : "Директор"}
          </p>
          {profile.role === "student" && (
            <p>
              <strong>Группа:</strong> {groupName || "—"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
