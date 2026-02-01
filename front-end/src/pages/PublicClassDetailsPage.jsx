import React, { useEffect, useState } from "react";
import s from "../css/PublicClassDetails.module.scss";
import authFetch from "../function/authFetch";
import {
  Link,
  useParams,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import Header from "../components/Header";

export default function PublicClassDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, slug } = useParams();
  const [notFound, setNotFound] = useState(false);
  const [classData, setClassData] = useState({
    id: "",
    name: "",
    listedPrice: "",
    startDate: "",
    endDate: "",
    categories: [],
    salePrice: "",
    thumbnailUrl: "",
    instructor: {
      fullName: "",
      avatarUrl: "",
      email: "",
    },
    slug: "",
    description: "",
    syllabus: {
      startTime: "",
      endTime: "",
      totalHours: "",
      daysOfWeek: [],
    },
  });
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [hasEnrolled, setHasEnrolled] = useState(false);

  useEffect(() => {
    checkInWishlist();
    checkLoginStatus();
    fetchClass();
  }, [inWishlist, id, slug]);

  useEffect(() => {
    if (classData.id && isSignedIn) {
      checkEnrolled();
    }
  }, [classData.id, isSignedIn]);

  async function fetchClass() {
    const res = await fetch(`http://localhost:8080/classes/${id}`, {
      method: "GET",
    });
    const data = await res.json();
    if (data.slug !== slug) {
      setNotFound(true);
      return;
    }

    setClassData(data);
  }

  if (notFound) {
    return <Navigate to={"/404"} replace />;
  }

  function checkLoginStatus() {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    setIsSignedIn(!!token);
  }

  async function checkInWishlist() {
    const itemId = id;
    const type = "class";

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

  function handleLogin() {
    navigate("/login", { state: { from: location }, replace: true });
  }

  const handleBuyClass = async (classId) => {
    const res = await authFetch("http://localhost:8080/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: classId,
        itemType: "Class",
        amount: classData.salePrice ?? classData.listedPrice,
      }),
    });
    const data = await res.json();
    navigate("/payment", {
      state: {
        name: classData.name,
        type: "Course",
        qrUrl: data.qrUrl,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        amount: data.amount,
        content: data.content,
      },
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateDiscount = () => {
    if (!classData.salePrice) return 0;
    const discount =
      ((classData.listedPrice - classData.salePrice) / classData.listedPrice) *
      100;
    return Math.round(discount);
  };

  async function checkEnrolled() {
    const res = await authFetch(
      `http://localhost:8080/enrollments/check/class/${classData.id}`,
      {
        method: "GET",
      },
    );
    const data = await res.json();

    if (data.status === "ENROLLED") {
      setHasEnrolled(true);
    }
  }

  const handleAddToWishlist = async () => {
    const type = "class";
    const itemId = classData.id;
    const itemName = classData.name;
    const listedPrice = classData.listedPrice;
    const salePrice = classData.salePrice;
    const thumbnailUrl = classData.thumbnailUrl;

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

  const calculateSessionDuration = () => {
    if (!classData.syllabus.startTime || !classData.syllabus.endTime)
      return "N/A";

    const [startHour, startMin] = classData.syllabus.startTime
      .split(":")
      .map(Number);
    const [endHour, endMin] = classData.syllabus.endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    const durationMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (minutes > 0) {
      return `${hours}h ${minutes}m per session`;
    }
    return `${hours}h per session`;
  };

  const handleGoToMyClass = () => {
    navigate("/my-classes");
  };

  return (
    <>
      <Header />
      <div className={s.course}>
        <div className="container">
          <div className="row g-4">
            {/* Main Content */}
            <div className="col-lg-8">
              {/* Class Header */}
              <div className={s.courseHeader}>
                <div className={s.courseBreadcrumb}>
                  <Link to={"/home"} style={{ color: "black" }}>
                    Home
                  </Link>
                  <i className="bi bi-chevron-right"></i>
                  <Link to={"/public-classes"} style={{ color: "black" }}>
                    Public Classes
                  </Link>
                  <i className="bi bi-chevron-right"></i>
                  <span className={s.courseBreadcrumbCurrent}>
                    {classData.name}
                  </span>
                </div>

                <h1 className={s.courseTitle}>{classData.name}</h1>

                <div className={s.courseCategories}>
                  {classData.categories.map((category) => (
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
                  Class Description
                </h2>

                {/* Thumbnail */}
                <div className={s.thumbnail}>
                  <img
                    src={classData.thumbnailUrl}
                    alt={classData.name}
                    className={s.thumbnailImg}
                  />
                  <div className={s.thumbnailOverlay}>
                    <i className="bi bi-play-circle-fill"></i>
                    <span>Preview this class</span>
                  </div>
                </div>

                <div className={s.courseDescription}>
                  {classData.description}
                </div>
              </div>

              {/* Instructor */}
              <div className={s.section}>
                <h2 className={s.sectionTitle}>
                  <i className="bi bi-person-fill"></i>
                  Instructor
                </h2>
                <div className={s.instructor}>
                  <img
                    src={classData.instructor.avatarUrl}
                    alt={classData.instructor.fullName}
                    className={s.instructorAvatar}
                  />
                  <div className={s.instructorInfo}>
                    <h3 className={s.instructorName}>
                      {classData.instructor.fullName}
                    </h3>
                    <p className={s.instructorTitle}>Class Expert</p>
                    <div className={s.instructorEmail}>
                      <i className="bi bi-envelope-fill"></i>
                      <span>{classData.instructor.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Schedule */}
              <div className={s.section}>
                <h2 className={s.sectionTitle}>
                  <i className="bi bi-calendar-check-fill"></i>
                  Class Schedule
                </h2>
                <div className={s.contentStats}>
                  <span>
                    {classData.syllabus.daysOfWeek?.length || 0} lessons per
                    week
                  </span>
                  <span>•</span>
                  <span>{calculateSessionDuration()}</span>
                  <span>•</span>
                  <span>
                    Duration: {classData.syllabus.totalHours || "N/A"}h
                  </span>
                </div>

                <div className={s.scheduleContainer}>
                  {classData.syllabus.daysOfWeek &&
                  classData.syllabus.daysOfWeek.length > 0 ? (
                    classData.syllabus.daysOfWeek.map((dayOfWeek, index) => (
                      <div key={index} className={s.scheduleItem}>
                        <div className={s.scheduleDay}>
                          <div className={s.scheduleDayIcon}>
                            <i className="bi bi-calendar3"></i>
                          </div>
                          <div className={s.scheduleDayInfo}>
                            <h3 className={s.scheduleDayName}>{dayOfWeek}</h3>
                          </div>
                        </div>
                        <div className={s.scheduleTime}>
                          <div className={s.scheduleTimeBlock}>
                            <i className="bi bi-clock-fill"></i>
                            <div className={s.scheduleTimeInfo}>
                              <span className={s.scheduleTimeLabel}>START</span>
                              <span className={s.scheduleTimeValue}>
                                {classData.syllabus.startTime || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className={s.scheduleTimeDivider}>
                            <i className="bi bi-arrow-right"></i>
                          </div>
                          <div className={s.scheduleTimeBlock}>
                            <i className="bi bi-clock-fill"></i>
                            <div className={s.scheduleTimeInfo}>
                              <span className={s.scheduleTimeLabel}>END</span>
                              <span className={s.scheduleTimeValue}>
                                {classData.syllabus.endTime || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={s.scheduleEmpty}>
                      <i className="bi bi-calendar-x"></i>
                      <p>No schedule available</p>
                    </div>
                  )}
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
                        {formatPrice(
                          classData.salePrice || classData.listedPrice,
                        )}
                      </span>
                      {classData.salePrice && (
                        <span className={s.priceListed}>
                          {formatPrice(classData.listedPrice)}
                        </span>
                      )}
                    </div>
                    {classData.salePrice && (
                      <div className={s.priceDiscount}>
                        {calculateDiscount()}% OFF
                      </div>
                    )}
                  </div>

                  {isSignedIn ? (
                    hasEnrolled ? (
                      <>
                        <div className={s.enrolledMessage}>
                          <i className="bi bi-check-circle-fill"></i>
                          <span>You have already enrolled in this class</span>
                        </div>
                        <button
                          className={s.goToMyClassBtn}
                          onClick={handleGoToMyClass}
                        >
                          <i className="bi bi-collection-play-fill"></i>
                          Go to My Classes
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={s.enrollBtn}
                          onClick={() => handleBuyClass(classData.id)}
                        >
                          <i className="bi bi-cart-plus-fill"></i>
                          Enroll in This Class
                        </button>

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
                      Login to Enroll in This Class
                    </button>
                  )}

                  <div className={s.feature}>
                    <div className={s.featureItem}>
                      <i className="bi bi-calendar-check-fill"></i>
                      <span>
                        Start in:{" "}
                        {new Date(classData.startDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <div className={s.featureItem}>
                      <i className="bi bi-calendar-check-fill"></i>
                      <span>
                        End in:{" "}
                        {new Date(classData.endDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <div className={s.featureItem}>
                      <i className="bi bi-camera-video-fill"></i>
                      <span>Class Recording Saved</span>
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
                  <h3>Share this class</h3>
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
