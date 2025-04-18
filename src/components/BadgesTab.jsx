import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "./styles/BadgesTab.css";

const BadgesTab = ({ user, apiUrl, token }) => {
  const [badges, setBadges] = useState([]);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [username, setUsername] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", icon: "" });
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/badges`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBadges(res.data);
      } catch (err) {
        console.error("Ошибка пот загрузке значков", err);
      }
    };
    fetchBadges();
  }, [apiUrl, token]);

  useEffect(() => {
    if (!selectedBadge) return;

    const selected = document.querySelector(".badge-item.selected");
    if (selected) {
      const rect = selected.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      setMenuPosition({
        top: rect.top + scrollTop - 20,
        left: rect.left + scrollLeft + rect.width / 2,
      });
    }
  }, [selectedBadge]);

  const handleCreateBadge = async () => {
    const { name, description, icon, dominantColor } = form;

    if (!name || !icon) {
      toast.error("Название и иконка обязательны");
      return;
    }

    try {
      const res = await axios.post(
        `${apiUrl}/api/badges`,
        {
          name,
          description,
          icon,
          dominantColor,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBadges((prev) => [...prev, res.data]);
      setForm({ name: "", description: "", icon: "", dominantColor: "" });
      console.log("После создания:", form);
      setSelectedBadge(null);
      toast.success("🎉 Бейдж создан!");
    } catch (err) {
      toast.error("Ошибка при создании бейджа");
      console.error("Ошибка при создании бейджа", err);
    }
  };

  const handleGrantBadge = async (userId) => {
    if (!username || !selectedBadge) {
      toast.error("Укажите имя");
      return;
    }

    try {
      const res = await axios.get(
        `${apiUrl}/api/users/search?query=${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = res.data.find((u) => u.username === username);
      if (!user) {
        toast.error("Пользователь не найден");
        return;
      }

      await axios.put(
        `${apiUrl}/api/users/${user._id}/give-badge`,
        { badgeId: selectedBadge._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`🎉 Значок «${selectedBadge.name}» выдан ${user.username}`);
      setUsername("");
    } catch (err) {
      console.error("Ошибка при выдаче значка", err);
      toast.error("Ошибка при выдаче значка");
    }
  };

  const handleDeleteBadge = async () => {
    if (!selectedBadge) return;
    const confirmDelete = window.confirm(
      "Вы уверены, что хотите удалить этот бейдж?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${apiUrl}/api/badges/${selectedBadge._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBadges(badges.filter((b) => b._id !== selectedBadge._id));
      setSelectedBadge(null);
      toast.success("Значок удалён!");
    } catch (err) {
      console.error("Ошибка при удалении бейджа:", err);
      toast.error("Ошибка при удалении");
    }
  };

  const handleEditBadge = async () => {
    if (!selectedBadge || !editForm.name.trim()) return;

    try {
      const res = await axios.put(
        `${apiUrl}/api/badges/${selectedBadge._id}`,
        {
          name: editForm.name,
          description: editForm.description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updated = res.data;
      setBadges((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b))
      );
      setSelectedBadge(updated);
      setEditing(false);
      toast.success("Значок обновлён!");
    } catch (err) {
      console.error("Ошибка при редактировании бейджа:", err);
      toast.error("Ошибка при сохранении изменений");
    }
  };

  const handleUserSearch = async (query) => {
    if (!query.trim()) return setSearchResults([]);
    try {
      const res = await axios.get(`${apiUrl}/api/users/search?query=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersWithBadge = selectedBadge?.receivers || [];

      const filtered = res.data.filter((u) => !usersWithBadge.includes(u._id));

      setSearchResults(filtered);
    } catch (err) {
      console.error("Ошибка при поиске пользователей:", err);
    }
  };

  return (
    <div className="badges-tab">
      <h2>Значки</h2>
      <div className="create-badge-container">
        <h3>Создать новый значок</h3>

        <input
          type="text"
          placeholder="Название"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />

        <input
          type="text"
          placeholder="Описание"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />

        <label className="badge-upload-label">
          {preview ? (
            <img src={preview} alt="preview" className="badge-preview" />
          ) : (
            "Загрузить иконку"
          )}
          <input
            type="file"
            accept="image/png, image/jpeg"
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;

              const formData = new FormData();
              formData.append("badge-icon", file);

              try {
                const res = await axios.post(
                  `${apiUrl}/api/badges/upload-icon`,
                  formData,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "multipart/form-data",
                    },
                  }
                );

                setForm((f) => ({
                  ...f,
                  icon: res.data.url,
                  dominantColor: res.data.dominantColor,
                }));
                console.log(form);
                setPreview(res.data.url);
              } catch (err) {
                console.error("Ошибка при загрузке иконки:", err);
                alert("Ошибка загрузки иконки");
              }
            }}
          />
        </label>

        <button onClick={handleCreateBadge}>Создать</button>
      </div>
      <div className="badge-list">
        {badges.map((badge) => (
          <div
            key={badge._id}
            className={`badge-item ${
              selectedBadge?._id === badge._id ? "selected" : ""
            }`}
            onClick={() => setSelectedBadge(badge)}
            title={badge.name}
          >
            <img src={badge.icon} alt={badge.name} />
          </div>
        ))}
      </div>

      {selectedBadge && (
        <div
          className="badge-menu"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            background: `radial-gradient(circle at 12%, ${selectedBadge.dominantColor} 0%, transparent 100%), 
            radial-gradient(ellipse at right, ${selectedBadge.dominantColor} 0%, transparent 0%)`,
          }}
        >
          {/* Левая часть: иконка */}
          <div className="badge-menu-left">
            <div className="badge-icon-wrapper">
              <img
                src={selectedBadge.icon}
                alt={selectedBadge.name}
                className="badge-icon-preview"
              />
            </div>
          </div>

          {/* Центр: инфо + редактирование */}

          <div className="badge-menu-center">
            {!editing ? (
              <>
                <h3>{selectedBadge.name}</h3>
                <p>{selectedBadge.description || ""}</p>
                <div className="badge-edit-buttons">
                  <button
                    onClick={() => {
                      setEditing(true);
                      setEditForm({
                        name: selectedBadge.name,
                        description: selectedBadge.description,
                      });
                    }}
                  >
                    ✏️ Редактировать
                  </button>
                  <button onClick={handleDeleteBadge}>🗑️ Удалить</button>
                </div>
              </>
            ) : (
              <>
                <div className="badge-edit-form-overlay">
                  <input
                    type="text"
                    placeholder="Новое название"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="Новое описание"
                    value={editForm.description || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                  <div className="badge-edit-buttons">
                    <button onClick={handleEditBadge}>💾 Сохранить</button>
                    <button onClick={() => setEditing(false)}>❌ Отмена</button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Правая часть: Выдача */}

          <div className="badge-menu-right">
            {!editing && (
              <>
                <h4>Выдать пользователю</h4>
                <div className="user-search-container">
                  <input
                    type="text"
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      handleUserSearch(e.target.value);
                    }}
                  />
                  {searchResults.length > 0 && (
                    <ul className="user-suggestions">
                      {searchResults.map((user) => (
                        <li
                          key={user._id}
                          onClick={() => {
                            setUsername(user.username);
                            setSearchResults([]);
                          }}
                        >
                          {user.username}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="badge-edit-buttons">
                  {username.length > 0 ? (
                    <button onClick={handleGrantBadge}>➕ Выдать</button>
                  ) : (
                    <button
                      onClick={handleGrantBadge}
                      disabled
                      style={{ cursor: "default" }}
                    >
                      ⚠️ Выдать(введите имя)
                    </button>
                  )}
                  <button onClick={() => setSelectedBadge(null)}>
                    ❌ Закрыть
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgesTab;
