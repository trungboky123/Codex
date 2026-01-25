import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import s from "../css/PublicCourses.module.scss";
import Header from "../components/Header";
import Footer from "../components/Footer";

function PublicCoursesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // States
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Filter states - Initialize from URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get("keyword") || "");
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedCategoryParam, setSelectedCategoryParam] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortByPrice") || "default");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const coursesPerPage = 12;

  const from = totalElements === 0 ? 0 : (currentPage - 1) * coursesPerPage + 1;
  const to = Math.min(currentPage * coursesPerPage, totalElements);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch courses when filters change
  useEffect(() => {
    if (categories.length === 0 && selectedCategory !== 0) return;

    const timeout = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, currentPage, selectedCategory, sortBy, categories]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage);

    if(selectedCategoryParam) params.set("category", selectedCategoryParam);

    if (searchTerm) params.set("keyword", searchTerm);
    if (sortBy !== "default") params.set("sortByPrice", sortBy);

    setSearchParams(params, { replace: true });
  }, [currentPage, selectedCategory, searchTerm, sortBy]);

  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  useEffect(() => {
  if (!selectedCategoryParam) return;
  if (categories.length === 0) return;

  const categoryObj = categories.find(
    (c) => c.name === selectedCategoryParam
  );

  setSelectedCategory(categoryObj ? categoryObj.id : 0);
}, [categories, selectedCategoryParam]);

// FETCH CATEGORIES
  const fetchCategories = async () => {
    const res = await fetch("http://localhost:8080/settings/categories");
    const data = await res.json();
    setCategories(data);
  };

// FETCH COURSES
  const fetchCourses = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      params.set("page", currentPage - 1);
      params.set("size", coursesPerPage);

      if (searchTerm.trim() !== "") {
        params.set("keyword", searchTerm.trim());
      }

      if (selectedCategory !== 0) {
        params.set("categoryId", selectedCategory);
      }

      if (sortBy !== "default") {
        params.set("sortByPrice", sortBy);
      }

      const res = await fetch(
        `http://localhost:8080/courses/public?${params.toString()}`,
      );

      const data = await res.json();

      setCourses(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    resetToFirstPage();
  };

  const handleCategoryChange = (categoryId) => {
    if (categoryId !== 0) {
      setSelectedCategoryParam(categories.find((c) => c.id === categoryId).name)
    }
    else {
      setSelectedCategoryParam("");
    }
    setSelectedCategory(categoryId);
    resetToFirstPage();
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    resetToFirstPage();
  };

  const handleViewDetails = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    navigate(`/public-course-details/${course.slug}/${courseId}`);
  };

  const formatPrice = (price) => {
    return price?.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className={s.pagination__button}
      >
        <i className="bi bi-chevron-left"></i>
      </button>,
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className={s.pagination__number}
        >
          1
        </button>,
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className={s.pagination__dots}>
            ...
          </span>,
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`${s.pagination__number} ${i === currentPage ? s.pagination__number_active : ""}`}
        >
          {i}
        </button>,
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="dots2" className={s.pagination__dots}>
            ...
          </span>,
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={s.pagination__number}
        >
          {totalPages}
        </button>,
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        className={s.pagination__button}
      >
        <i className="bi bi-chevron-right"></i>
      </button>,
    );

    return pages;
  };

  return (
    <>
      <title>Public Courses</title>
      <Header />

      <div className={s.courses}>
        <div className={s.courses__container}>
          {/* Header Section */}
          <div className={s.courses__header}>
            <h1 className={s.courses__title}>Public Courses</h1>
            <p className={s.courses__subtitle}>
              Discover and enroll in courses to enhance your skills
            </p>
          </div>

          {/* Filters Section */}
          <div className={s.courses__filters}>
            {/* Search Bar */}
            <div className={s.filters__search}>
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={s.filters__search_input}
              />
            </div>

            {/* Category Filter */}
            <div className={s.filters__category}>
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(Number(e.target.value))}
                className={s.filters__select}
              >
                <option value={0}>All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className={s.filters__sort}>
              <label>Price</label>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className={s.filters__select}
              >
                <option value="default">Default</option>
                <option value="asc">Low to High</option>
                <option value="desc">High to Low</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className={s.courses__results}>
            Showing {from} of {to} courses
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className={s.courses__loading}>
              <div className={s.spinner}></div>
              <p>Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className={s.courses__empty}>
              <i className="bi bi-inbox"></i>
              <h3>No courses found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className={s.courses__grid}>
              {courses.map((course) => (
                <div key={course.id} className={s.course_card}>
                  {/* Thumbnail */}
                  <div className={s.card__thumbnail}>
                    <img src={course.thumbnailUrl} alt={course.name} />
                    {course.salePrice &&
                      course.salePrice < course.listedPrice && (
                        <div className={s.card__badge}>
                          {Math.round(
                            (1 - course.salePrice / course.listedPrice) * 100,
                          )}
                          % OFF
                        </div>
                      )}
                  </div>

                  {/* Content */}
                  <div className={s.card__content}>
                    <h3 className={s.card__title}>{course.name}</h3>

                    <div className={s.card__instructor}>
                      <i className="bi bi-person-circle"></i>
                      <span>
                        {course.instructor.fullName || "Expert Instructor"}
                      </span>
                    </div>

                    <div className={s.card__footer}>
                      <div className={s.card__price}>
                        {course.salePrice &&
                        course.salePrice < course.listedPrice ? (
                          <>
                            <span className={s.card__price_original}>
                              {formatPrice(course.listedPrice)}
                            </span>
                            <span className={s.card__price_sale}>
                              {formatPrice(course.salePrice)}
                            </span>
                          </>
                        ) : (
                          <span className={s.card__price_normal}>
                            {formatPrice(course.listedPrice)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleViewDetails(course.id)}
                        className={s.card__button}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && courses.length > 0 && totalPages > 1 && (
            <div className={s.courses__pagination}>
              <div className={s.pagination}>{renderPagination()}</div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default PublicCoursesPage;