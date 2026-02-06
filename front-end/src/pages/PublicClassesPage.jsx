import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import s from "../css/PublicClasses.module.scss";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";

function PublicClassesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  // States
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Filter states - Initialize from URL
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("keyword") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedCategoryParam, setSelectedCategoryParam] = useState(
    searchParams.get("category") || "",
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortByPrice") || "default",
  );

  // Pagination states
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1,
  );
  const [totalPages, setTotalPages] = useState(1);
  const ClassesPerPage = 12;

  const from = totalElements === 0 ? 0 : (currentPage - 1) * ClassesPerPage + 1;
  const to = Math.min(currentPage * ClassesPerPage, totalElements);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch Classes when filters change
  useEffect(() => {
    if (categories.length === 0 && selectedCategory !== 0) return;

    const timeout = setTimeout(() => {
      fetchClasses();
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, currentPage, selectedCategory, sortBy, categories]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage);

    if (selectedCategoryParam) params.set("category", selectedCategoryParam);

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
      (c) => c.name === selectedCategoryParam,
    );

    setSelectedCategory(categoryObj ? categoryObj.id : 0);
  }, [categories, selectedCategoryParam]);

  // FETCH CATEGORIES
  const fetchCategories = async () => {
    const res = await fetch("http://localhost:8080/settings/categories");
    const data = await res.json();
    setCategories(data);
  };

  // FETCH Classes
  const fetchClasses = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      params.set("page", currentPage - 1);
      params.set("size", ClassesPerPage);

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
        `http://localhost:8080/classes/public?${params.toString()}`,
      );

      const data = await res.json();

      setClasses(data.content);
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
      setSelectedCategoryParam(
        categories.find((c) => c.id === categoryId).name,
      );
    } else {
      setSelectedCategoryParam("");
    }
    setSelectedCategory(categoryId);
    resetToFirstPage();
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    resetToFirstPage();
  };

  const handleViewDetails = (classId) => {
    const clazz = classes.find((c) => c.id === classId);
    navigate(`/public-class-details/${clazz.slug}/${classId}`);
  };

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
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
      <title>Public Classes</title>
      <Header />

      <div className={s.classes}>
        <div className={s.classes__container}>
          {/* Header Section */}
          <div className={s.classes__header}>
            <h1 className={s.classes__title}>{t("classes.public")}</h1>
            <p className={s.classes__subtitle}>
              {t("classes.subtitle")}
            </p>
          </div>

          {/* Filters Section */}
          <div className={s.classes__filters}>
            {/* Search Bar */}
            <div className={s.filters__search}>
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder={t("classes.search")}
                value={searchTerm}
                onChange={handleSearchChange}
                className={s.filters__search_input}
              />
            </div>

            {/* Category Filter */}
            <div className={s.filters__category}>
              <label>{t("classes.category")}</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(Number(e.target.value))}
                className={s.filters__select}
              >
                <option value={0}>{t("classes.category.all")}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className={s.filters__sort}>
              <label>{t("classes.price")}</label>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className={s.filters__select}
              >
                <option value="default">{t("classes.price.default")}</option>
                <option value="asc">{t("classes.price.low")}</option>
                <option value="desc">{t("classes.price.high")}</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className={s.classes__results}>
            {t("classes.showing")} {from} {t("classes.to")} {to} {t("classes.text")}
          </div>

          {/* Classes Grid */}
          {loading ? (
            <div className={s.classes__loading}>
              <div className={s.spinner}></div>
              <p>{t("classes.loading")}</p>
            </div>
          ) : classes.length === 0 ? (
            <div className={s.classes__empty}>
              <i className="bi bi-inbox"></i>
              <h3>{t("classes.noClass")}</h3>
              <p>{t("classes.noClass.subtitle")}</p>
            </div>
          ) : (
            <div className={s.classes__grid}>
              {classes.map((c) => (
                <div key={c.id} className={s.class_card}>
                  {/* Thumbnail */}
                  <div className={s.card__thumbnail}>
                    <img src={c.thumbnailUrl} alt={c.name} />
                    {c.salePrice && c.salePrice < c.listedPrice && (
                      <div className={s.card__badge}>
                        {Math.round((1 - c.salePrice / c.listedPrice) * 100)}%
                        OFF
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={s.card__content}>
                    <h3 className={s.card__title}>{c.name}</h3>

                    <div className={s.card__instructor}>
                      <i className="bi bi-person-circle"></i>
                      <span>
                        {c.instructor.fullName || "Expert Instructor"}
                      </span>
                    </div>

                    <div className={s.card__schedule}>
                      <i className="bi bi-calendar-event"></i>
                      <span>
                        {t("classes.start")}{" "}
                        {new Date(c.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className={s.card__footer}>
                      <div className={s.card__price}>
                        {c.salePrice && c.salePrice < c.listedPrice ? (
                          <>
                            <span className={s.card__price_original}>
                              {formatPrice(c.listedPrice)}
                            </span>
                            <span className={s.card__price_sale}>
                              {formatPrice(c.salePrice)}
                            </span>
                          </>
                        ) : (
                          <span className={s.card__price_normal}>
                            {formatPrice(c.listedPrice)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleViewDetails(c.id)}
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
          {!loading && classes.length > 0 && totalPages > 1 && (
            <div className={s.classes__pagination}>
              <div className={s.pagination}>{renderPagination()}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default PublicClassesPage;
