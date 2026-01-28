import React, { useEffect, useState } from "react";
import s from "../css/Wishlist.module.scss";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import authFetch from "../function/authFetch";

export default function WishlistPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("courses");
  const [courseItems, setCourseItems] = useState([]);
  const [classItems, setClassItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("keyword") || "",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, sortBy]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("keyword", searchQuery);
    if (sortBy !== "default") params.set("sortBy", sortBy);

    setSearchParams(params, { replace: true });
  }, [searchQuery, sortBy]);

  useEffect(() => {
    applyFilters();
  }, [courseItems, classItems, sortBy, activeTab]);

  async function fetchItems() {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (searchQuery.trim() !== "") {
        params.set("keyword", searchQuery.trim());
      }
      if (sortBy !== "default") {
        params.set("sortBy", sortBy);
      }

      const res = await authFetch(
        `http://localhost:8080/wishlist/findAll?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const data = await res.json();
      setCourseItems(data.filter((item) => item.type === "course"));
      setClassItems(data.filter((item) => item.type === "class"));
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let items = activeTab === "courses" ? [...courseItems] : [...classItems];

    items.sort((a, b) => {
      switch (sortBy) {
        case "discount":
          const discountA = a.salePrice
            ? ((a.listedPrice - a.salePrice) / a.listedPrice) * 100
            : 0;
          const discountB = b.salePrice
            ? ((b.listedPrice - b.salePrice) / b.listedPrice) * 100
            : 0;
          return discountB - discountA;
        default:
          return 0;
      }
    });

    setFilteredItems(items);
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
  }

  async function handleRemove(itemId, type) {
    const res = await authFetch(
      `http://localhost:8080/wishlist/remove?itemId=${itemId}&type=${type}`,
      { method: "DELETE" },
    );

    if (res.ok) {
      fetchItems();
    }
  }

  async function handleViewDetails(itemId, type) {
    try {
      if (type === "course") {
        const res = await fetch(`http://localhost:8080/courses/${itemId}`, {
          method: "GET",
        });
        const data = await res.json();
        navigate(`/public-course-details/${data.slug}/${itemId}`);
      } else {
        const res = await fetch(`http://localhost:8080/classes/${itemId}`, {
          method: "GET",
        });
        const data = await res.json();
        navigate(`/public-class-details/${data.slug}/${itemId}`);
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }

  function calculateDiscount(listedPrice, salePrice) {
    if (!salePrice) return 0;
    return Math.round(((listedPrice - salePrice) / listedPrice) * 100);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function handleSearch(e) {
    setSearchQuery(e.target.value);
  }

  function handleSortChange(e) {
    setSortBy(e.target.value);
  }

  const currentCount =
    activeTab === "courses" ? courseItems.length : classItems.length;

  return (
    <>
      <title>Wishlist</title>
      <Header />
      <div className={s.wishlist}>
        <div className="container">
          {/* Header */}
          <div className={s.header}>
            <div className={s.headerContent}>
              <h1 className={s.title}>
                <i className="bi bi-heart-fill"></i>
                My Wishlist
              </h1>
              <p className={s.subtitle}>
                Save your favorite courses and classes for later
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
              <div className={s.searchBox}>
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

              <select
                className={s.filterSelect}
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="default">Default</option>
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className={s.content}>
            {loading ? (
              <div className={s.loading}>
                <div className={s.spinner}></div>
                <p>Loading your wishlist...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className={s.empty}>
                <i className="bi bi-inbox"></i>
                <h3>No Items Found</h3>
                <p>
                  {searchQuery
                    ? "No items match your search. Try a different keyword."
                    : `You haven't added any ${activeTab} to your wishlist yet.`}
                </p>
              </div>
            ) : (
              <div className={s.grid}>
                {filteredItems.map((item) => (
                  <div key={item.id} className={s.card}>
                    <div className={s.cardImage}>
                      <img src={item.thumbnailUrl} alt={item.itemName} />
                      {item.salePrice && (
                        <div className={s.discountBadge}>
                          {calculateDiscount(item.listedPrice, item.salePrice)}%
                          OFF
                        </div>
                      )}
                    </div>

                    <div className={s.cardBody}>
                      <div className={s.cardHeader}>
                        <h3 className={s.cardTitle}>{item.itemName}</h3>
                        <button
                          className={s.removeBtn}
                          onClick={() => handleRemove(item.itemId, item.type)}
                          title="Remove from wishlist"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>

                      <div className={s.priceSection}>
                        <div className={s.prices}>
                          <span className={s.currentPrice}>
                            {formatPrice(item.salePrice || item.listedPrice)}
                          </span>
                          {item.salePrice && (
                            <span className={s.originalPrice}>
                              {formatPrice(item.listedPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={s.cardFooter}>
                        <div className={s.addedDate}>
                          <i className="bi bi-calendar-event"></i>
                          <span>Added {formatDate(item.addedAt)}</span>
                        </div>

                        <button
                          className={s.viewBtn}
                          onClick={() =>
                            handleViewDetails(item.itemId, item.type)
                          }
                        >
                          View Details
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
