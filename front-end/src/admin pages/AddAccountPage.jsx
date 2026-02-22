import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import s from "../css/AddAccount.module.scss";
import authFetch from "../function/authFetch";
import { useTranslation } from "react-i18next";

export default function AddAccountPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const fileInputRef = useRef(null);
  const roleDropdownRef = useRef(null);
  const [roles, setRoles] = useState([]);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [newData, setNewData] = useState({
    fullName: "",
    email: "",
    username: "",
    roleId: "",
    roleName: "",
    role: null,
    status: true,
  });

  const { sidebarCollapsed } = useOutletContext();

  const [previewAvatar, setPreviewAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getAllRoles();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target)
      ) {
        setRoleDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function getAllRoles() {
    const res = await authFetch("http://localhost:8080/settings/roles", {
      method: "GET",
    });
    const data = await res.json();
    setRoles(data);
  }

  const handleChange = (field, value) => {
    setNewData({ ...newData, [field]: value });
  };

  function handleRoleChange(role) {
    setNewData({
      ...newData,
      roleId: role.id,
      roleName: role.name,
      role: role,
    });
    setRoleDropdownOpen(false);
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
    setPreviewAvatar(
      "https://i.pinimg.com/736x/21/91/6e/21916e491ef0d796398f5724c313bbe7.jpg",
    );
    setAvatarFile(null);

    setNewData({
      ...newData,
      avatarUrl:
        "https://i.pinimg.com/736x/21/91/6e/21916e491ef0d796398f5724c313bbe7.jpg",
    });

    fileInputRef.current.value = "";
  }

  async function handleSave(e) {
    e.preventDefault();
    const lang = localStorage.getItem("lang") || "en";
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify({ ...newData })], { type: "application/json" }),
    );
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const res = await authFetch(`http://localhost:8080/users/create?lang=${lang}`, {
      method: "POST",
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

  return (
    <div className={s.layout}>
      <title>Add Account</title>
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
            <span className={s.breadcrumbCurrent}>{t("admin.addAccount.title")}</span>
          </div>

          {/* Page Header */}
          <div className={s.pageHeader}>
            <div>
              <h1 className={s.pageTitle}>{t("admin.addAccount.title")}</h1>
              <p className={s.pageSubtitle}>
                {t("admin.addAccount.subtitle")}
              </p>
            </div>
            <button
              className={s.backBtn}
              onClick={() => navigate("/admin/account-list")}
            >
              <i className="bi bi-arrow-left"></i>
              {t("admin.addAccount.back")}
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
                      <img
                        src="https://i.pinimg.com/736x/21/91/6e/21916e491ef0d796398f5724c313bbe7.jpg"
                        alt="Default Avatar"
                        className={s.avatarImg}
                      />
                    )}
                    <div className={s.avatarOverlay}>
                      <i className="bi bi-camera"></i>
                      <span>{t("admin.addAccount.change")}</span>
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
                        {t("admin.addAccount.remove")}
                      </button>
                    )}
                  </div>
                  <p className={s.avatarNote}>
                    {t("admin.addAccount.recommended")}: 200x200px, JPG/PNG, max 2MB
                  </p>
                </div>

                {/* Role & Status in Avatar Card */}
                <div className={s.cardDivider}></div>

                <h3 className={s.cardTitle}>
                  <i className="bi bi-shield-fill"></i>
                  {t("admin.addAccount.permissions")}
                </h3>

                <div className={s.formGroup}>
                  <label className={s.label}>{t("admin.addAccount.role")}</label>
                  <div className={s.dropdown} ref={roleDropdownRef}>
                    <button
                      type="button"
                      className={s.filterBtn}
                      onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    >
                      <span>{newData.roleName || t("admin.addAccount.selectRole")}</span>
                      <i
                        className={`bi bi-chevron-down ${roleDropdownOpen ? s.rotate : ""}`}
                      ></i>
                    </button>

                    {roleDropdownOpen && (
                      <div className={s.filterDropdownMenu}>
                        {roles.map((role) => (
                          <button
                            key={role.id}
                            type="button"
                            className={`${s.filterDropdownItem} ${newData.roleId === role.id ? s.active : ""}`}
                            onClick={() => handleRoleChange(role)}
                          >
                            {role.name}
                            {newData.roleId === role.id && (
                              <i className="bi bi-check-lg"></i>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={s.formGroup}>
                  <label className={s.label}>{t("admin.addAccount.status")}</label>
                  <div className={s.radioGroup}>
                    <label
                      className={`${s.radioItem} ${newData.status ? s.radioActive : ""}`}
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={newData.status}
                        onChange={() => handleChange("status", true)}
                        className={s.radioInput}
                      />
                      <div className={s.radioBox}>
                        <div className={s.radioCircle}></div>
                        <div>
                          <span className={s.radioLabel}>{t("admin.addAccount.status.active")}</span>
                          <span className={s.radioDesc}>{t("admin.addAccount.status.active.description")}</span>
                        </div>
                      </div>
                    </label>

                    <label
                      className={`${s.radioItem} ${!newData.status ? s.radioActive : ""}`}
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={!newData.status}
                        onChange={() => handleChange("status", false)}
                        className={s.radioInput}
                      />
                      <div className={s.radioBox}>
                        <div className={s.radioCircle}></div>
                        <div>
                          <span className={s.radioLabel}>{t("admin.addAccount.status.inactive")}</span>
                          <span className={s.radioDesc}>
                            {t("admin.addAccount.status.inactive.description")}
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
                  {t("admin.addAccount.information")}
                </h3>

                <div className={s.formGroup}>
                  <label className={s.label}>{t("admin.addAccount.fullName")}</label>
                  <div className={s.inputWrapper}>
                    <i className="bi bi-person"></i>
                    <input
                      type="text"
                      name="fullName"
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      placeholder={t("admin.addAccount.fullName.placeholder")}
                      className={s.input}
                      required
                    />
                  </div>
                </div>

                <div className={s.formGroup}>
                  <label className={s.label}>{t("admin.addAccount.email")}</label>
                  <div className={s.inputWrapper}>
                    <i className="bi bi-envelope"></i>
                    <input
                      type="email"
                      name="email"
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder={t("admin.addAccount.email.placeholder")}
                      className={s.input}
                      required
                    />
                  </div>
                </div>

                <div className={s.formGroup}>
                  <label className={s.label}>{t("admin.addAccount.username")}</label>
                  <div className={s.inputWrapper}>
                    <i className="bi bi-at"></i>
                    <input
                      type="text"
                      name="username"
                      onChange={(e) => handleChange("username", e.target.value)}
                      placeholder={t("admin.addAccount.username.placeholder")}
                      className={s.input}
                      required
                    />
                  </div>
                </div>

                <p className={s.note}>
                  {t("admin.addAccount.note")}
                </p>

                {/* Summary Preview */}
                <div className={s.cardDivider}></div>

                <h3 className={s.cardTitle}>
                  <i className="bi bi-eye"></i>
                  {t("admin.addAccount.preview")}
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
                      <img
                        src="https://i.pinimg.com/736x/21/91/6e/21916e491ef0d796398f5724c313bbe7.jpg"
                        alt="Default Avatar"
                        className={s.previewAvatarImg}
                      />
                    )}
                  </div>
                  <div className={s.previewInfo}>
                    <span className={s.previewName}>
                      {newData.fullName || t("admin.addAccount.fullName")}
                    </span>
                    <span className={s.previewUsername}>
                      @{newData.username || t("admin.addAccount.username")}
                    </span>
                  </div>
                  <span
                    className={`${s.previewBadge} ${s[`badge${newData.role?.name || ""}`]}`}
                  >
                    {newData.role?.name || t("admin.addAccount.role")}
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
                    {t("admin.addAccount.cancel")}
                  </button>
                  <button
                    type="submit"
                    className={s.saveBtn}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <i className="bi bi-arrow-repeat"></i>
                        {t("admin.addAccount.saving")}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-floppy"></i>
                        {t("admin.addAccount.save")}
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
