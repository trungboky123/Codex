import React, { useState, useEffect, useRef } from "react";
import s from "../css/CourseList.module.scss";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSideBar";
import authFetch from "../function/authFetch";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function CourseListPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [courses, setCourses] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [importDetails, setImportDetails] = useState({
    total: "",
    success: "",
    failed: "",
    errors: [],
  });
  const [importErrors, setImportErrors] = useState([]);

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
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [instructorDropdownOpen, setInstructorDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const toolsDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const instructorDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Categories and Instructors for filters
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    getAllCategories();
    getAllInstructors();
  }, []);

  useEffect(() => {
    getAllCourses();
  }, [
    searchTerm,
    selectedCategory,
    selectedInstructor,
    selectedStatus,
    sortBy,
    sortDir,
  ]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("keyword", searchTerm);
    if (selectedCategoryName) params.set("category", selectedCategoryName);
    if (selectedInstructorName)
      params.set("instructor", selectedInstructorName);
    if (selectedStatusName) params.set("status", selectedStatusName);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortDir) params.set("sortDir", sortDir);

    setSearchParams(params, { replace: true });
  }, [
    searchTerm,
    selectedCategory,
    selectedInstructor,
    selectedStatus,
    sortBy,
    sortDir,
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        toolsDropdownRef.current &&
        !toolsDropdownRef.current.contains(event.target)
      ) {
        setToolsDropdownOpen(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setCategoryDropdownOpen(false);
      }
      if (
        instructorDropdownRef.current &&
        !instructorDropdownRef.current.contains(event.target)
      ) {
        setInstructorDropdownOpen(false);
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
    const res = await authFetch(
      `http://localhost:8080/courses/admin/getAll?${params.toString()}`,
      {
        method: "GET",
      },
    );
    const data = await res.json();
    setCourses(data);
  }

  async function getAllCategories() {
    const res = await authFetch("http://localhost:8080/settings/categories", {
      method: "GET",
    });
    const data = await res.json();
    setCategories(data);
  }

  async function getAllInstructors() {
    const res = await authFetch(
      "http://localhost:8080/users/instructors/getAll",
      {
        method: "GET",
      },
    );
    const data = await res.json();
    setInstructors(data);
  }

  const getStatus = (status) => {
    return status ? "Active" : "Inactive";
  };

  const handleEditCourse = (courseId) => {
    navigate(`/admin/edit-course/${courseId}`);
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleDownloadTemplate = async () => {
    const res = await authFetch(
      "http://localhost:8080/courses/download-template",
      {
        method: "GET",
      },
    );
    const blob = await res.blob();
    const url = window.URL.createObjectURL(new Blob([blob]));
    const a = document.createElement("a");
    a.href = url;
    a.download = "course_template.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleImportCourses = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await authFetch("http://localhost:8080/courses/import", {
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
      `Successfully imported ${data.success} of ${data.total} courses.`,
    );
    setMessageType(data.failed > 0 ? "warning" : "success");
    setImportErrors(data.errors);
    getAllCourses();
    e.target.value = "";
  };

  const handleCloseMessage = () => {
    setMessage("");
    setImportDetails({ total: "", success: "", failed: "", errors: [] });
    setImportErrors([]);
  };

  const handleInstructorChange = (instructorId) => {
    if (instructorId !== 0) {
      setSelectedInstructorName(
        instructors.find((inst) => inst.id === instructorId).fullName,
      );
    } else {
      setSelectedInstructorName("");
    }

    setSelectedInstructor(instructorId);
  };

  const handleCategoryChange = (categoryId) => {
    if (categoryId !== 0) {
      setSelectedCategoryName(categories.find((c) => c.id === categoryId).name);
    } else {
      setSelectedCategoryName("");
    }

    setSelectedCategory(categoryId);
  };

  const handleStatusChange = (selectedStatus) => {
    if (selectedStatus !== "all") {
      setSelectedStatusName(selectedStatus === "true" ? "Active" : "Inactive");
    } else {
      setSelectedStatusName("");
    }

    setSelectedStatus(selectedStatus);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const toggleStatus = async (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const ok = window.confirm(
      course.status ? "Deactivate this course?" : "Activate this course?",
    );
    if (!ok) return;
    await authFetch(`http://localhost:8080/courses/status/${courseId}`, {
      method: "PUT",
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
              <p className={s.subtitle}>Manage all courses</p>
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
                  placeholder="Search by course name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={s.searchInput}
                />
              </div>

              {/* Category Filter */}
              <div className={s.dropdown} ref={categoryDropdownRef}>
                <button
                  className={s.filterBtn}
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                >
                  <span>{selectedCategoryName || "All Categories"}</span>
                  <i
                    className={`bi bi-chevron-down ${categoryDropdownOpen ? s.rotate : ""}`}
                  ></i>
                </button>

                {categoryDropdownOpen && (
                  <div className={s.filterDropdownMenu}>
                    <button
                      className={`${s.filterDropdownItem} ${selectedCategory === 0 ? s.active : ""}`}
                      onClick={() => {
                        handleCategoryChange(0);
                        setCategoryDropdownOpen(false);
                      }}
                    >
                      All Categories
                      {selectedCategory === 0 && (
                        <i className="bi bi-check-lg"></i>
                      )}
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        className={`${s.filterDropdownItem} ${selectedCategory === category.id ? s.active : ""}`}
                        onClick={() => {
                          handleCategoryChange(category.id);
                          setCategoryDropdownOpen(false);
                        }}
                      >
                        {category.name}
                        {selectedCategory === category.id && (
                          <i className="bi bi-check-lg"></i>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Instructor Filter */}
              <div className={s.dropdown} ref={instructorDropdownRef}>
                <button
                  className={s.filterBtn}
                  onClick={() =>
                    setInstructorDropdownOpen(!instructorDropdownOpen)
                  }
                >
                  <span>{selectedInstructorName || "All Instructors"}</span>
                  <i
                    className={`bi bi-chevron-down ${instructorDropdownOpen ? s.rotate : ""}`}
                  ></i>
                </button>

                {instructorDropdownOpen && (
                  <div className={s.filterDropdownMenu}>
                    <button
                      className={`${s.filterDropdownItem} ${selectedInstructor === 0 ? s.active : ""}`}
                      onClick={() => {
                        handleInstructorChange(0);
                        setInstructorDropdownOpen(false);
                      }}
                    >
                      All Instructors
                      {selectedInstructor === 0 && (
                        <i className="bi bi-check-lg"></i>
                      )}
                    </button>
                    {instructors.map((instructor) => (
                      <button
                        key={instructor.id}
                        className={`${s.filterDropdownItem} ${selectedInstructor === instructor.id ? s.active : ""}`}
                        onClick={() => {
                          handleInstructorChange(instructor.id);
                          setInstructorDropdownOpen(false);
                        }}
                      >
                        {instructor.fullName}
                        {selectedInstructor === instructor.id && (
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
                      onClick={() => {
                        handleStatusChange("all");
                        setStatusDropdownOpen(false);
                      }}
                    >
                      All Status
                      {selectedStatus === "all" && (
                        <i className="bi bi-check-lg"></i>
                      )}
                    </button>
                    <button
                      className={`${s.filterDropdownItem} ${selectedStatus === "true" ? s.active : ""}`}
                      onClick={() => {
                        handleStatusChange("true");
                        setStatusDropdownOpen(false);
                      }}
                    >
                      Active
                      {selectedStatus === "true" && (
                        <i className="bi bi-check-lg"></i>
                      )}
                    </button>
                    <button
                      className={`${s.filterDropdownItem} ${selectedStatus === "false" ? s.active : ""}`}
                      onClick={() => {
                        handleStatusChange("false");
                        setStatusDropdownOpen(false);
                      }}
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
                      <span>Import Courses</span>
                    </button>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls"
                onChange={handleImportCourses}
                style={{ display: "none" }}
              />

              {/* Add Course Button */}
              <button
                className={s.addBtn}
                onClick={() => navigate("/admin/add-course")}
              >
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
                  <th
                    onClick={() => handleSort("id")}
                    style={{ cursor: "pointer" }}
                  >
                    ID
                  </th>
                  <th>Thumbnail</th>
                  <th
                    onClick={() => handleSort("name")}
                    style={{ cursor: "pointer" }}
                  >
                    Course Name
                  </th>
                  <th>Categories</th>
                  <th>Instructor</th>
                  <th
                    onClick={() => handleSort("listedPrice")}
                    style={{ cursor: "pointer" }}
                  >
                    Listed Price
                  </th>
                  <th
                    onClick={() => handleSort("salePrice")}
                    style={{ cursor: "pointer" }}
                  >
                    Sale Price
                  </th>
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
                      <td className={s.nameCell}>
                        <Link
                          to={`/public-course-details/${course.slug}/${course.id}`}
                        >
                          {course.name}
                        </Link>
                      </td>
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
                            onClick={() => handleEditCourse(course.id)}
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
