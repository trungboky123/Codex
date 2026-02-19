import React, { useState, useEffect, useRef } from "react";
import s from "../css/SettingList.module.scss";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import authFetch from "../function/authFetch";

export default function SettingListPage() {
  const navigate = useNavigate();
  const { sidebarCollapsed } = useOutletContext();
  const [settings, setSettings] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  // Filters
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("keyword") || "",
  );
  const [selectedType, setSelectedType] = useState(0);
  const [selectedTypeName, setSelectedTypeName] = useState(
    searchParams.get("type") || "",
  );
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStatusName, setSelectedStatusName] = useState(
    searchParams.get("status") || "",
  );

  // Dropdown
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const typeDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Setting types
  const [types, setTypes] = useState([]);

  useEffect(() => {
    getAllSettings();
  }, [searchTerm, selectedType, selectedStatus, sortBy, sortDir]);

  useEffect(() => {
    getAllTypes();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("keyword", searchTerm);
    if (selectedTypeName) params.set("type", selectedTypeName);
    if (selectedStatusName) params.set("status", selectedStatusName);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortDir) params.set("sortDir", sortDir);

    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedType, selectedStatus, sortBy, sortDir]);

  // Close dropdown when clicking outside
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

  async function getAllTypes() {
    const res = await authFetch("http://localhost:8080/settings/types", {
      method: "GET",
    });
    const data = await res.json();
    setTypes(data);
  }

  async function getAllSettings() {
    const params = new URLSearchParams();
    if (searchTerm.trim() !== "") {
      params.set("keyword", searchTerm);
    }

    if (selectedType !== 0) {
      params.set("typeId", selectedType);
    }

    if (selectedStatus !== "all") {
      params.set("status", selectedStatus);
    }
    if (sortBy) params.set("sortBy", sortBy);
    if (sortDir) params.set("sortDir", sortDir);

    const res = await authFetch(
      `http://localhost:8080/settings/getAll?${params.toString()}`,
      {
        method: "GET",
      },
    );
    const data = await res.json();
    setSettings(data);
  }

  const handleTypeChange = (typeId) => {
    if (typeId !== 0) {
      setSelectedTypeName(types.find(t => t.id === typeId).name);
    } else {
      setSelectedTypeName("");
    }

    setSelectedType(typeId);
    setTypeDropdownOpen(false);
  };

  const handleStatusChange = (selectedStatus) => {
    if (selectedStatus !== "all") {
      setSelectedStatusName(selectedStatus === "true" ? "Active" : "Inactive");
    } else {
      setSelectedStatusName("");
    }

    setSelectedStatus(selectedStatus);
    setStatusDropdownOpen(false);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const toggleStatus = async (settingId) => {
    const setting = settings.find((s) => s.id === settingId);
    if (!setting) return;

    const ok = window.confirm(
      setting.status ? "Deactivate this setting?" : "Activate this setting?",
    );
    if (!ok) return;

    const res = await authFetch(`http://localhost:8080/settings/status/${settingId}`, {
      method: "PUT",
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message);
      return;
    }

    getAllSettings();
  };

  const handleEditSetting = (settingId) => {
    navigate(`/admin/edit-setting/${settingId}`);
  };

  const getStatus = (status) => {
    return status ? "Active" : "Inactive";
  };

  const getStatusBadgeClass = (status) => {
    return status ? s.statusActive : s.statusInactive;
  };

  return (
    <>
      <title>Setting List</title>

      <div
        className={s.settings}
        style={{
          marginLeft: sidebarCollapsed ? "85px" : "280px",
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className={s.container}>
          {/* Header */}
          <div className={s.header}>
            <div>
              <h1 className={s.title}>System Settings</h1>
              <p className={s.subtitle}>Manage application configurations</p>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className={s.toolbar}>
            <div className={s.filters}>
              {/* Search */}
              <div className={s.searchBox}>
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Search by setting name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={s.searchInput}
                />
              </div>

              {/* Type Filter */}
              <div className={s.dropdown} ref={typeDropdownRef}>
                <button
                  className={s.filterBtn}
                  onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                >
                  <span>{selectedTypeName || "All Types"}</span>
                  <i
                    className={`bi bi-chevron-down ${typeDropdownOpen ? s.rotate : ""}`}
                  ></i>
                </button>

                {typeDropdownOpen && (
                  <div className={s.filterDropdownMenu}>
                    <button
                      className={`${s.filterDropdownItem} ${selectedType === 0 ? s.active : ""}`}
                      onClick={() => {
                        handleTypeChange(0);
                        setTypeDropdownOpen(false);
                      }}
                    >
                      All Types
                      {selectedType === 0 && <i className="bi bi-check-lg"></i>}
                    </button>
                    {types.map((type) => (
                      <button
                        key={type.id}
                        className={`${s.filterDropdownItem} ${selectedType === type.id ? s.active : ""}`}
                        onClick={() => handleTypeChange(type.id)}
                      >
                        {type.name}
                        {selectedType === type.id && (
                          <i className="bi bi-check-lg"></i>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Filter */}
              <div className={s.dropdown} ref={statusDropdownRef}>
                <button
                  className={s.filterBtn}
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                >
                  <span>{selectedStatusName || "All Status"}</span>
                  <i
                    className={`bi bi-chevron-down ${statusDropdownOpen ? s.rotate : ""}`}
                  ></i>
                </button>

                {statusDropdownOpen && (
                  <div className={s.filterDropdownMenu}>
                    <button
                      className={`${s.filterDropdownItem} ${selectedStatus === "all" ? s.active : ""}`}
                      onClick={() => handleStatusChange("all")}
                    >
                      All Status
                      {selectedStatus === "all" && (
                        <i className="bi bi-check-lg"></i>
                      )}
                    </button>
                    <button
                      className={`${s.filterDropdownItem} ${selectedStatus === "true" ? s.active : ""}`}
                      onClick={() => handleStatusChange("true")}
                    >
                      Active
                      {selectedStatus === "true" && (
                        <i className="bi bi-check-lg"></i>
                      )}
                    </button>
                    <button
                      className={`${s.filterDropdownItem} ${selectedStatus === "false" ? s.active : ""}`}
                      onClick={() => handleStatusChange("false")}
                    >
                      Inactive
                      {selectedStatus === "false" && (
                        <i className="bi bi-check-lg"></i>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={s.actions}>
              {/* Add Setting Button */}
              <button
                className={s.addBtn}
                onClick={() => navigate("/admin/add-setting")}
              >
                <i className="bi bi-plus-lg"></i>
                <span>Add Setting</span>
              </button>
            </div>
          </div>

          {/* Results Info */}
          <div className={s.resultsInfo}>
            Showing {settings.length} setting
            {settings.length !== 1 ? "s" : ""}
          </div>

          {/* Settings Table */}
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort("id")}
                    style={{ cursor: "pointer" }}
                  >
                    ID
                  </th>
                  <th
                    onClick={() => handleSort("name")}
                    style={{ cursor: "pointer" }}
                  >
                    Name
                  </th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {settings.length > 0 ? (
                  settings.map((setting) => (
                    <tr key={setting.id}>
                      <td>{setting.id}</td>
                      <td className={s.nameCell}>
                        <div className={s.nameInfo}>
                          <span className={s.nameTitle}>{setting.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={s.typeBadge}>
                          {setting.parent ? (
                            <>{setting.parent?.name}</>
                          ) : (
                            <>-</>
                          )}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${s.statusBadge} ${getStatusBadgeClass(setting.status)}`}
                        >
                          {getStatus(setting.status)}
                        </span>
                      </td>
                      <td>
                        <div className={s.actionBtns}>
                          <button
                            className={s.actionBtn}
                            onClick={() => handleEditSetting(setting.id)}
                            title="Edit setting"
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          {setting.status ? (
                            <button
                              className={`${s.actionBtn} ${s.dangerBtn}`}
                              onClick={() => toggleStatus(setting.id)}
                              title="Deactivate setting"
                            >
                              <i className="bi bi-x-circle-fill"></i>
                            </button>
                          ) : (
                            <button
                              className={`${s.actionBtn} ${s.successBtn}`}
                              onClick={() => toggleStatus(setting.id)}
                              title="Activate setting"
                            >
                              <i className="bi bi-check-circle-fill"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className={s.emptyState}>
                      <i className="bi bi-gear"></i>
                      <p>No settings found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
