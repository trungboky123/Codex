import React, { useEffect, useRef, useState } from "react";
import s from "../css/PublicCourseDetails.module.scss";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";

export default function PublicCourseDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedChapters, setExpandedChapters] = useState({});
  const { id } = useParams();
  const [course, setCourse] = useState({
    id: "",
    name: "",
    listedPrice: "",
    categories: [],
    salePrice: "",
    thumbnailUrl: "",
    instructor: {
      fullName: "",
      avatarUrl: "",
      email: "",
    },
    duration: "",
    description: "",
  });
  const [chapters, setChapters] = useState([]);
  const [chapterHeights, setChapterHeights] = useState({});
  const [totalChapters, setTotalChapters] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const lessonRefs = useRef({});
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
    fetchCourse();
    fetchChapters();
  }, []);

  useEffect(() => {
    const heights = {};
    Object.keys(lessonRefs.current).forEach((chapterId) => {
      if (lessonRefs.current[chapterId]) {
        heights[chapterId] = lessonRefs.current[chapterId].scrollHeight;
      }
    });
    setChapterHeights(heights);
  }, [chapters]);

  async function fetchCourse() {
    const res = await fetch(`http://localhost:8080/courses/${id}`, {
      method: "GET",
    });
    const data = await res.json();
    setCourse(data);
  }

  async function fetchChapters() {
    const res = await fetch(`http://localhost:8080/chapters/${id}`, {
      method: "GET",
    });
    const data = await res.json();
    setChapters(data.content);
    setTotalChapters(data.totalChapters);
    setTotalLessons(data.totalLessons);
  }

  function checkLoginStatus() {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    setIsSignedIn(!!token);
  }

  function handleLogin() {
    navigate("/login", { state: {from: location}, replace: true });
  }

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateDiscount = () => {
    if (!course.salePrice) return 0;
    const discount =
      ((course.listedPrice - course.salePrice) / course.listedPrice) * 100;
    return Math.round(discount);
  };

  return (
    <div className={s.courseDetailsWrapper}>
      <div className="container">
        <div className="row g-4">
          {/* Main Content */}
          <div className="col-lg-8">
            {/* Course Header */}
            <div className={s.courseHeader}>
              <div className={s.breadcrumb}>
                <Link to={"/home"} style={{ color: "black" }}>
                  Home
                </Link>
                <i className="bi bi-chevron-right"></i>
                <Link to={"/public-courses"} style={{ color: "black" }}>
                  Public Courses
                </Link>
                <i className="bi bi-chevron-right"></i>
                <span className={s.current}>{course.name}</span>
              </div>

              <h1 className={s.courseTitle}>{course.name}</h1>

              <div className={s.categories}>
                {course.categories.map((category) => (
                  <span key={category.id} className={s.categoryBadge}>
                    {category.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className={s.sectionCard}>
              <h2 className={s.sectionTitle}>
                <i className="bi bi-book-fill"></i>
                Course Description
              </h2>

              {/* Thumbnail */}
              <div className={s.thumbnailWrapper}>
                <img
                  src={course.thumbnailUrl}
                  alt={course.name}
                  className={s.courseThumbnail}
                />
                <div className={s.playOverlay}>
                  <i className="bi bi-play-circle-fill"></i>
                  <span>Preview this course</span>
                </div>
              </div>

              <div className={s.description}>{course.description}</div>
            </div>

            {/* Instructor */}
            <div className={s.sectionCard}>
              <h2 className={s.sectionTitle}>
                <i className="bi bi-person-fill"></i>
                Instructor
              </h2>
              <div className={s.instructorCard}>
                <img
                  src={course.instructor.avatarUrl}
                  alt={course.instructor.fullName}
                  className={s.instructorAvatar}
                />
                <div className={s.instructorInfo}>
                  <h3 className={s.instructorName}>
                    {course.instructor.fullName}
                  </h3>
                  <p className={s.instructorTitle}>Course Expert</p>
                  <div className={s.instructorEmail}>
                    <i className="bi bi-envelope-fill"></i>
                    <span>{course.instructor.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className={s.sectionCard}>
              <h2 className={s.sectionTitle}>
                <i className="bi bi-list-ul"></i>
                Course Content
              </h2>
              <div className={s.contentStats}>
                <span>{totalChapters} chapters</span>
                <span>•</span>
                <span>{totalLessons} lessons</span>
                <span>•</span>
                <span>{course.duration} total length</span>
              </div>

              <div className={s.chaptersContainer}>
                {chapters.map((chapter, index) => (
                  <div key={chapter.id} className={s.chapterItem}>
                    <div
                      className={s.chapterHeader}
                      onClick={() => toggleChapter(chapter.id)}
                    >
                      <div className={s.chapterTitle}>
                        <i
                          className="bi bi-chevron-right"
                          style={{
                            transition: "transform 0.3s",
                            transform: expandedChapters[chapter.id]
                              ? "rotate(90deg)"
                              : "rotate(0deg)",
                          }}
                        ></i>
                        <span>
                          Chapter {index + 1}: {chapter.name}
                        </span>
                      </div>
                    </div>

                    <div
                      className={s.lessonsContainer}
                      style={{
                        maxHeight: expandedChapters[chapter.id]
                          ? `${chapterHeights[chapter.id] || 2000}px`
                          : "0px",
                        opacity: expandedChapters[chapter.id] ? 1 : 0,
                      }}
                    >
                      <div ref={(el) => (lessonRefs.current[chapter.id] = el)}>
                        {chapter.lessons && chapter.lessons.length > 0 ? (
                          chapter.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className={s.lessonItem}>
                              <div className={s.lessonLeft}>
                                <span>{lessonIndex + 1}.</span>
                                <span>{lesson.name}</span>
                              </div>
                              <div className={s.lessonRight}>
                                {(lesson.isPreview === 1 ||
                                  lesson.isPreview === true) && (
                                  <span className={s.previewBadge}>
                                    Preview
                                  </span>
                                )}
                                <span className={s.duration}>
                                  {lesson.duration}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div
                            style={{
                              padding: "16px 24px 16px 60px",
                              color: "#64748b",
                            }}
                          >
                            No lessons available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className={s.sidebar}>
              <div className={s.priceCard}>
                <div className={s.priceHeader}>
                  <div className={s.prices}>
                    <span className={s.salePrice}>
                      {formatPrice(course.salePrice || course.listedPrice)}
                    </span>
                    {course.salePrice && (
                      <span className={s.listedPrice}>
                        {formatPrice(course.listedPrice)}
                      </span>
                    )}
                  </div>
                  {course.salePrice && (
                    <div className={s.discount}>{calculateDiscount()}% OFF</div>
                  )}
                </div>

                {isSignedIn ? (
                  <>
                    <button className={s.enrollBtn}>
                      <i className="bi bi-cart-plus-fill"></i>
                      Buy Course Now
                    </button>

                    <button
                      className={s.wishlistBtn}
                    >
                      <i className="bi bi-heart"></i>
                      Add to Wishlist
                    </button>
                  </>
                ) : (
                  <button
                    className={s.loginToEnrollBtn}
                    onClick={handleLogin}
                  >
                    <i className="bi bi-box-arrow-in-right"></i>
                    Login to Enroll in This Course
                  </button>
                )}

                <div className={s.features}>
                  <div className={s.feature}>
                    <i className="bi bi-infinity"></i>
                    <span>Lifetime Access</span>
                  </div>
                  <div className={s.feature}>
                    <i className="bi bi-phone"></i>
                    <span>Access on Mobile & TV</span>
                  </div>
                  <div className={s.feature}>
                    <i className="bi bi-award"></i>
                    <span>Certificate of Completion</span>
                  </div>
                  <div className={s.feature}>
                    <i className="bi bi-arrow-clockwise"></i>
                    <span>30-Day Money-Back Guarantee</span>
                  </div>
                </div>
              </div>

              <div className={s.shareCard}>
                <h3>Share this course</h3>
                <div className={s.shareButtons}>
                  <button className={s.shareBtn}>
                    <i className="bi bi-facebook"></i>
                  </button>
                  <button className={s.shareBtn}>
                    <i className="bi bi-twitter"></i>
                  </button>
                  <button className={s.shareBtn}>
                    <i className="bi bi-linkedin"></i>
                  </button>
                  <button className={s.shareBtn}>
                    <i className="bi bi-link-45deg"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
