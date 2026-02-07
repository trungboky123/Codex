import React, { useState, useEffect, useRef } from "react";
import s from "../css/ClassList.module.scss";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSideBar";
import { Link, useSearchParams } from "react-router-dom";
import authFetch from "../function/authFetch";

export default function ClassListPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [classes, setClasses] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  // Filters
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("keyword") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedCategoryName, setSelectedCategoryName] = useState(
    searchParams.get("category") || "",
  );
  const [selectedInstructor, setSelectedInstructor] = useState(0);
  const [selectedInstructorName, setSelectedInstructorName] = useState(
    searchParams.get("instructor") || "",
  );
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStatusName, setSelectedStatusName] = useState(
    searchParams.get("status") || "",
  );

  // Dropdown
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const toolsDropdownRef = useRef(null);

  // Categories and Instructors for filters
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
      getAllCategories();
      getAllInstructors();
    }, []);

  useEffect(() => {
    getAllClasses();
  }, [searchTerm, selectedCategory, selectedInstructor, selectedStatus, sortBy, sortDir]);

  // Close dropdown when clicking outside
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
    if (searchTerm) params.set("keyword", searchTerm);
    if (selectedCategoryName) params.set("category", selectedCategoryName);
    if (selectedInstructorName) params.set("instructor", selectedInstructorName);
    if (selectedStatusName) params.set("status", selectedStatusName);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortDir) params.set("sortDir", sortDir);
  
    setSearchParams(params, {replace: true});
   }, [searchTerm, selectedCategory, selectedInstructor, selectedStatus, sortBy,sortDir]);

  async function getAllClasses() {
    const params = new URLSearchParams();
    if (searchTerm.trim() !== "") {
      params.set("keyword", searchTerm);
    }
  
    if (selectedCategory !== 0) {
      params.set("categoryId", selectedCategory);
    }
  
    if (selectedInstructor !== 0) {
      params.set("instructorId", selectedInstructor);
    }
  
    if (selectedStatus !== "all") {
        params.set("status", selectedStatus);
    }
    if (sortBy) params.set("sortBy", sortBy);
    if (sortDir) params.set("sortDir", sortDir);
    const res = await authFetch(`http://localhost:8080/classes/admin/getAll?${params.toString()}`, {
      method: "GET"
    });
    const data = await res.json();
    setClasses(data);
  };

  async function getAllCategories() {
    const res = await authFetch("http://localhost:8080/settings/categories", {
      method: "GET"
    });
    const data = await res.json();
    setCategories(data);
  };

  async function getAllInstructors() {
    const res = await authFetch("http://localhost:8080/users/instructors/getAll", {
      method: "GET"
    });
    const data = await res.json();
    setInstructors(data);
  };

  const getStatus = (status) => {
    return status ? "Active" : "Inactive";
  }

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleInstructorChange = (instructorId) => {
    if (instructorId !== 0) {
      setSelectedInstructorName(instructors.find((inst) => inst.id === instructorId).fullName);
    }
    else {
      setSelectedInstructorName("");
    }

    setSelectedInstructor(instructorId);
  }

  const handleCategoryChange = (categoryId) => {
    if (categoryId !== 0) {
      setSelectedCategoryName(categories.find((c) => c.id === categoryId).name);
    }
    else {
      setSelectedCategoryName("");
    }

    setSelectedCategory(categoryId);
  }

  const handleStatusChange = (selectedStatus) => {
    if (selectedStatus !== "all") {
      setSelectedStatusName(selectedStatus === "true" ? "Active" : "Inactive");
    }
    else {
      setSelectedStatusName("");
    }

    setSelectedStatus(selectedStatus);
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    }
    else {
      setSortBy(field);
      setSortDir("asc");
    }
  }

  const toggleStatus = async(classId) => {
    const course = classes.find((c) => c.id === classId);
    if (!course) return;
  
    const ok = window.confirm(course.status ? "Deactivate this class?" : "Activate this class?");
    if (!ok) return;
    await authFetch(`http://localhost:8080/classes/status/${classId}`, {
      method: "PUT"
    });
  
    getAllClasses();
    };

  const handleAddClass = () => {
    console.log("Add new class");
  };

  const handleDownloadTemplate = () => {
    console.log("Download import template");
  };

  const handleImportClasses = () => {
    console.log("Import classes");
  };

  const handleEditClass = (classId) => {
    console.log("Edit class:", classId);
  };

  const handleToggleStatus = (classId) => {
    console.log("Toggle class status:", classId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadgeClass = (status) => {
    return status ? s.statusActive : s.statusInactive;
  };

  return (
    <>
      <title>Class List</title>
      <AdminHeader sidebarCollapsed={sidebarCollapsed} />
      <AdminSidebar onCollapseChange={handleSidebarCollapse} />

      <div
        className={s.classes}
        style={{
          marginLeft: sidebarCollapsed ? "85px" : "280px",
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className={s.container}>
          {/* Header */}
          <div className={s.header}>
            <div>
              <h1 className={s.title}>Class List</h1>
              <p className={s.subtitle}>Manage all classes</p>
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
                  placeholder="Search by class name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={s.searchInput}
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(Number(e.target.value))}
                className={s.filterSelect}
              >
                <option value={0}>All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Instructor Filter */}
              <select
                value={selectedInstructor}
                onChange={(e) => handleInstructorChange(Number(e.target.value))}
                className={s.filterSelect}
              >
                <option value={0}>All Instructors</option>
                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.fullName}
                  </option>
                ))}
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
                      onClick={handleImportClasses}
                    >
                      <i className="bi bi-upload"></i>
                      <span>Import Classes</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Add Class Button */}
              <button className={s.addBtn} onClick={handleAddClass}>
                <i className="bi bi-plus-lg"></i>
                <span>Add Class</span>
              </button>
            </div>
          </div>

          {/* Results Info */}
          <div className={s.resultsInfo}>
            Showing {classes.length} class
            {classes.length !== 1 ? "es" : ""}
          </div>

          {/* Classes Table */}
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th onClick={() => handleSort("id")} style={{cursor: "pointer"}}>ID</th>
                  <th>Thumbnail</th>
                  <th onClick={() => handleSort("name")} style={{cursor: "pointer"}}>Class Name</th>
                  <th>Categories</th>
                  <th>Instructor</th>
                  <th onClick={() => handleSort("startDate")} style={{cursor: "pointer"}}>Start Date</th>
                  <th onClick={() => handleSort("endDate")} style={{cursor: "pointer"}}>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.length > 0 ? (
                  classes.map((clazz) => (
                    <tr key={clazz.id}>
                      <td>{clazz.id}</td>
                      <td>
                        <img
                          src={clazz.thumbnailUrl}
                          alt={clazz.name}
                          className={s.thumbnail}
                        />
                      </td>
                      <td className={s.nameCell}>
                        <Link to={`/public-class-details/${clazz.slug}/${clazz.id}`}>
                          {clazz.name}
                        </Link>
                      </td>
                      <td>
                        <div className={s.categoryTags}>
                          {clazz.categories.map((category) => (
                            <span key={category.id} className={s.categoryTag}>
                              {category.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{clazz.instructor.fullName}</td>
                      <td className={s.dateCell}>
                        {formatDate(clazz.startDate)}
                      </td>
                      <td className={s.dateCell}>
                        {formatDate(clazz.endDate)}
                      </td>
                      <td>
                        <span
                          className={`${s.statusBadge} ${getStatusBadgeClass(clazz.status)}`}
                        >
                          {getStatus(clazz.status)}
                        </span>
                      </td>
                      <td>
                        <div className={s.actionBtns}>
                          <button
                            className={s.actionBtn}
                            onClick={() => handleEditClass(clazz.id)}
                            title="Edit class"
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          {clazz.status ? (
                            <button
                              className={`${s.actionBtn} ${s.dangerBtn}`}
                              onClick={() => handleToggleStatus(clazz.id)}
                              title="Deactivate class"
                            >
                              <i className="bi bi-x-circle-fill"></i>
                            </button>
                          ) : (
                            <button
                              className={`${s.actionBtn} ${s.successBtn}`}
                              onClick={() => handleToggleStatus(clazz.id)}
                              title="Activate class"
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
                    <td colSpan="9" className={s.emptyState}>
                      <i className="bi bi-inbox"></i>
                      <p>No classes found</p>
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
