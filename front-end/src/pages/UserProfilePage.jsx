import React, { useEffect, useRef, useState } from "react";
import authFetch from "../function/authFetch";
import Header from "../components/Header";
import s from "../css/UserProfile.module.scss";
import { useTranslation } from "react-i18next";

export default function ModernUserProfile() {
  const [isUpdated, setIsUpdated] = useState(false);
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [originalData, setOriginalData] = useState({
    username: "",
    fullName: "",
    email: "",
    avatarUrl: "",
  });
  const [newData, setNewData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  async function fetchUser() {
    const res = await authFetch("http://localhost:8080/users/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setOriginalData(data);
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (field, value) => {
    setOriginalData({ ...originalData, [field]: value });
    setNewData({ ...newData, [field]: value });
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  function handleRemoveAvatar() {
    setAvatarPreview(
      "https://i.pinimg.com/736x/21/91/6e/21916e491ef0d796398f5724c313bbe7.jpg",
    );
    setAvatarFile(null);

    setOriginalData({
      ...originalData,
      avatarUrl:
        "https://i.pinimg.com/736x/21/91/6e/21916e491ef0d796398f5724c313bbe7.jpg",
    });

    setNewData({
      ...newData,
      removeAvatar: true,
    });

    fileInputRef.current.value = "";
  }

  const enableEdit = () => setIsEditing(true);

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveProfile = async () => {
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify({ ...newData })], { type: "application/json" }),
    );
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    const res = await authFetch("http://localhost:8080/users/me", {
      method: "PATCH",
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message);
      setIsUpdated(false);
      return;
    }
    fetchUser();
    setIsUpdated(true);
    setMessage(data.message);
    setIsEditing(false);
  };

  const changePassword = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setMessage("All fields are required!");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New Password does not match!");
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setMessage("New Password must be different from Current Password!");
      return;
    }
    const formData = new FormData();
    formData.append(
      "data",
      new Blob(
        [
          JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        ],
        { type: "application/json" },
      ),
    );
    const res = await authFetch("http://localhost:8080/users/me", {
      method: "PATCH",
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message);
      setIsUpdated(false);
      return;
    }

    setIsUpdated(true);
    setMessage(data.message);
    setIsEditing(false);
  };

  return (
    <>
      <title>My Profile</title>
      <Header />
      <div className={s.profile}>
        <div className={s.profileWrapper}>
          <div className="container" style={{ maxWidth: "1000px" }}>
            {/* Header */}
            <div className={s.profileHeader}>
              <h1 className={s.profileTitle}>{t("profile.title")}</h1>
              <p className={s.profileSubtitle}>{t("profile.subtitle")}</p>
            </div>

            {/* Main Card */}
            <div className={s.profileCard}>
              {/* Tabs */}
              <div className={s.customTabs}>
                <button
                  className={`${s.customTab} ${activeTab === "profile" ? s.customTabActive : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <i className="bi bi-person-fill"></i>
                  <span>{t("profile.account")}</span>
                </button>
                <button
                  className={`${s.customTab} ${activeTab === "password" ? s.customTabActive : ""}`}
                  onClick={() => setActiveTab("password")}
                >
                  <i className="bi bi-lock-fill"></i>
                  <span>{t("profile.changePassword")}</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 p-md-5">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div>
                    {/* Avatar */}
                    <div className={s.avatar}>
                      <div className={s.avatarWrapper}>
                        <img
                          ref={fileInputRef}
                          src={avatarPreview || originalData.avatarUrl}
                          alt="Avatar"
                          className={s.avatarImg}
                        />
                        {isEditing && (
                          <label className={s.avatarOverlay}>
                            <i className="bi bi-camera-fill"></i>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={handleAvatarChange}
                            />
                          </label>
                        )}
                      </div>

                      {isEditing && (
                        <div className={s.avatarActions}>
                          <button
                            type="button"
                            className={s.removeBtn}
                            onClick={handleRemoveAvatar}
                          >
                            <i className="bi bi-trash"></i>
                            Remove
                          </button>
                        </div>
                      )}
                      {isEditing && (
                        <p className={s.avatarHint}>{t("profile.avatar")}</p>
                      )}
                    </div>

                    {/* Form */}
                    <div className="row g-4">
                      {/* Full Name */}
                      <div className="col-md-6">
                        <label className={`form-label ${s.formLabel}`}>
                          {t("register.fullName")}
                        </label>
                        <div className={s.inputWrapper}>
                          <i className={`bi bi-person-fill ${s.inputIcon}`}></i>
                          <input
                            type="text"
                            className={`form-control ${s.formControl}`}
                            value={originalData.fullName}
                            onChange={(e) =>
                              handleProfileChange("fullName", e.target.value)
                            }
                            disabled={!isEditing}
                            required
                          />
                        </div>
                      </div>

                      {/* Username */}
                      <div className="col-md-6">
                        <label className={`form-label ${s.formLabel}`}>
                          {t("register.username")}
                        </label>
                        <div className={s.inputWrapper}>
                          <i className={`bi bi-at ${s.inputIcon}`}></i>
                          <input
                            type="text"
                            className={`form-control ${s.formControl}`}
                            value={originalData.username}
                            onChange={(e) =>
                              handleProfileChange("username", e.target.value)
                            }
                            disabled={!isEditing}
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-md-6">
                        <label className={`form-label ${s.formLabel}`}>
                          {t("register.email")}
                        </label>
                        <div className={s.inputWrapper}>
                          <i
                            className={`bi bi-envelope-fill ${s.inputIcon}`}
                          ></i>
                          <input
                            type="email"
                            className={`form-control ${s.formControl}`}
                            value={originalData.email}
                            onChange={(e) =>
                              handleProfileChange("email", e.target.value)
                            }
                            disabled={!isEditing}
                            required
                          />
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="col-12 mt-4">
                        {!isEditing ? (
                          <button
                            className={`btn ${s.btnGradientPrimary} w-100`}
                            onClick={enableEdit}
                          >
                            <i className="bi bi-pencil-fill me-2"></i>
                            Edit Profile
                          </button>
                        ) : (
                          <div className="row g-3">
                            <div className="col-md-6">
                              <button
                                className={`btn ${s.btnGradientSuccess} w-100`}
                                onClick={saveProfile}
                              >
                                <i className="bi bi-check-circle-fill me-2"></i>
                                Save Changes
                              </button>
                            </div>
                            <div className="col-md-6">
                              <button
                                className={`btn btn-secondary ${s.btnSecondary} w-100`}
                                onClick={cancelEdit}
                              >
                                <i className="bi bi-x-circle-fill me-2"></i>
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      {message && (
                        <p
                          className={`${s.message} ${
                            isUpdated ? s.messageSuccess : s.messageError
                          }`}
                        >
                          {message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Password Tab */}
                {activeTab === "password" && (
                  <div className="row justify-content-center">
                    <div className="col-lg-8">
                      <div className="row g-4">
                        {/* Current Password */}
                        <div className="col-12">
                          <label className={`form-label ${s.formLabel}`}>
                            {t("profile.currentPassword")}
                          </label>
                          <div className={`${s.inputWrapper} ${s.withToggle}`}>
                            <i className={`bi bi-lock-fill ${s.inputIcon}`}></i>
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              className={`form-control ${s.formControl}`}
                              placeholder={t(
                                "profile.currentPassword.placeholder",
                              )}
                              value={passwordData.currentPassword}
                              onChange={(e) =>
                                handlePasswordChange(
                                  "currentPassword",
                                  e.target.value,
                                )
                              }
                            />
                            <button
                              type="button"
                              className={s.passwordToggle}
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                            >
                              <i
                                className={`bi ${showCurrentPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}
                              ></i>
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div className="col-12">
                          <label className={`form-label ${s.formLabel}`}>
                            {t("profile.newPassword")}
                          </label>
                          <div className={`${s.inputWrapper} ${s.withToggle}`}>
                            <i className={`bi bi-lock-fill ${s.inputIcon}`}></i>
                            <input
                              type={showNewPassword ? "text" : "password"}
                              className={`form-control ${s.formControl}`}
                              placeholder={t("profile.newPassword.placeholder")}
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                handlePasswordChange(
                                  "newPassword",
                                  e.target.value,
                                )
                              }
                            />
                            <button
                              type="button"
                              className={s.passwordToggle}
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            >
                              <i
                                className={`bi ${showNewPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}
                              ></i>
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="col-12">
                          <label className={`form-label ${s.formLabel}`}>
                            {t("profile.confirm")}
                          </label>
                          <div className={`${s.inputWrapper} ${s.withToggle}`}>
                            <i className={`bi bi-lock-fill ${s.inputIcon}`}></i>
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              className={`form-control ${s.formControl}`}
                              placeholder={t("profile.confirm.placeholder")}
                              value={passwordData.confirmPassword}
                              onChange={(e) =>
                                handlePasswordChange(
                                  "confirmPassword",
                                  e.target.value,
                                )
                              }
                            />
                            <button
                              type="button"
                              className={s.passwordToggle}
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              <i
                                className={`bi ${showConfirmPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}
                              ></i>
                            </button>
                          </div>
                        </div>

                        {/* Alert */}
                        <div className="col-12">
                          <div className={s.alert}>
                            <div className={s.alertTitle}>
                              <i className="bi bi-shield-check"></i>
                              {t("profile.requirement")}
                            </div>
                            <ul>
                              <li>{t("profile.req1")}</li>
                              <li>{t("profile.req2")}</li>
                              <li>{t("profile.req3")}</li>
                            </ul>
                          </div>
                        </div>

                        {/* Button */}
                        <div className="col-12">
                          <button
                            className={`btn ${s.btnGradientPrimary} w-100`}
                            onClick={changePassword}
                          >
                            <i className="bi bi-check-circle-fill me-2"></i>
                            {t("profile.changePassword")}
                          </button>
                        </div>
                        {message && (
                          <p
                            className={`${s.message} ${
                              isUpdated ? s.messageSuccess : s.messageError
                            }`}
                          >
                            {message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Card */}
            <div className={s.security}>
              <div className="d-flex gap-3">
                <div className={s.securityIcon}>
                  <i className="bi bi-shield-check"></i>
                </div>
                <div>
                  <h3 className={s.securityTitle}>{t("profile.security")}</h3>
                  <p className={s.securityText}>
                    {t("profile.security.subtitle")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
