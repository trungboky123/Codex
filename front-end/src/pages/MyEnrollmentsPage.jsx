import React, { useEffect, useState, useRef } from "react";
import s from "../css/MyEnrollments.module.scss";
import { useNavigate, useSearchParams } from "react-router-dom";
import authFetch from "../function/authFetch";

export default function MyEnrollmentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Init activeTab from URL param 'type', default to 'courses'
  const [activeTab, setActiveTab] = useState(
    searchParams.get("type") || "courses",
  );
  const [filteredItems, setFilteredItems] = useState([]);
  const [courseItems, setCourseItems] = useState([]);
  const [classItems, setClassItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("keyword") || "",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");
  const [sortDir, setSortDir] = useState(
    searchParams.get("sortDir") || "default",
  );
  const [loading, setLoading] = useState(true);

  const sortDropdownRef = useRef(null);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const sortOptions = [
    { field: "", value: "default", label: "Default", icon: "bi-grid" },
    {
      field: "enrolledAt",
      value: "desc",
      label: "Newest First",
      icon: "bi-sort-down",
    },
    {
      field: "enrolledAt",
      value: "asc",
      label: "Oldest First",
      icon: "bi-sort-up",
    },
  ];

  const selectedSort =
    sortOptions.find((o) => o.value === sortDir) ?? sortOptions[0];

  useEffect(() => {
    const t = setTimeout(() => fetchItems(), 300);
    return () => clearTimeout(t);
  }, [searchQuery, sortBy, sortDir]);

  // Sync URL params whenever filters or tab change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("type", activeTab); // Always include type
    if (searchQuery) params.set("keyword", searchQuery);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortDir !== "default") params.set("sortDir", sortDir);
    setSearchParams(params, { replace: true });
  }, [activeTab, searchQuery, sortBy, sortDir]);

  useEffect(() => {
    applyFilters();
  }, [courseItems, classItems, sortBy, activeTab, searchQuery, sortDir]);

  useEffect(() => {
    const handler = (e) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target)
      )
        setSortDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function fetchItems() {
    setLoading(true);
    const params = new URLSearchParams();

    if (searchQuery.trim() !== "") {
      params.set("keyword", searchQuery.trim());
    }
    if (sortBy) {
      params.set("sortBy", sortBy);
    }
    if (sortDir !== "default") {
      params.set("sortDir", sortDir);
    }

    try {
      const res = await authFetch(
        `http://localhost:8080/enrollments/user?${params.toString()}`,
        { method: "GET" },
      );
      const data = await res.json();
      setCourseItems(data.filter((item) => item.type === "Course"));
      setClassItems(data.filter((item) => item.type === "Class"));
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let items = activeTab === "courses" ? [...courseItems] : [...classItems];
    setFilteredItems(items);
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
  }

  function handleSortSelect(option) {
    setSortBy(option.field);
    setSortDir(option.value);
    setSortDropdownOpen(false);
  }

  function handleReset() {
    setSearchQuery("");
    setSortBy("");
    setSortDir("default");
  }

  async function handleViewDetails(itemId, type) {
    try {
      if (type === "Course") {
        const res = await fetch(`http://localhost:8080/courses/${itemId}`);
        const data = await res.json();
        navigate(`/public-course-details/${data.slug}/${itemId}`);
      } else {
        const res = await fetch(`http://localhost:8080/classes/${itemId}`);
        const data = await res.json();
        navigate(`/public-class-details/${data.slug}/${itemId}`);
      }
    } catch (err) {
      console.error("Error fetching item details:", err);
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const hasActiveFilters =
    !!searchQuery || sortBy !== "" || sortDir !== "default";

  return (
    <>
      <title>My Enrollments</title>
      <div className={s.wishlist}>
        <div className="container">
          {/* Header */}
          <div className={s.header}>
            <div className={s.headerContent}>
              <h1 className={s.title}>
                <i className="bi bi-journal-bookmark-fill"></i>
                My Enrollments
              </h1>
              <p className={s.subtitle}>
                View and manage your enrolled courses and classes.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className={s.tabs}>
            <button
              className={`${s.tab} ${activeTab === "courses" ? s.tabActive : ""}`}
              onClick={() => handleTabChange("courses")}
            >
              <i className="bi bi-book"></i>
              <span>Courses</span>
              <span className={s.tabCount}>{courseItems.length}</span>
            </button>
            <button
              className={`${s.tab} ${activeTab === "classes" ? s.tabActive : ""}`}
              onClick={() => handleTabChange("classes")}
            >
              <i className="bi bi-people"></i>
              <span>Classes</span>
              <span className={s.tabCount}>{classItems.length}</span>
            </button>
          </div>

          {/* Filters */}
          <div className={s.filters}>
            <div className={s.filterGroup}>
              {/* Search */}
              <div className={s.searchBox}>
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder={`Search ${activeTab}…`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Sort dropdown */}
              <div className={s.dropdown} ref={sortDropdownRef}>
                <button
                  className={`${s.filterBtn} ${sortDropdownOpen ? s.filterBtnOpen : ""} ${sortBy ? s.filterBtnActive : ""}`}
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                >
                  <i className={`bi ${selectedSort.icon}`}></i>
                  <span>{selectedSort.label}</span>
                  <i
                    className={`bi bi-chevron-down ${sortDropdownOpen ? s.rotate : ""}`}
                  ></i>
                </button>

                {sortDropdownOpen && (
                  <div className={s.dropdownMenu}>
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        className={`${s.dropdownItem} ${sortDir === opt.value ? s.dropdownItemActive : ""}`}
                        onClick={() => handleSortSelect(opt)}
                      >
                        <span className={s.dropdownItemLeft}>
                          <i className={`bi ${opt.icon}`}></i>
                          {opt.label}
                        </span>
                        {sortDir === opt.value && (
                          <i className="bi bi-check-lg"></i>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset */}
              {hasActiveFilters && (
                <button className={s.resetBtn} onClick={handleReset}>
                  <i className="bi bi-x-circle"></i>
                  Reset
                </button>
              )}
            </div>

            <p className={s.resultCount}>
              {loading
                ? "Loading…"
                : `${filteredItems.length} item${filteredItems.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {/* Content */}
          <div className={s.content}>
            {loading ? (
              <div className={s.loading}>
                <div className={s.spinner}></div>
                <p>Loading your enrollments…</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className={s.empty}>
                <i className="bi bi-inbox"></i>
                <h3>No Items Found</h3>
                <p>
                  {hasActiveFilters
                    ? "No items match your filters. Try adjusting your search."
                    : `You haven't enrolled in any ${activeTab} yet.`}
                </p>
                {hasActiveFilters ? (
                  <button className={s.emptyBtn} onClick={handleReset}>
                    Clear Filters
                  </button>
                ) : (
                  <button
                    className={s.emptyBtn}
                    onClick={() =>
                      navigate(
                        activeTab === "courses" ? "/courses" : "/classes",
                      )
                    }
                  >
                    Browse {activeTab === "courses" ? "Courses" : "Classes"}
                  </button>
                )}
              </div>
            ) : (
              <div className={s.grid}>
                {filteredItems.map((item) => (
                  <div key={item.itemId} className={s.card}>
                    <div className={s.cardImage}>
                      <img src={item.thumbnailUrl} alt={item.name} />
                    </div>

                    <div className={s.cardBody}>
                      <div className={s.cardHeader}>
                        <h3 className={s.cardTitle}>{item.name}</h3>
                      </div>

                      {/* Category tags */}
                      {item.categories?.length > 0 && (
                        <div className={s.categoryTags}>
                          {item.categories.map((cat) => (
                            <span key={cat.id} className={s.categoryTag}>
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className={s.cardFooter}>
                        <div className={s.addedDate}>
                          <i className="bi bi-calendar-check"></i>
                          <span>Enrolled {formatDate(item.enrolledAt)}</span>
                        </div>

                        <button
                          className={s.viewBtn}
                          onClick={() =>
                            handleViewDetails(item.itemId, item.type)
                          }
                        >
                          {item.type === "Course" ? "Learn" : "Details"}
                          <i className="bi bi-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
