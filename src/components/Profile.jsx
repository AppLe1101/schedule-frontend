// 🛡️ Project: LearningPortal
// 📅 Created: 2025
// 👤 Author: Dmitriy P.A.
// 🔒 Proprietary Code – do not copy without permission.

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import Loading from "./Loading";
//import DefaultAvatar from "./icons/default-avatar.png";
import { toast } from "react-toastify";
import { Star, Settings, BadgeCheck, Plus, PencilLine } from "lucide-react";
import ReportModal from "./ReportModal";
import CommentSection from "./CommentSection";
import TiptapEditor from "./TiptapEditor";
import DescriptionRenderer from "./DescriptionRenderer";
import DetailedProfileView from "./DetailedProfileView";
import TooltipWrapper from "./TooltipWrapper";
import PremiumModal from "./PremiumModal";
import { shorterName } from "./utils/shorterName";
import { motion, AnimatePresence } from "framer-motion";
import "./styles/Profile.css";

const Profile = ({ user, token, apiUrl }) => {
  const { id } = useParams();
  const enableAnimations = !user?.enableAnimations;
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const fileInputRef = useRef(null);
  const [rating, setRating] = useState(null);
  const [allBadges, setAllBadges] = useState([]);
  const [showBadgePicker, setShowBadgePicker] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const navigate = useNavigate();
  const isSelf = user?._id === id;
  const ownedBadges = allBadges.filter((b) => profile.badges?.includes(b._id));
  const location = useLocation();
  const tab = new URLSearchParams(location.search).get("tab") || "profile";

  useEffect(() => {
    setLoading(true);
    //setProfile(null);
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

        //setAvatarUrl(
        //  avatarUrl ||
        //    "https://res.cloudinary.com/dbw9zoxts/image/upload/v1743674361/avatars/nufw7lvuhkqy9jgjorbv.png"
        //);

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
        }

        //if (profile.description) {
        //  setNewDescription(profile.description);
        //}

        const badgesRes = await axios.get(`${apiUrl}/api/badges`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllBadges(badgesRes.data);

        if (res.data.role === "student" && res.data.groupId) {
          const detailsRes = await axios.get(
            `${apiUrl}/api/groups/${res.data.groupId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setProfile((prev) => ({
            ...prev,
            direction: detailsRes.data.direction,
            course: detailsRes.data.course,
            groupName: detailsRes.data.name,
            curator: detailsRes.data.curator,
          }));
        }
      } catch (err) {
        console.error("Ошибка при загрузке профиля:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, apiUrl, token]);

  useEffect(() => {
    setAvatarUrl(
      avatarUrl ||
        "https://res.cloudinary.com/dbw9zoxts/image/upload/v1743674361/avatars/nufw7lvuhkqy9jgjorbv.png"
    );
  }, [user]);

  useEffect(() => {
    if (profile?.description) {
      setNewDescription(profile.description);
    }
  }, [profile?.description]);

  useEffect(() => {
    if (!isSelf && tab === "details") {
      navigate(`/profile/${id}?tab=profile`);
    }
  }, [isSelf, tab, navigate, id]);

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
      localStorage.setItem("user", JSON.stringify({ ...user }));
    } catch (err) {
      console.error("Ошибка при загрузке аватара:", err);
    }
  };

  const handleReportSend = async (targetId, message) => {
    try {
      await axios.post(
        `${apiUrl}/api/reports`,
        {
          targetId,
          message,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Жалоба отправлена");
    } catch (err) {
      toast.error("Ошибка при отправке жалобы");
    }
  };

  const toggleBadge = (badge) => {
    let updated = [...(profile.visibleBadges || [])];

    // Убедимся, что там только строки
    updated = updated.filter((id) => typeof id === "string");

    if (updated.includes(badge._id)) {
      updated = updated.filter((id) => id !== badge._id);
    } else if (updated.length < 5) {
      updated.push(badge._id); // Только ID
    }

    setProfile((prev) => ({
      ...prev,
      visibleBadges: updated,
    }));
  };

  const saveVisibleBadges = async () => {
    try {
      const ids = profile.visibleBadges.filter((id) => typeof id === "string");
      await axios.put(
        `${apiUrl}/api/users/${user._id}/update-visible-badges`,
        { visibleBadges: ids },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Значки обновлены!");
      setShowBadgePicker(false);
    } catch (err) {
      console.error("Ошибка обновления значков", err);
      toast.error("Ошибка при сохранении значков");
    }
  };

  const saveDescription = async () => {
    try {
      await axios.put(
        `${apiUrl}/api/users/${user._id}/update-description`,
        { description: newDescription },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile((p) => ({ ...p, description: newDescription }));
      setEditingDescription(false);
      toast.success("Описание обновлено!");
    } catch (err) {
      toast.error("Ошибка при обновлении описания");
      console.error("Ошибка:", err);
    }
  };

  if (loading || !profile) return <Loading className="profile-loading" />;
  if (!profile)
    return <div className="profile-not-found">Профиль не найден</div>;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="user-profile"
    >
      <button onClick={() => navigate(-1)} className="back-button">
        ← Назад
      </button>
      {isSelf && (
        <div className="profile-tabs">
          <button
            className={`profile-tab-button ${
              tab === "profile" ? "active" : ""
            }`}
            onClick={() => navigate(`/profile/${id}?tab=profile`)}
          >
            Профиль
          </button>
          <button
            className={`details-tab-button ${
              tab === "details" ? "active" : ""
            }`}
            onClick={() => navigate(`/profile/${id}?tab=details`)}
          >
            Подробно
          </button>
          <Link to={"/premium"} className="premium-link">
            Премиум
          </Link>
        </div>
      )}
      <AnimatePresence mode="wait">
        {tab === "details" ? (
          <motion.div
            key={tab}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <DetailedProfileView profile={profile} groupName={groupName} />
          </motion.div>
        ) : (
          <motion.div
            key={tab}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
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
                  <TooltipWrapper label={profile.username}>
                    {shorterName(profile.username)}
                  </TooltipWrapper>
                  {profile._id === "67ab1aa0af53f6eca8443d6e" && (
                    <BadgeCheck
                      color="#faa307"
                      height={"20px"}
                      style={{ transform: "translateY(5px)" }}
                    />
                  )}
                  {isSelf && <span className="self-label">(вы)</span>}{" "}
                </div>
                <div className="badge-list-profile">
                  {(profile.visibleBadges?.length > 0 || isSelf) && (
                    <div className="profile-badges">
                      {profile.visibleBadges
                        ?.map((id) => allBadges.find((b) => b._id === id))
                        .filter(Boolean)
                        .map((badge) => (
                          <div
                            key={badge._id}
                            className="profile-badge"
                            title={badge.name}
                          >
                            <img src={badge.icon} alt={badge.name} />
                          </div>
                        ))}
                      {isSelf && (
                        <div
                          className="profile-badge add-badge"
                          onClick={() => setShowBadgePicker(true)}
                          title="Выбрать значки"
                        >
                          <Plus color="gray" />
                        </div>
                      )}
                      {showBadgePicker && (
                        <div className="badge-picker">
                          <h4>Выберите до 5 значков</h4>
                          <div className="badge-options">
                            {ownedBadges.map((badge) => {
                              const isSelected =
                                profile.visibleBadges?.includes(badge._id);
                              return (
                                <div
                                  key={badge._id}
                                  className={`badge-option ${
                                    isSelected ? "selected" : ""
                                  }`}
                                  onClick={() => toggleBadge(badge)}
                                >
                                  <img src={badge.icon} alt={badge.name} />
                                </div>
                              );
                            })}
                          </div>
                          <div className="badge-picker-button-container">
                            <button onClick={saveVisibleBadges}>
                              💾 Сохранить
                            </button>
                            <button onClick={() => setShowBadgePicker(false)}>
                              ✖ Закрыть
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p>
                  <small>
                    <strong>ID:</strong> {profile.uuid}
                  </small>
                </p>
                <p>
                  <strong>Статус:</strong>{" "}
                  {profile.role === "student"
                    ? "Ученик"
                    : profile.role === "teacher"
                    ? "Преподаватель"
                    : profile.role === "director"
                    ? "Директор"
                    : profile.role === "admin" && "Администратор"}
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
                      <div
                        className="stars"
                        style={{ transform: "translateY(3px)" }}
                      >
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
                      <div
                        className="stars"
                        style={{ transform: "translateY(3px)" }}
                      >
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            <Star color="#00b4d8" fill="#48cae4" />
                          </span>
                        ))}
                      </div>
                    )
                  ) : (
                    <div
                      className="stars"
                      style={{ transform: "translateY(3px)" }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          <Star color="#c9184a" fill="#ff4d6d" />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {isSelf && (
                  <TooltipWrapper label={"Настройки"}>
                    <Link
                      to={`/profile/settings`}
                      style={{
                        textDecoration: "none",
                        color: "black",
                        cursor: "pointer",
                      }}
                    >
                      <Settings />
                    </Link>
                  </TooltipWrapper>
                )}
                {!isSelf && (
                  <button onClick={() => setIsReportOpen(true)}>Репорт</button>
                )}
              </div>
            </div>
            {isReportOpen && (
              <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                onSubmit={handleReportSend}
                targetId={profile._id}
              />
            )}
            <div className="description-container">
              <div className="description-header">
                <h3>О себе</h3>
                {isSelf && !editingDescription && (
                  <button
                    onClick={() => setEditingDescription(true)}
                    className="description-edit-button"
                    title="Редактировать описание"
                  >
                    <PencilLine height={"20px"} width={"20px"} />
                  </button>
                )}
              </div>

              {editingDescription ? (
                isSelf && (
                  <>
                    <TiptapEditor
                      apiUrl={apiUrl}
                      token={token}
                      initialContent={profile.description}
                      onChange={(html) => setNewDescription(html)}
                    />
                    <div className="desc-buttons">
                      <button onClick={saveDescription}>💾 Сохранить</button>
                      <button onClick={() => setEditingDescription(false)}>
                        ✖ Отмена
                      </button>
                    </div>
                  </>
                )
              ) : profile.description ? (
                <div className="profile-description">
                  <DescriptionRenderer content={profile.description} />
                </div>
              ) : (
                <div className="no-description">
                  {isSelf ? "Описание не добавлено." : "Описание отсутствует."}
                </div>
              )}
            </div>

            {profile.allowComments && (
              <CommentSection
                apiUrl={apiUrl}
                token={token}
                targetUserId={profile._id}
                currentUser={user}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
