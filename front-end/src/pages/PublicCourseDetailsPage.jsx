import React, { useEffect, useRef, useState } from "react";
import s from "../css/PublicCourseDetails.module.scss";
import authFetch from "../function/authFetch";
import {
  Link,
  useParams,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import Header from "../components/Header";

export default function PublicCourseDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedChapters, setExpandedChapters] = useState({});
  const { id, slug } = useParams();
  const [notFound, setNotFound] = useState(false);
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
  const [inWishlist, setInWishlist] = useState(false);
  const [hasEnrolled, setHasEnrolled] = useState(false);

  useEffect(() => {
    checkInWishlist();
    checkLoginStatus();
    fetchCourse();
    fetchChapters();
  }, [inWishlist]);

  useEffect(() => {
    if (course.id && isSignedIn) {
      checkEnrolled();
    }
  }, [course.id, isSignedIn, hasEnrolled]);

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

    if (data.slug !== slug) {
      setNotFound(true);
      return;
    }

    setCourse(data);
  }

  if (notFound) {
    return <Navigate to={"/404"} replace />;
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
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    setIsSignedIn(!!token);
  }

  async function checkInWishlist() {
    const itemId = id;
    const type = "course";

    const res = await authFetch(
      `http://localhost:8080/wishlist/find?itemId=${itemId}&type=${type}`,
      {
        method: "GET",
      },
    );

    if (!res.ok) {
      setInWishlist(false);
      return;
    }

    setInWishlist(true);
  }

  async function checkEnrolled() {
    const res = await authFetch(
      `http://localhost:8080/enrollments/check/course/${course.id}`,
      {
        method: "GET",
      },
    );
    const data = await res.json();

    if (data.status === "ENROLLED") {
      setHasEnrolled(true);
    }
  }

  function handleLogin() {
    navigate("/login", { state: { from: location }, replace: true });
  }

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleBuyCourse = async (courseId) => {
    const res = await authFetch("http://localhost:8080/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: courseId,
        itemType: "Course",
        amount: course.salePrice ?? course.listedPrice,
      }),
    });
    const data = await res.json();
    navigate("/payment", {
      state: {
        id: id,
        name: course.name,
        type: "Course",
        qrCode: data.qrCode,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        amount: data.amount,
        description: data.description,
      },
    });
  };

  const handleGetCourse = async(courseId) => {
    const res = await authFetch(`http://localhost:8080/enrollments/free-course/${courseId}`, {
      method: "POST"
    });
    if (res.ok) {
      setHasEnrolled(true);
      const res = await authFetch(`http://localhost:8080/wishlist/find?itemId=${courseId}&type=course`, {
        method: "GET",
      });
      if (res.ok) {
        await authFetch(`http://localhost:8080/wishlist/remove?itemId=${courseId}&type=course`, {
          method: "DELETE"
        });
      }
    }
  };

  const handleGoToMyCourse = () => {
    navigate("/my-courses");
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

  const handleAddToWishlist = async () => {
    const type = "Course";
    const itemId = course.id;
    const itemName = course.name;
    const listedPrice = course.listedPrice;
    const salePrice = course.salePrice;
    const thumbnailUrl = course.thumbnailUrl;

    await authFetch("http://localhost:8080/wishlist/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: type,
        itemId: itemId,
        itemName: itemName,
        listedPrice: listedPrice,
        salePrice: salePrice,
        thumbnailUrl: thumbnailUrl,
      }),
    });

    setInWishlist(true);
  };

  return (
    <>
      <title>Public Course Details</title>
      <div className={s.course}>
        <div className="container">
          <div className="row g-4">
            {/* Main Content */}
            <div className="col-lg-8">
              {/* Course Header */}
              <div className={s.courseHeader}>
                <div className={s.courseBreadcrumb}>
                  <Link to={"/home"} style={{ color: "black" }}>
                    Home
                  </Link>
                  <i className="bi bi-chevron-right"></i>
                  <Link to={"/public-courses"} style={{ color: "black" }}>
                    Public Courses
                  </Link>
                  <i className="bi bi-chevron-right"></i>
                  <span className={s.courseBreadcrumbCurrent}>
                    {course.name}
                  </span>
                </div>

                <h1 className={s.courseTitle}>{course.name}</h1>

                <div className={s.courseCategories}>
                  {course.categories.map((category) => (
                    <span key={category.id} className={s.courseCategoriesBadge}>
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className={s.section}>
                <h2 className={s.sectionTitle}>
                  <i className="bi bi-book-fill"></i>
                  Course Description
                </h2>

                {/* Thumbnail */}
                <div className={s.thumbnail}>
                  <img
                    src={course.thumbnailUrl}
                    alt={course.name}
                    className={s.thumbnailImg}
                  />
                  <div className={s.thumbnailOverlay}>
                    <i className="bi bi-play-circle-fill"></i>
                    <span>Preview this course</span>
                  </div>
                </div>

                <div className={s.courseDescription} dangerouslySetInnerHTML={{ __html: course.description }}></div>
              </div>

              {/* Instructor */}
              <div className={s.section}>
                <h2 className={s.sectionTitle}>
                  <i className="bi bi-person-fill"></i>
                  Instructor
                </h2>
                <div className={s.instructor}>
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
              <div className={s.section}>
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

                <div className={s.chapters}>
                  {chapters.map((chapter, index) => (
                    <div key={chapter.id} className={s.chaptersItem}>
                      <div
                        className={s.chaptersHeader}
                        onClick={() => toggleChapter(chapter.id)}
                      >
                        <div className={s.chaptersTitle}>
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
                        className={s.lessons}
                        style={{
                          maxHeight: expandedChapters[chapter.id]
                            ? `${chapterHeights[chapter.id] || 2000}px`
                            : "0px",
                          opacity: expandedChapters[chapter.id] ? 1 : 0,
                        }}
                      >
                        <div
                          ref={(el) => (lessonRefs.current[chapter.id] = el)}
                        >
                          {chapter.lessons && chapter.lessons.length > 0 ? (
                            chapter.lessons.map((lesson, lessonIndex) => (
                              <div key={lesson.id} className={s.lessonsItem}>
                                <div className={s.lessonsLeft}>
                                  <span>{lessonIndex + 1}.</span>
                                  <span>{lesson.name}</span>
                                </div>
                                <div className={s.lessonsRight}>
                                  {(lesson.isPreview === 1 ||
                                    lesson.isPreview === true) && (
                                    <span className={s.previewBadge}>
                                      Preview
                                    </span>
                                  )}
                                  <span className={s.lessonsDuration}>
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
                <div className={s.price}>
                  <div className={s.priceHeader}>
                    <div className={s.priceCard}>
                      <span className={s.priceSale}>
                        {formatPrice(course.salePrice || course.listedPrice)}
                      </span>
                      {course.salePrice && (
                        <span className={s.priceListed}>
                          {formatPrice(course.listedPrice)}
                        </span>
                      )}
                    </div>
                    {course.salePrice && (
                      <div className={s.priceDiscount}>
                        {calculateDiscount()}% OFF
                      </div>
                    )}
                  </div>

                  {isSignedIn ? (
                    hasEnrolled ? (
                      // Enrolled State
                      <>
                        <div className={s.enrolledMessage}>
                          <i className="bi bi-check-circle-fill"></i>
                          <span>You have already purchased this course</span>
                        </div>
                        <button
                          className={s.goToMyCourseBtn}
                          onClick={handleGoToMyCourse}
                        >
                          <i className="bi bi-collection-play-fill"></i>
                          Go to My Courses
                        </button>
                      </>
                    ) : (
                      // Not Enrolled State
                      <>
                        {course.listedPrice === 0 || course.salePrice === 0 ? (
                          <button
                            className={s.enrollBtn}
                            onClick={() => handleGetCourse(course.id)}
                          >
                            <i className="bi bi-cart-plus-fill"></i>
                            Get Course Now
                          </button>
                        ) : (
                          <button
                            className={s.enrollBtn}
                            onClick={() => handleBuyCourse(course.id)}
                          >
                            <i className="bi bi-cart-plus-fill"></i>
                            Buy Course Now
                          </button>
                        )}

                        {inWishlist ? (
                          <button
                            className={s.wishlistBtn}
                            onClick={() => navigate("/wishlist")}
                          >
                            <i className="bi bi-check-square-fill"></i>
                            View Wishlist
                          </button>
                        ) : (
                          <button
                            className={s.wishlistBtn}
                            onClick={handleAddToWishlist}
                          >
                            <i className="bi bi-heart"></i>
                            Add to Wishlist
                          </button>
                        )}
                      </>
                    )
                  ) : (
                    <button
                      className={s.loginToEnrollBtn}
                      onClick={handleLogin}
                    >
                      <i className="bi bi-box-arrow-in-right"></i>
                      Login to Enroll in This Course
                    </button>
                  )}

                  <div className={s.feature}>
                    <div className={s.featureItem}>
                      <i className="bi bi-infinity"></i>
                      <span>Lifetime Access</span>
                    </div>
                    <div className={s.featureItem}>
                      <i className="bi bi-phone"></i>
                      <span>Access on Mobile & TV</span>
                    </div>
                    <div className={s.featureItem}>
                      <i className="bi bi-award"></i>
                      <span>Certificate of Completion</span>
                    </div>
                    <div className={s.featureItem}>
                      <i className="bi bi-arrow-clockwise"></i>
                      <span>30-Day Money-Back Guarantee</span>
                    </div>
                  </div>
                </div>

                <div className={s.share}>
                  <h3>Share this course</h3>
                  <div className={s.shareWrapper}>
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
    </>
  );
}
