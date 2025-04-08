import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import Loading from "./Loading";
//import DefaultAvatar from "./icons/default-avatar.png";
import { Star, Settings } from "lucide-react";
import "./styles/Profile.css";

const Profile = ({ user, token, apiUrl }) => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const fileInputRef = useRef(null);
  const [rating, setRating] = useState(null);
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
          setAvatarUrl(res.data.avatar);
        }
        const ratingRes = await axios.post(
          `${apiUrl}/api/users/${id}/update-rating`,
          null,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (ratingRes.data.rating !== undefined) {
          setRating(ratingRes.data.rating);
          console.log("Рейтинг:", ratingRes.data.rating);
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
      setAvatarUrl(newAvatarUrl);
      sessionStorage.setItem("user", JSON.stringify({ ...user }));
    } catch (err) {
      console.error("Ошибка при загрузке аватара:", err);
    }
  };
  useEffect(() => {
    setAvatarUrl(
      avatarUrl ||
        "https://res.cloudinary.com/dbw9zoxts/image/upload/v1743674361/avatars/nufw7lvuhkqy9jgjorbv.png"
    );
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
          {isSelf ? (
            <div>
              <img
                src={
                  avatarUrl ||
                  "https://res.cloudinary.com/dbw9zoxts/image/upload/v1743674361/avatars/nufw7lvuhkqy9jgjorbv.png"
                }
                alt="Аватар профиля"
                onClick={handleAvatarClick}
                className="avatar-img self"
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
          ) : (
            <img
              src={
                profile.avatar ||
                "https://res.cloudinary.com/dbw9zoxts/image/upload/v1743674361/avatars/nufw7lvuhkqy9jgjorbv.png"
              }
              alt="Аватар профиля"
              className="avatar-img"
            />
          )}
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
          <div className="profile-rating">
            <p>Рейтинг:</p>
            {profile._id !== "67ab1aa0af53f6eca8443d6e" ? (
              profile.role === "student" ? (
                <div className="stars" style={{ transform: "translateY(3px)" }}>
                  {[...Array(5)].map((_, i) => {
                    const full = i + 1 <= rating;
                    const half = i + 0.5 === rating;

                    return (
                      <span key={i}>
                        {full ? (
                          <Star
                            className="text-yellow-400 w-5 h-5"
                            color="#faa307"
                            fill="#ffba08"
                          />
                        ) : half ? (
                          <Star
                            className="text-yellow-400 w-5 h-5 opacity-50"
                            color="#faa307"
                            fill="#ffba08"
                            opacity="50%"
                          />
                        ) : (
                          <Star
                            className="text-gray-300 w-5 h-5"
                            color="gray"
                          />
                        )}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="stars" style={{ transform: "translateY(3px)" }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>
                      <Star color="#00b4d8" fill="#48cae4" />
                    </span>
                  ))}
                </div>
              )
            ) : (
              <div className="stars" style={{ transform: "translateY(3px)" }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    <Star color="#c9184a" fill="#ff4d6d" />
                  </span>
                ))}
              </div>
            )}
          </div>
          {isSelf && (
            <Link
              to={`/profile/${user._id}/settings`}
              style={{
                textDecoration: "none",
                color: "black",
                cursor: "pointer",
              }}
            >
              <Settings />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
