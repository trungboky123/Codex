import React, { useState, useEffect, useRef } from "react";
import s from "../css/ClassList.module.scss";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSideBar";

export default function ClassListPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedInstructor, setSelectedInstructor] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Dropdown
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const toolsDropdownRef = useRef(null);

  // Sorting
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // Categories and Instructors for filters
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [
    classes,
    searchTerm,
    selectedCategory,
    selectedInstructor,
    selectedStatus,
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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchClasses = async () => {
    // Mock data - Replace with API call
    const mockClasses = [
      {
        id: 1,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=120&fit=crop",
        name: "React Bootcamp - Spring 2025",
        categories: [
          { id: 1, name: "Web Development" },
          { id: 2, name: "JavaScript" },
        ],
        instructor: { id: 1, fullName: "John Doe" },
        startDate: "2025-03-01",
        endDate: "2025-05-30",
        status: "ACTIVE",
      },
      {
        id: 2,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=200&h=120&fit=crop",
        name: "Python Data Science Workshop",
        categories: [
          { id: 3, name: "Data Science" },
          { id: 4, name: "Python" },
        ],
        instructor: { id: 2, fullName: "Jane Smith" },
        startDate: "2025-02-15",
        endDate: "2025-04-15",
        status: "ACTIVE",
      },
      {
        id: 3,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&h=120&fit=crop",
        name: "Backend Development Intensive",
        categories: [
          { id: 1, name: "Web Development" },
          { id: 5, name: "Backend" },
        ],
        instructor: { id: 1, fullName: "John Doe" },
        startDate: "2025-04-01",
        endDate: "2025-06-30",
        status: "ACTIVE",
      },
      {
        id: 4,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=120&fit=crop",
        name: "Machine Learning Fundamentals",
        categories: [
          { id: 3, name: "Data Science" },
          { id: 6, name: "AI/ML" },
        ],
        instructor: { id: 3, fullName: "Mike Johnson" },
        startDate: "2025-01-15",
        endDate: "2025-03-15",
        status: "INACTIVE",
      },
      {
        id: 5,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&h=120&fit=crop",
        name: "Full Stack Development - Winter Cohort",
        categories: [
          { id: 1, name: "Web Development" },
          { id: 7, name: "Full Stack" },
        ],
        instructor: { id: 2, fullName: "Jane Smith" },
        startDate: "2025-01-10",
        endDate: "2025-04-10",
        status: "ACTIVE",
      },
      {
        id: 6,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&h=120&fit=crop",
        name: "React Native Mobile Development",
        categories: [
          { id: 8, name: "Mobile Development" },
          { id: 2, name: "JavaScript" },
        ],
        instructor: { id: 4, fullName: "Sarah Wilson" },
        startDate: "2025-03-15",
        endDate: "2025-06-15",
        status: "ACTIVE",
      },
      {
        id: 7,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=120&fit=crop",
        name: "Digital Marketing Crash Course",
        categories: [
          { id: 9, name: "Marketing" },
          { id: 10, name: "Business" },
        ],
        instructor: { id: 5, fullName: "David Brown" },
        startDate: "2025-02-01",
        endDate: "2025-03-30",
        status: "ACTIVE",
      },
      {
        id: 8,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=200&h=120&fit=crop",
        name: "UI/UX Design Bootcamp",
        categories: [
          { id: 11, name: "Design" },
          { id: 12, name: "UI/UX" },
        ],
        instructor: { id: 6, fullName: "Emily Davis" },
        startDate: "2024-12-01",
        endDate: "2025-02-28",
        status: "INACTIVE",
      },
      {
        id: 9,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=200&h=120&fit=crop",
        name: "AWS Cloud Practitioner Training",
        categories: [
          { id: 13, name: "Cloud" },
          { id: 14, name: "DevOps" },
        ],
        instructor: { id: 3, fullName: "Mike Johnson" },
        startDate: "2025-02-20",
        endDate: "2025-05-20",
        status: "ACTIVE",
      },
      {
        id: 10,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=120&fit=crop",
        name: "Blockchain Development Workshop",
        categories: [
          { id: 15, name: "Blockchain" },
          { id: 16, name: "Cryptocurrency" },
        ],
        instructor: { id: 4, fullName: "Sarah Wilson" },
        startDate: "2025-04-15",
        endDate: "2025-07-15",
        status: "ACTIVE",
      },
    ];

    setClasses(mockClasses);
    setFilteredClasses(mockClasses);

    // Extract unique categories and instructors for filters
    const uniqueCategories = [];
    const categoryMap = new Map();
    mockClasses.forEach((clazz) => {
      clazz.categories.forEach((cat) => {
        if (!categoryMap.has(cat.id)) {
          categoryMap.set(cat.id, cat);
          uniqueCategories.push(cat);
        }
      });
    });
    setCategories(uniqueCategories);

    const uniqueInstructors = [];
    const instructorMap = new Map();
    mockClasses.forEach((clazz) => {
      if (!instructorMap.has(clazz.instructor.id)) {
        instructorMap.set(clazz.instructor.id, clazz.instructor);
        uniqueInstructors.push(clazz.instructor);
      }
    });
    setInstructors(uniqueInstructors);
  };

  const filterClasses = () => {
    let filtered = [...classes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((clazz) =>
        clazz.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((clazz) =>
        clazz.categories.some((cat) => cat.id === parseInt(selectedCategory)),
      );
    }

    // Instructor filter
    if (selectedInstructor !== "all") {
      filtered = filtered.filter(
        (clazz) => clazz.instructor.id === parseInt(selectedInstructor),
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((clazz) => clazz.status === selectedStatus);
    }

    setFilteredClasses(filtered);
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
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

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sorted classes
  const getSortedClasses = () => {
    if (!sortField) return filteredClasses;

    const sorted = [...filteredClasses].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "id":
          aValue = a.id;
          bValue = b.id;
          break;
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "startDate":
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        case "endDate":
          aValue = new Date(a.endDate);
          bValue = new Date(b.endDate);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  // Render sort icon
  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <i className={`bi bi-arrow-down-up ${s.sortIcon}`}></i>;
    }
    return sortDirection === "asc" ? (
      <i className={`bi bi-arrow-up ${s.sortIcon} ${s.active}`}></i>
    ) : (
      <i className={`bi bi-arrow-down ${s.sortIcon} ${s.active}`}></i>
    );
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
    return status === "ACTIVE" ? s.statusActive : s.statusInactive;
  };

  const sortedClasses = getSortedClasses();

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
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={s.filterSelect}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Instructor Filter */}
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className={s.filterSelect}
              >
                <option value="all">All Instructors</option>
                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.fullName}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={s.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
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
            Showing {filteredClasses.length} class
            {filteredClasses.length !== 1 ? "es" : ""}
          </div>

          {/* Classes Table */}
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.sortable} onClick={() => handleSort("id")}>
                    <div className={s.thContent}>
                      <span>ID</span>
                      {renderSortIcon("id")}
                    </div>
                  </th>
                  <th>Thumbnail</th>
                  <th className={s.sortable} onClick={() => handleSort("name")}>
                    <div className={s.thContent}>
                      <span>Class Name</span>
                      {renderSortIcon("name")}
                    </div>
                  </th>
                  <th>Categories</th>
                  <th>Instructor</th>
                  <th
                    className={s.sortable}
                    onClick={() => handleSort("startDate")}
                  >
                    <div className={s.thContent}>
                      <span>Start Date</span>
                      {renderSortIcon("startDate")}
                    </div>
                  </th>
                  <th
                    className={s.sortable}
                    onClick={() => handleSort("endDate")}
                  >
                    <div className={s.thContent}>
                      <span>End Date</span>
                      {renderSortIcon("endDate")}
                    </div>
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedClasses.length > 0 ? (
                  sortedClasses.map((clazz) => (
                    <tr key={clazz.id}>
                      <td>{clazz.id}</td>
                      <td>
                        <img
                          src={clazz.thumbnailUrl}
                          alt={clazz.name}
                          className={s.thumbnail}
                        />
                      </td>
                      <td className={s.nameCell}>{clazz.name}</td>
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
                          {clazz.status}
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
                          {clazz.status === "ACTIVE" ? (
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
