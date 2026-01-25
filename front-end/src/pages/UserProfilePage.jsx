import React, { useEffect, useState } from "react";
import authFetch from "../function/authFetch";
import s from "../css/UserProfile.module.scss";

export default function ModernUserProfile() {
  const [isUpdated, setIsUpdated] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [originalData, setOriginalData] = useState({
    username: "",
    fullName: "",
    email: "",
    avatarUrl: ""
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
  }

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

  const enableEdit = () => setIsEditing(true);

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveProfile = async () => {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify({...newData})], {type: "application/json"}));
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
    formData.append("data", new Blob([JSON.stringify({currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword})], {type: "application/json"}));
    const res = await authFetch("http://localhost:8080/users/me", {
      method: "PATCH",
      body: formData
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
    <div className={s.profile}>
      <div className={s.profileWrapper}>
        <div className="container" style={{ maxWidth: "1000px" }}>
          {/* Header */}
          <div className={s.profileHeader}>
            <h1 className={s.profileTitle}>My Profile</h1>
            <p className={s.profileSubtitle}>
              Account Information and Security Management
            </p>
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
                <span>Account Information</span>
              </button>
              <button
                className={`${s.customTab} ${activeTab === "password" ? s.customTabActive : ""}`}
                onClick={() => setActiveTab("password")}
              >
                <i className="bi bi-lock-fill"></i>
                <span>Change Password</span>
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
                      <p className={s.avatarHint}>
                        Click on the avatar to choose image
                      </p>
                    )}
                  </div>

                  {/* Form */}
                  <div className="row g-4">
                    {/* Full Name */}
                    <div className="col-md-6">
                      <label className={`form-label ${s.formLabel}`}>
                        Full Name
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
                        Username
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
                        Email
                      </label>
                      <div className={s.inputWrapper}>
                        <i className={`bi bi-envelope-fill ${s.inputIcon}`}></i>
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
                          Current Password
                        </label>
                        <div className={`${s.inputWrapper} ${s.withToggle}`}>
                          <i className={`bi bi-lock-fill ${s.inputIcon}`}></i>
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            className={`form-control ${s.formControl}`}
                            placeholder="Enter current password"
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
                          New Password
                        </label>
                        <div className={`${s.inputWrapper} ${s.withToggle}`}>
                          <i className={`bi bi-lock-fill ${s.inputIcon}`}></i>
                          <input
                            type={showNewPassword ? "text" : "password"}
                            className={`form-control ${s.formControl}`}
                            placeholder="Enter new password"
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
                            onClick={() => setShowNewPassword(!showNewPassword)}
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
                          Confirm New Password
                        </label>
                        <div className={`${s.inputWrapper} ${s.withToggle}`}>
                          <i className={`bi bi-lock-fill ${s.inputIcon}`}></i>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className={`form-control ${s.formControl}`}
                            placeholder="Nhập lại mật khẩu mới"
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
                            Requirement
                          </div>
                          <ul>
                            <li>At least 8 characters</li>
                            <li>Consists of lowercase and uppercase</li>
                            <li>
                              At least 1 special characters (@, #, $, etc.)
                            </li>
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
                          Change Password
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
                <h3 className={s.securityTitle}>Account Security</h3>
                <p className={s.securityText}>
                  Ensure your account is always protected by using a strong
                  password and never sharing your login information with others.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
