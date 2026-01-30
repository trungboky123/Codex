import React, { useState, useEffect, useRef } from "react";
import s from "../css/CourseList.module.scss";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSideBar";
import authFetch from "../function/authFetch";
import { useSearchParams } from "react-router-dom";

export default function CourseListPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [courses, setCourses] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get("keyword") || "");
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedCategoryName, setSelectedCategoryName] = useState(searchParams.get("category") || "");
  const [selectedInstructor, setSelectedInstructor] = useState(0);
  const [selectedInstructorName, setSelectedInstructorName] = useState(searchParams.get("instructor") || "");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStatusName, setSelectedStatusName] = useState(searchParams.get("status") || "");

  // Dropdown
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const toolsDropdownRef = useRef(null);

  // Categories and Instructors for filters
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    getAllCourses();
    getAllCategories();
    getAllInstructors();
  }, []);

  useEffect(() => {
    getAllCourses();
  }, [searchTerm, selectedCategory, selectedInstructor, selectedStatus, sortBy, sortDir]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("keyword", searchTerm);
    if (selectedCategoryName) params.set("category", selectedCategoryName);
    if (selectedInstructorName) params.set("instructor", selectedInstructorName);
    if (selectedStatusName) params.set("status", selectedStatusName);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortDir) params.set("sortDir", sortDir);

    setSearchParams(params, {replace: true});
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

  async function getAllCourses() {
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
    const res = await authFetch(`http://localhost:8080/courses/admin/getAll?${params.toString()}`, {
      method: "GET"
    });
    const data = await res.json();
    setCourses(data);
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

  const toggleStatus = async(courseId) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const ok = window.confirm(course.status ? "Deactivate this course?" : "Activate this course?");
    if (!ok) return;
    await authFetch(`http://localhost:8080/courses/status/${courseId}`, {
      method: "PUT"
    });

    getAllCourses();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    return status ? s.statusActive : s.statusInactive;
  };

  return (
    <>
      <title>Course List</title>
      <AdminHeader sidebarCollapsed={sidebarCollapsed} />
      <AdminSidebar onCollapseChange={handleSidebarCollapse} />

      <div
        className={s.courses}
        style={{
          marginLeft: sidebarCollapsed ? "85px" : "280px",
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className={s.container}>
          {/* Header */}
          <div className={s.header}>
            <div>
              <h1 className={s.title}>Course List</h1>
              <p className={s.subtitle}>
                Manage all courses
              </p>
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
                  placeholder="Search by course name..."
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
                    >
                      <i className="bi bi-download"></i>
                      <span>Download Import Template</span>
                    </button>
                    <button
                      className={s.dropdownItem}
                    >
                      <i className="bi bi-upload"></i>
                      <span>Import Courses</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Add Course Button */}
              <button className={s.addBtn} >
                <i className="bi bi-plus-lg"></i>
                <span>Add Course</span>
              </button>
            </div>
          </div>

          {/* Results Info */}
          <div className={s.resultsInfo}>
            Showing {courses.length} course
            {courses.length !== 1 ? "s" : ""}
          </div>

          {/* Courses Table */}
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th onClick={() => handleSort("id")} style={{cursor: "pointer"}}>ID</th>
                  <th>Thumbnail</th>
                  <th onClick={() => handleSort("name")} style={{cursor: "pointer"}}>Course Name</th>
                  <th>Categories</th>
                  <th>Instructor</th>
                  <th onClick={() => handleSort("listedPrice")} style={{cursor: "pointer"}}>Listed Price</th>
                  <th onClick={() => handleSort("salePrice")} style={{cursor: "pointer"}}>Sale Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <tr key={course.id}>
                      <td>{course.id}</td>
                      <td>
                        <img
                          src={course.thumbnailUrl}
                          alt={course.name}
                          className={s.thumbnail}
                        />
                      </td>
                      <td className={s.nameCell}>{course.name}</td>
                      <td>
                        <div className={s.categoryTags}>
                          {course.categories.map((category) => (
                            <span key={category.id} className={s.categoryTag}>
                              {category.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{course.instructor.fullName}</td>
                      <td className={s.priceCell}>
                        {formatCurrency(course.listedPrice)}
                      </td>
                      <td className={s.priceCell}>
                        {course.salePrice ? (
                          <span className={s.salePrice}>
                            {formatCurrency(course.salePrice)}
                          </span>
                        ) : (
                          <span className={s.noSale}>-</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`${s.statusBadge} ${getStatusBadgeClass(course.status)}`}
                        >
                          {getStatus(course.status)}
                        </span>
                      </td>
                      <td>
                        <div className={s.actionBtns}>
                          <button
                            className={s.actionBtn}
                            title="Edit course"
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          {course.status ? (
                            <button
                              className={`${s.actionBtn} ${s.dangerBtn}`}
                              onClick={() => toggleStatus(course.id)}
                              title="Deactivate course"
                            >
                              <i className="bi bi-x-circle-fill"></i>
                            </button>
                          ) : (
                            <button
                              className={`${s.actionBtn} ${s.successBtn}`}
                              onClick={() => toggleStatus(course.id)}
                              title="Activate course"
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
                      <p>No courses found</p>
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
