import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import s from "../css/AddSetting.module.scss";
import authFetch from "../function/authFetch";

export default function AddSettingPage() {
  const navigate = useNavigate();
  const { sidebarCollapsed } = useOutletContext();

  const typeDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newData, setNewData] = useState({
    name: "",
    typeId: "",
    status: true,
  });

  const [settingTypes, setSettingTypes] = useState([]);

  const statusOptions = [
    {
      value: true,
      label: "Active",
      desc: "Setting is enabled",
      icon: "bi-check-circle-fill",
      color: "#10b981",
    },
    {
      value: false,
      label: "Inactive",
      desc: "Setting is disabled",
      icon: "bi-x-circle-fill",
      color: "#ef4444",
    },
  ];

  async function fetchSettingTypes() {
    const res = await authFetch("http://localhost:8080/settings/types",{
      method: "GET",
    });
    const data = await res.json();
    setSettingTypes(data);
  }

  useEffect(() => {
    fetchSettingTypes();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target)
      ) {
        setTypeDropdownOpen(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (field, value) => {
    setNewData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeSelect = (typeId) => {
    const selectedType = settingTypes.find(t => t.id === typeId);
    setNewData((prev) => ({ ...prev, typeId: selectedType.id }));
    setTypeDropdownOpen(false);
  };

  const handleStatusSelect = (option) => {
    setNewData((prev) => ({ ...prev, status: option.value }));
    setStatusDropdownOpen(false);
  };

  const selectedType = settingTypes.find((t) => t.id === newData.typeId);
  const selectedStatus = statusOptions.find((s) => s.value === newData.status);

  async function handleSave(e) {
    e.preventDefault();
    if (!newData.name.trim()) {
      setIsError(true);
      setMessage("Setting name is required.");
      return;
    }

    setIsSaving(true);
    const payload = {
      name: newData.name.trim(),
      typeId: newData.typeId,
      status: newData.status,
    };

    const res = await authFetch("http://localhost:8080/settings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setIsSaving(false);

    if (!res.ok) {
      setIsError(true);
      setMessage(data.message);
      return;
    }

    setIsError(false);
    setMessage(data.message);
    setTimeout(() => navigate("/admin/setting-list"), 1800);
  }

  return (
    <div className={s.layout}>
      <title>Add Setting</title>

      <div className={`${s.main} ${sidebarCollapsed ? s.mainCollapsed : ""}`}>
        <div className={s.wrapper}>
          {/* Breadcrumb */}
          <div className={s.breadcrumb}>
            <span
              className={s.breadcrumbLink}
              onClick={() => navigate("/admin/setting-list")}
            >
              <i className="bi bi-gear-fill"></i>
              Settings
            </span>
            <i className="bi bi-chevron-right"></i>
            <span className={s.breadcrumbCurrent}>Add Setting</span>
          </div>

          {/* Page Header */}
          <div className={s.pageHeader}>
            <div>
              <h1 className={s.pageTitle}>Add Setting</h1>
              <p className={s.pageSubtitle}>
                Create a new system configuration
              </p>
            </div>
            <button
              className={s.backBtn}
              onClick={() => navigate("/admin/setting-list")}
            >
              <i className="bi bi-arrow-left"></i>
              Back to Settings
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave}>
            <div className={s.formGrid}>
              {/* ─── Left: preview card ─── */}
              <div className={s.previewCard}>
                <h3 className={s.cardTitle}>
                  <i className="bi bi-eye"></i>
                  Preview
                </h3>

                <div className={s.previewBox}>
                  <div
                    className={`${s.previewOrb} ${s.orbDefault}`}
                  >
                    <i
                      className={"bi bi-gear"}
                    ></i>
                  </div>

                  <div className={s.previewMeta}>
                    <span className={s.previewName}>
                      {newData.name || "Setting name"}
                    </span>
                    <div className={s.previewTags}>
                      {selectedType && (
                        <span
                          className={s.typeBadge}
                        >
                          {selectedType.name}
                        </span>
                      )}
                      <span
                        className={`${s.statusDot} ${newData.status ? s.dotActive : s.dotInactive}`}
                      >
                        {newData.status ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick info chips */}
                <div className={s.infoChips}>
                  <div className={s.chip}>
                    <i className="bi bi-tag"></i>
                    <span>Name: </span>
                    <strong>{newData.name || "—"}</strong>
                  </div>
                  <div className={s.chip}>
                    <i className="bi bi-grid-3x3-gap"></i>
                    <span>Type: </span>
                    <strong>{selectedType?.name || "—"}</strong>
                  </div>
                  <div className={s.chip}>
                    <i
                      className="bi bi-circle-fill"
                      style={{
                        color: newData.status ? "#10b981" : "#ef4444",
                        fontSize: "0.55rem",
                      }}
                    ></i>
                    <span>Status: </span>
                    <strong>{newData.status ? "Active" : "Inactive"}</strong>
                  </div>
                </div>
              </div>

              {/* ─── Right: fields card ─── */}
              <div className={s.fieldsCard}>
                <h3 className={s.cardTitle}>
                  <i className="bi bi-sliders"></i>
                  Setting Information
                </h3>

                {/* Name */}
                <div className={s.formGroup}>
                  <label className={s.label}>
                    Setting Name <span className={s.required}>*</span>
                  </label>
                  <div className={s.inputWrapper}>
                    <i className="bi bi-tag"></i>
                    <input
                      type="text"
                      placeholder="Enter setting name"
                      value={newData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className={s.input}
                      required
                    />
                  </div>
                  <span className={s.hint}>
                    Use snake_case for machine-readable keys.
                  </span>
                </div>

                {/* Type */}
                <div className={s.formGroup}>
                  <label className={s.label}>
                    Type
                  </label>
                  <div className={s.dropdown} ref={typeDropdownRef}>
                    <button
                      type="button"
                      className={`${s.filterBtn} ${typeDropdownOpen ? s.filterBtnOpen : ""} ${!newData.type ? s.filterBtnPlaceholder : ""}`}
                      onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                    >
                      {selectedType ? (
                        <span className={s.selectedItem}>
                          {selectedType.name}
                        </span>
                      ) : (
                        <span className={s.placeholder}>Select a type…</span>
                      )}
                      <i
                        className={`bi bi-chevron-down ${typeDropdownOpen ? s.rotate : ""}`}
                      ></i>
                    </button>

                    {typeDropdownOpen && (
                      <div className={s.filterDropdownMenu}>
                        {settingTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            className={`${s.filterDropdownItem} ${newData.typeId === type.id ? s.active : ""}`}
                            onClick={() => handleTypeSelect(type.id)}
                          >
                            <span className={s.itemLeft}>
                              <span className={s.itemText}>
                                <span className={s.itemLabel}>
                                  {type.name}
                                </span>
                              </span>
                            </span>
                            {newData.typeId === type.id && (
                              <i className="bi bi-check-lg"></i>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className={s.formGroup}>
                  <label className={s.label}>Status</label>
                  <div className={s.dropdown} ref={statusDropdownRef}>
                    <button
                      type="button"
                      className={`${s.filterBtn} ${statusDropdownOpen ? s.filterBtnOpen : ""}`}
                      onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    >
                      <span className={s.selectedItem}>
                        <i
                          className={`bi ${selectedStatus.icon}`}
                          style={{ color: selectedStatus.color }}
                        ></i>
                        {selectedStatus.label}
                      </span>
                      <i
                        className={`bi bi-chevron-down ${statusDropdownOpen ? s.rotate : ""}`}
                      ></i>
                    </button>

                    {statusDropdownOpen && (
                      <div className={s.filterDropdownMenu}>
                        {statusOptions.map((option) => (
                          <button
                            key={String(option.value)}
                            type="button"
                            className={`${s.filterDropdownItem} ${newData.status === option.value ? s.active : ""}`}
                            onClick={() => handleStatusSelect(option)}
                          >
                            <span className={s.itemLeft}>
                              <span
                                className={`${s.statusIconWrap} ${option.value ? s.statusWrapActive : s.statusWrapInactive}`}
                              >
                                <i className={`bi ${option.icon}`}></i>
                              </span>
                              <span className={s.itemText}>
                                <span className={s.itemLabel}>
                                  {option.label}
                                </span>
                                <span className={s.itemDesc}>
                                  {option.desc}
                                </span>
                              </span>
                            </span>
                            {newData.status === option.value && (
                              <i className="bi bi-check-lg"></i>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Message */}
                {message && (
                  <div
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
                  </div>
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
                        Saving…
                      </>
                    ) : (
                      <>
                        <i className="bi bi-floppy"></i>
                        Save Setting
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
