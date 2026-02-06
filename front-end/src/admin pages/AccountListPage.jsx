import React, { useState, useEffect, useRef } from "react";
import s from "../css/AccountList.module.scss";
import AdminHeader from "../components/AdminHeader";
import AdminSideBar from "../components/AdminSideBar";
import authFetch from "../function/authFetch";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AdminAccounts() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // success or error
  const [importDetails, setImportDetails] = useState({
    total: "",
    success: "",
    failed: "",
    errors: [],
  });
  const [importErrors, setImportErrors] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  // Filters
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("keyword") || "",
  );
  const [selectedRoleName, setSelectedRoleName] = useState(
    searchParams.get("role") || "",
  );
  const [selectedRole, setSelectedRole] = useState(0);
  const [selectedStatusName, setSelectedStatusName] = useState(
    searchParams.get("status") || "",
  );
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Dropdown
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const toolsDropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getAllRoles();
  }, []);

  useEffect(() => {
    getAllUsers();
  }, [searchTerm, selectedRole, selectedStatus, sortBy, sortDir]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        toolsDropdownRef.current &&
        !toolsDropdownRef.current.contains(event.target)
      ) {
        setToolsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedRoleName) params.set("role", selectedRoleName);
    if (searchTerm) params.set("keyword", searchTerm);
    if (selectedStatusName) params.set("status", selectedStatusName);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortDir) params.set("sortDir", sortDir);

    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedRole, selectedStatus, sortBy, sortDir]);

  async function getAllUsers() {
    const params = new URLSearchParams();
    if (searchTerm.trim() !== "") {
      params.set("keyword", searchTerm.trim());
    }
    if (selectedRole !== 0) {
      params.set("roleId", selectedRole);
    }
    if (selectedStatus !== "all") {
      params.set("status", selectedStatus);
    }
    if (sortBy) params.set("sortBy", sortBy);
    if (sortDir) params.set("sortDir", sortDir);
    const res = await authFetch(
      `http://localhost:8080/users/findAll?${params.toString()}`,
      {
        method: "GET",
      },
    );
    const data = await res.json();
    setUsers(data);
  }

  async function getAllRoles() {
    const res = await authFetch("http://localhost:8080/settings/roles", {
      method: "GET",
    });
    const data = await res.json();
    setRoles(data);
  }

  const handleRoleChange = (roleId) => {
    if (roleId !== 0) {
      setSelectedRoleName(roles.find((r) => r.id === roleId).name);
    } else {
      setSelectedRoleName("");
    }

    setSelectedRole(roleId);
  };

  const handleStatusChange = (selectedStatus) => {
    if (selectedStatus !== "all") {
      setSelectedStatusName(selectedStatus === "true" ? "Active" : "Inactive");
    } else {
      setSelectedStatusName("");
    }

    setSelectedStatus(selectedStatus);
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const handleDownloadTemplate = async () => {
    const res = await authFetch(
      "http://localhost:8080/users/download-template",
      {
        method: "GET",
      },
    );
    const blob = await res.blob();
    const url = window.URL.createObjectURL(new Blob([blob]));
    const a = document.createElement("a");
    a.href = url;
    a.download = "account_template.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleImportAccounts = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await authFetch("http://localhost:8080/users/import", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      setMessage(`Import failed: ${errorData.message}`);
      setMessageType("error");
      setImportDetails({ total: "", success: "", failed: "", errors: [] });
      setImportErrors([]);
      return;
    }

    const data = await res.json();
    setImportDetails({
      total: data.total,
      success: data.success,
      failed: data.failed,
      errors: data.errors,
    });
    setMessage(
      `Successfully imported ${data.success} out of ${data.total} accounts.`,
    );
    setMessageType(data.failed > 0 ? "warning" : "success");
    setImportErrors(data.errors);
    getAllUsers();
    e.target.value = "";
  };

  const handleCloseMessage = () => {
    setMessage("");
    setImportDetails({ total: "", success: "", failed: "", errors: [] });
    setImportErrors([]);
  };

  const handleEditAccount = (accountId) => {
    navigate(`/admin/edit-account?id=${accountId}`);
  };

  const toggleStatus = async (accountId) => {
    const account = users.find((account) => account.id === accountId);
    if (!account) return;
    const ok = window.confirm(
      account.status ? "Deactivate this account?" : "Activate this account?",
    );

    if (!ok) return;
    await authFetch(`http://localhost:8080/users/status/${accountId}`, {
      method: "PUT",
    });

    getAllUsers();
  };

  const getRoleBadgeClass = (role) => {
    const roleClasses = {
      Admin: s.roleAdmin,
      Instructor: s.roleInstructor,
      User: s.roleUser,
    };
    return roleClasses[role] || s.roleUser;
  };

  const getStatusBadgeClass = (status) => {
    return status ? s.statusActive : s.statusInactive;
  };

  const getStatus = (status) => {
    return status ? "Active" : "Inactive";
  };

  return (
    <>
      <title>Account List</title>
      <AdminHeader sidebarCollapsed={sidebarCollapsed} />
      <AdminSideBar onCollapseChange={handleSidebarCollapse} />

      <div
        className={s.accounts}
        style={{
          marginLeft: sidebarCollapsed ? "85px" : "280px",
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className={s.container}>
          {/* Header */}
          <div className={s.header}>
            <div>
              <h1 className={s.title}>Account List</h1>
              <p className={s.subtitle}>Manage all accounts</p>
            </div>
          </div>

          {/* Import Message */}
          {message && (
            <div
              className={`${s.messageBox} ${s[`message${messageType.charAt(0).toUpperCase() + messageType.slice(1)}`]}`}
            >
              <div className={s.messageContent}>
                <i
                  className={
                    messageType === "success"
                      ? "bi bi-check-circle-fill"
                      : messageType === "warning"
                        ? "bi bi-exclamation-triangle-fill"
                        : "bi bi-x-circle-fill"
                  }
                ></i>
                <div className={s.messageText}>
                  <p className={s.messageTitle}>{message}</p>
                  {importDetails.total && (
                    <div className={s.importStats}>
                      <span>Total: {importDetails.total}</span>
                      <span>•</span>
                      <span className={s.successText}>
                        Success: {importDetails.success}
                      </span>
                      {importDetails.failed > 0 && (
                        <>
                          <span>•</span>
                          <span className={s.failedText}>
                            Failed: {importDetails.failed}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button className={s.closeBtn} onClick={handleCloseMessage}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          )}

          {/* Import Errors */}
          {importErrors.length > 0 && (
            <div className={s.errorsBox}>
              <h3 className={s.errorsTitle}>
                <i className="bi bi-exclamation-circle"></i>
                Import Errors ({importErrors.length})
              </h3>
              <div className={s.errorsList}>
                {importErrors.map((error, index) => (
                  <div key={index} className={s.errorItem}>
                    <span className={s.errorRow}>{error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters & Actions */}
          <div className={s.toolbar}>
            <div className={s.filters}>
              {/* Search */}
              <div className={s.searchBox}>
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Search by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={s.searchInput}
                />
              </div>

              {/* Role Filter */}
              <select
                value={selectedRole}
                onChange={(e) => handleRoleChange(Number(e.target.value))}
                className={s.filterSelect}
              >
                <option value={0}>All Roles</option>
                {roles.map((role) => {
                  return (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  );
                })}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={s.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className={s.actions}>
              {/* Tools Dropdown */}
              <div className={s.dropdown} ref={toolsDropdownRef}>
                <button
                  className={s.toolsBtn}
                  onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                >
                  <i className="bi bi-gear-fill"></i>
                  <span>Tools</span>
                  <i
                    className={`bi bi-chevron-down ${toolsDropdownOpen ? s.rotate : ""}`}
                  ></i>
                </button>

                {toolsDropdownOpen && (
                  <div className={s.dropdownMenu}>
                    <button
                      className={s.dropdownItem}
                      onClick={handleDownloadTemplate}
                    >
                      <i className="bi bi-download"></i>
                      <span>Download Import Template</span>
                    </button>
                    <button
                      className={s.dropdownItem}
                      onClick={handleImportClick}
                    >
                      <i className="bi bi-upload"></i>
                      <span>Import Accounts</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls"
                onChange={handleImportAccounts}
                style={{ display: "none" }}
              />

              <button
                className={s.addBtn}
                onClick={() => navigate("/admin/add-account")}
              >
                <i className="bi bi-plus-lg"></i>
                <span>Add Account</span>
              </button>
            </div>
          </div>

          <div className={s.resultsInfo}>
            Showing {users.length} account
            {users.length !== 1 ? "s" : ""}
          </div>

          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort("id")}
                    style={{ cursor: "pointer" }}
                  >
                    ID
                    {sortBy === "id" && (
                      <i
                        className={`bi bi-arrow-${sortDir === "asc" ? "up" : "down"}`}
                      ></i>
                    )}
                  </th>
                  <th>Avatar</th>
                  <th
                    onClick={() => handleSort("fullName")}
                    style={{ cursor: "pointer" }}
                  >
                    Full Name
                    {sortBy === "fullName" && (
                      <i
                        className={`bi bi-arrow-${sortDir === "asc" ? "up" : "down"}`}
                      ></i>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort("username")}
                    style={{ cursor: "pointer" }}
                  >
                    Username
                    {sortBy === "username" && (
                      <i
                        className={`bi bi-arrow-${sortDir === "asc" ? "up" : "down"}`}
                      ></i>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort("email")}
                    style={{ cursor: "pointer" }}
                  >
                    Email
                    {sortBy === "email" && (
                      <i
                        className={`bi bi-arrow-${sortDir === "asc" ? "up" : "down"}`}
                      ></i>
                    )}
                  </th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((account) => (
                    <tr key={account.id}>
                      <td>{account.id}</td>
                      <td>
                        <img
                          src={account.avatarUrl}
                          alt={account.fullName}
                          className={s.avatar}
                        />
                      </td>
                      <td className={s.nameCell}>{account.fullName}</td>
                      <td>{account.username}</td>
                      <td>{account.email}</td>
                      <td>
                        <span
                          className={`${s.roleBadge} ${getRoleBadgeClass(account.role.name)}`}
                        >
                          {account.role.name}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${s.statusBadge} ${getStatusBadgeClass(account.status)}`}
                        >
                          {getStatus(account.status)}
                        </span>
                      </td>
                      <td>
                        <div className={s.actionBtns}>
                          <button
                            className={s.actionBtn}
                            onClick={() => handleEditAccount(account.id)}
                            title="Edit account"
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          {account.status ? (
                            <button
                              className={`${s.actionBtn} ${s.dangerBtn}`}
                              onClick={() => toggleStatus(account.id)}
                              title="Deactivate account"
                            >
                              <i className="bi bi-x-circle-fill"></i>
                            </button>
                          ) : (
                            <button
                              className={`${s.actionBtn} ${s.successBtn}`}
                              onClick={() => toggleStatus(account.id)}
                              title="Activate account"
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
                    <td colSpan="8" className={s.emptyState}>
                      <i className="bi bi-inbox"></i>
                      <p>No accounts found</p>
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
