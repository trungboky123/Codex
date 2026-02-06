import React, { useEffect, useState } from "react";
import "../css/HomePage.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function HomePage() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
  };

  useEffect(() => {
    fetch("http://localhost:8080/courses/highlighted", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => setCourses(data));
  }, []);

  const handleCourseClick = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    navigate(`/public-course-details/${course.slug}/${course.id}`);
  };

  const handleBannerClick = (courseId) => {
    const course = banners.find((c) => c.courseId === courseId);
    navigate(`/public-course-details/${course.slug}/${courseId}`);
  };

  const banners = [
    {
      id: 1,
      courseName: "Java Advanced",
      slug: "java-advanced",
      courseId: 35,
      bgImage:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=500&fit=crop",
      bgColor:
        "linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.85) 100%)",
    },
    {
      id: 2,
      courseName: "Python Programming",
      slug: "python-programming",
      courseId: 1,
      bgImage:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=500&fit=crop",
      bgColor:
        "linear-gradient(135deg, rgba(249, 115, 22, 0.85) 0%, rgba(234, 88, 12, 0.85) 100%)",
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <>
      <title>Home</title>
      <Header />

      <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
        <div className="banner-carousel">
          <div
            className="banner-slides-wrapper"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className="banner-slide"
                style={{ backgroundImage: `url(${banner.bgImage})` }}
              >
                <div
                  className="banner-overlay"
                  style={{ background: banner.bgColor }}
                >
                  <div className="banner-content">
                    <h2>{banner.courseName}</h2>
                    <button
                      className="btn btn-more"
                      onClick={() => handleBannerClick(banner.courseId)}
                    >
                      {t("home.banner.more")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="carousel-indicators">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`carousel-indicator ${index === activeSlide ? "active" : ""}`}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>

          <div className="carousel-arrow prev" onClick={handlePrevSlide}>
            <i className="bi bi-chevron-left"></i>
          </div>
          <div className="carousel-arrow next" onClick={handleNextSlide}>
            <i className="bi bi-chevron-right"></i>
          </div>
        </div>

        <div
          className="container"
          style={{ maxWidth: "1200px", paddingBottom: "100px" }}
        >
          <h1 className="section-title">{t("home.highlightedCourses")}</h1>

          <div className="row g-4">
            {courses.map((course) => (
              <div key={course.id} className="col-12 col-sm-6 col-lg-3">
                <div
                  className="course-card"
                  style={{ backgroundImage: `url(${course.thumbnailUrl})` }}
                  onClick={() => handleCourseClick(course.id)}
                >
                  <div className="course-info">
                    <div className="course-name">{course.name}</div>
                    <div className="course-price">
                      {course.salePrice !== null &&
                      course.salePrice < course.listedPrice ? (
                        <>
                          <span className="price-original">
                            {formatPrice(course.listedPrice)}
                          </span>
                          <span className="price-sale">
                            {formatPrice(course.salePrice)}
                          </span>
                        </>
                      ) : (
                        <span className="price-normal">
                          {formatPrice(course.listedPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default HomePage;
