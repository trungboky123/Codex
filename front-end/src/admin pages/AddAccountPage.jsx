import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSideBar";
import s from "../css/AddAccount.module.scss";
import authFetch from "../function/authFetch";

export default function AddAccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const fileInputRef = useRef(null);
  const [roles, setRoles] = useState([]);
  const [newData, setNewData] = useState({
    status: true,
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const [previewAvatar, setPreviewAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getAllRoles();
  }, [id]);

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

  function handleRoleChange(e) {
    const roleId = Number(e.target.value);
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
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify({ ...newData })], { type: "application/json" }),
    );
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const res = await authFetch("http://localhost:8080/users/create", {
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
      <AdminHeader sidebarCollapsed={sidebarCollapsed} />
      <AdminSidebar onCollapseChange={handleSidebarCollapse} />
      <div className={`${s.main} ${sidebarCollapsed ? s.mainCollapsed : ""}`}>
        <div className={s.wrapper}>
          {/* Breadcrumb */}
          <div className={s.breadcrumb}>
            <span
              className={s.breadcrumbLink}
              onClick={() => navigate("/admin/account-list")}
            >
              <i className="bi bi-people-fill"></i>
              Accounts
            </span>
            <i className="bi bi-chevron-right"></i>
            <span className={s.breadcrumbCurrent}>Add Account</span>
          </div>

          {/* Page Header */}
          <div className={s.pageHeader}>
            <div>
              <h1 className={s.pageTitle}>Add Account</h1>
              <p className={s.pageSubtitle}>
                Create a new user account with permissions
              </p>
            </div>
            <button
              className={s.backBtn}
              onClick={() => navigate("/admin/account-list")}
            >
              <i className="bi bi-arrow-left"></i>
              Back to Account List
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
                      <span>Change</span>
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
                        Remove
                      </button>
                    )}
                  </div>
                  <p className={s.avatarNote}>
                    Recommended: 200x200px, JPG/PNG, max 2MB
                  </p>
                </div>

                {/* Role & Status in Avatar Card */}
                <div className={s.cardDivider}></div>

                <h3 className={s.cardTitle}>
                  <i className="bi bi-shield-fill"></i>
                  Permissions
                </h3>

                <div className={s.formGroup}>
                  <label className={s.label}>Role</label>
                  <div className={s.selectWrapper}>
                    <select
                      value={newData.roleId || ""}
                      onChange={handleRoleChange}
                      className={s.select}
                    >
                      <option value="" disabled>
                        -- Select role --
                      </option>
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
                  <label className={s.label}>Status</label>
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
                          <span className={s.radioLabel}>Active</span>
                          <span className={s.radioDesc}>Account is active</span>
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
                          <span className={s.radioLabel}>Inactive</span>
                          <span className={s.radioDesc}>
                            Account is disabled
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
                  Account Information
                </h3>

                <div className={s.formGroup}>
                  <label className={s.label}>Full Name</label>
                  <div className={s.inputWrapper}>
                    <i className="bi bi-person"></i>
                    <input
                      type="text"
                      name="fullName"
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      placeholder="Enter full name"
                      className={s.input}
                      required
                    />
                  </div>
                </div>

                <div className={s.formGroup}>
                  <label className={s.label}>Email</label>
                  <div className={s.inputWrapper}>
                    <i className="bi bi-envelope"></i>
                    <input
                      type="email"
                      name="email"
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="Enter email address"
                      className={s.input}
                      required
                    />
                  </div>
                </div>

                <div className={s.formGroup}>
                  <label className={s.label}>Username</label>
                  <div className={s.inputWrapper}>
                    <i className="bi bi-at"></i>
                    <input
                      type="text"
                      name="username"
                      onChange={(e) => handleChange("username", e.target.value)}
                      placeholder="Enter username"
                      className={s.input}
                      required
                    />
                  </div>
                </div>

                <p className={s.note}>
                  *Note: Password will be set automatically 1-8.
                </p>

                {/* Summary Preview */}
                <div className={s.cardDivider}></div>

                <h3 className={s.cardTitle}>
                  <i className="bi bi-eye"></i>
                  Preview
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
                      {newData.fullName || "Full Name"}
                    </span>
                    <span className={s.previewUsername}>
                      @{newData.username || "username"}
                    </span>
                  </div>
                  <span
                    className={`${s.previewBadge} ${s[`badge${newData.role?.name}`]}`}
                  >
                    {newData.role?.name}
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={s.saveBtn}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <i className="bi bi-arrow-repeat"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-floppy-disk"></i>
                        Save Changes
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
