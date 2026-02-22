import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import s from "../css/EditAccount.module.scss";
import authFetch from "../function/authFetch";
import { useTranslation } from "react-i18next";

export default function EditAccountPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [roles, setRoles] = useState([]);
  const [newData, setNewData] = useState({});

  const { sidebarCollapsed } = useOutletContext();

  const [account, setAccount] = useState({
    fullName: "",
    email: "",
    username: "",
    avatarUrl: "",
    role: null,
    status: "",
  });

  const [previewAvatar, setPreviewAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getAllRoles();
    fetchAccount();
  }, [id]);

  async function fetchAccount() {
    const res = await authFetch(`http://localhost:8080/users/get/${id}`, {
      method: "GET",
    });
    const data = await res.json();
    setAccount({
      fullName: data.fullName,
      email: data.email,
      username: data.username,
      avatarUrl: data.avatarUrl,
      role: data.role,
      status: data.status,
    });
    setPreviewAvatar(data.avatarUrl || "");
  }

  async function getAllRoles() {
    const res = await authFetch("http://localhost:8080/settings/roles", {
      method: "GET",
    });
    const data = await res.json();
    setRoles(data);
  }

  const handleChange = (field, value) => {
    setAccount({ ...account, [field]: value });
    setNewData({ ...newData, [field]: value });
  };

  function handleRoleChange(e) {
    const roleId = Number(e.target.value);
    const selectedRole = roles.find((r) => r.id === roleId);
    setAccount({
      ...account,
      role: selectedRole,
    });
    setNewData({
      ...newData,
      roleId: roleId,
    });
  }

  function handleAvatarClick() {
    fileInputRef.current.click();
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  }

  function handleRemoveAvatar() {
    setPreviewAvatar("https://i.pinimg.com/736x/21/91/6e/21916e491ef0d796398f5724c313bbe7.jpg");
    setAvatarFile(null);

    setAccount({
      ...account,
      avatarUrl: "https://i.pinimg.com/736x/21/91/6e/21916e491ef0d796398f5724c313bbe7.jpg",
    });

    setNewData({
      ...newData,
      removeAvatar: true,
    });

    fileInputRef.current.value = "";
  }

  async function handleSave(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify({ ...newData })], { type: "application/json" }),
    );
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const res = await authFetch(`http://localhost:8080/users/update/${id}`, {
      method: "PATCH",
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
      setIsError(true);
      setMessage(data.message);
      setIsSaving(false);
      return;
    }

    setIsError(false);
    setMessage(data.message);
    setTimeout(() => {
      navigate("/admin/account-list");
    }, 1800);
  }

  const getInitials = () => {
    if (!account.fullName) return "?";
    const parts = account.fullName.trim().split(" ");
    const first = parts[0]?.[0] || "";
    const last = parts[parts.length - 1]?.[0] || "";
    return (first + (parts.length > 1 ? last : "")).toUpperCase();
  };

  return (
    <div className={s.layout}>
      <title>Edit Account</title>
      <div className={`${s.main} ${sidebarCollapsed ? s.mainCollapsed : ""}`}>
        <div className={s.wrapper}>
          {/* Breadcrumb */}
          <div className={s.breadcrumb}>
            <span
              className={s.breadcrumbLink}
              onClick={() => navigate("/admin/account-list")}
            >
              <i className="bi bi-people-fill"></i>
              {t("admin.sidebar.accounts")}
            </span>
            <i className="bi bi-chevron-right"></i>
            <span className={s.breadcrumbCurrent}>{t("admin.editAccount.title")}</span>
          </div>

          {/* Page Header */}
          <div className={s.pageHeader}>
            <div>
              <h1 className={s.pageTitle}>{t("admin.editAccount.title")}</h1>
              <p className={s.pageSubtitle}>
                {t("admin.editAccount.subtitle")}
              </p>
            </div>
            <button
              className={s.backBtn}
              onClick={() => navigate("/admin/account-list")}
            >
              <i className="bi bi-arrow-left"></i>
              {t("admin.editAccount.back")}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave}>
            <div className={s.formGrid}>
              {/* Left: Avatar Card */}
              <div className={s.avatarCard}>
                <h3 className={s.cardTitle}>
                  <i className="bi bi-person-circle"></i>
                  Avatar
                </h3>

                <div className={s.avatarWrapper}>
                  <div className={s.avatarPreview} onClick={handleAvatarClick}>
                    {previewAvatar ? (
                      <img
                        src={previewAvatar}
                        alt="Avatar"
                        className={s.avatarImg}
                      />
                    ) : (
                      <div className={s.avatarPlaceholder}>
                        <span className={s.avatarInitials}>
                          {getInitials()}
                        </span>
                      </div>
                    )}
                    <div className={s.avatarOverlay}>
                      <i className="bi bi-camera"></i>
                      <span>{t("admin.editAccount.change")}</span>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className={s.fileInput}
                  />

                  <div className={s.avatarActions}>
                    {previewAvatar && (
                      <button
                        type="button"
                        className={s.removeBtn}
                        onClick={handleRemoveAvatar}
                      >
                        <i className="bi bi-trash"></i>
                        {t("admin.editAccount.remove")}
                      </button>
                    )}
                  </div>
                  <p className={s.avatarNote}>
                    {t("admin.editAccount.avatarNote")}
                  </p>
                </div>

                {/* Role & Status in Avatar Card */}
                <div className={s.cardDivider}></div>

                <h3 className={s.cardTitle}>
                  <i className="bi bi-shield-fill"></i>
                  {t("admin.editAccount.permissions")}
                </h3>

                <div className={s.formGroup}>
                  <label className={s.label}>{t("admin.editAccount.role")}</label>
                  <div className={s.selectWrapper}>
                    <select
                      name="role"
                      value={account.role?.id}
                      onChange={handleRoleChange}
                      className={s.select}
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <i className="bi bi-chevron-down"></i>
                  </div>
                </div>

                <div className={s.formGroup}>
                  <label className={s.label}>{t("admin.editAccount.status")}</label>
                  <div className={s.radioGroup}>
                    <label
                      className={`${s.radioItem} ${account.status ? s.radioActive : ""}`}
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={account.status}
                        onChange={(e) => handleChange("status", true)}
                        className={s.radioInput}
                      />
                      <div className={s.radioBox}>
                        <div className={s.radioCircle}></div>
                        <div>
                          <span className={s.radioLabel}>{t("admin.editAccount.active")}</span>
                          <span className={s.radioDesc}>{t("admin.editAccount.active.description")}</span>
                        </div>
                      </div>
                    </label>

                    <label
                      className={`${s.radioItem} ${!account.status ? s.radioActive : ""}`}
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={!account.status}
                        onChange={(e) => handleChange("status", false)}
                        className={s.radioInput}
                      />
                      <div className={s.radioBox}>
                        <div className={s.radioCircle}></div>
                        <div>
                          <span className={s.radioLabel}>{t("admin.editAccount.inactive")}</span>
                          <span className={s.radioDesc}>
                            {t("admin.editAccount.inactive.description")}
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right: Info Fields */}
              <div className={s.infoCard}>
                <h3 className={s.cardTitle}>
                  <i className="bi bi-person-fill"></i>
                  {t("admin.editAccount.information")}
                </h3>

                <div className={s.formGroup}>
                  <label className={s.label}>{t("admin.editAccount.fullName")}</label>
                  <div className={s.inputWrapper}>
                    <i className="bi bi-person"></i>
                    <input
                      type="text"
                      name="fullName"
                      value={account.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      placeholder={t("admin.editAccount.fullName.placeholder")}
                      className={s.input}
                      required
                    />
                  </div>
                </div>

                <div className={s.formGroup}>
                  <label className={s.label}>{t("admin.editAccount.email")}</label>
                  <div className={s.inputWrapper}>
                    <i className="bi bi-envelope"></i>
                    <input
                      type="email"
                      name="email"
                      value={account.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder={t("admin.editAccount.email.placeholder")}
                      className={s.input}
                      required
                    />
                  </div>
                </div>

                <div className={s.formGroup}>
                  <label className={s.label}>{t("admin.editAccount.username")}</label>
                  <div className={s.inputWrapper}>
                    <i className="bi bi-at"></i>
                    <input
                      type="text"
                      name="username"
                      value={account.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      placeholder={t("admin.editAccount.username.placeholder")}
                      className={s.input}
                      required
                    />
                  </div>
                </div>

                {/* Summary Preview */}
                <div className={s.cardDivider}></div>

                <h3 className={s.cardTitle}>
                  <i className="bi bi-eye"></i>
                  {t("admin.editAccount.preview")}
                </h3>
                <div className={s.previewBox}>
                  <div className={s.previewAvatar}>
                    {previewAvatar ? (
                      <img
                        src={previewAvatar}
                        alt=""
                        className={s.previewAvatarImg}
                      />
                    ) : (
                      <span className={s.previewInitials}>{getInitials()}</span>
                    )}
                  </div>
                  <div className={s.previewInfo}>
                    <span className={s.previewName}>
                      {account.fullName || t("admin.editAccount.fullName")}
                    </span>
                    <span className={s.previewUsername}>
                      @{account.username || t("admin.editAccount.username")}
                    </span>
                  </div>
                  <span
                    className={`${s.previewBadge} ${s[`badge${account.role?.name}`]}`}
                  >
                    {account.role?.name}
                  </span>
                </div>

                {/* Message */}
                {message && (
                  <p
                    className={`${s.message} ${isError ? s.messageError : s.messageSuccess}`}
                  >
                    <i
                      className={
                        isError
                          ? "bi bi-exclamation-circle"
                          : "bi bi-check-circle"
                      }
                    ></i>
                    {message}
                  </p>
                )}

                {/* Action Buttons */}
                <div className={s.actions}>
                  <button
                    type="button"
                    className={s.cancelBtn}
                    onClick={() => navigate(-1)}
                  >
                    <i className="bi bi-x-lg"></i>
                    {t("admin.editAccount.cancel")}
                  </button>
                  <button
                    type="submit"
                    className={s.saveBtn}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <i className="bi bi-arrow-repeat"></i>
                        {t("admin.editAccount.saving")}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-floppy"></i>
                        {t("admin.editAccount.saveChanges")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
