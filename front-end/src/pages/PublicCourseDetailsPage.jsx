import React, { useEffect, useState } from "react";
import s from "../css/PublicCourseDetails.module.scss";
import { Link, useParams } from "react-router-dom";

export default function PublicCourseDetailsPage() {
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
  const [totalChapters, setTotalChapters] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);

  // Fixed data - bạn sẽ thay bằng data từ API
  const courseData = {
    name: "Complete Web Development Bootcamp 2024",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
    listedPrice: 2999000,
    salePrice: 399000,
    categories: ["Web Development", "Programming", "JavaScript", "React"],
    description: `Learn web development from scratch with this comprehensive bootcamp. 
    This course covers everything from HTML, CSS, JavaScript to advanced frameworks like React and Node.js. 
    You'll build real-world projects and gain practical experience that will help you land your dream job as a web developer.
    
    By the end of this course, you will be able to build fully functional web applications from front-end to back-end. 
    This includes responsive design, database management, authentication, and deployment.`,
    instructor: "John Doe",
    instructorAvatarUrl: "https://i.pravatar.cc/150?img=12",
    courseContent: {
      numberOfChapters: 12,
      numberOfLessons: 156,
      totalDuration: "42h 30m",
      chapters: [
        {
          id: 1,
          title: "Introduction to Web Development",
          duration: "2h 15m",
          lessons: [
            {
              id: 1,
              title: "What is Web Development?",
              duration: "15:30",
              isPreview: true,
            },
            {
              id: 2,
              title: "Setting Up Your Environment",
              duration: "20:45",
              isPreview: true,
            },
            {
              id: 3,
              title: "Understanding HTTP and HTTPS",
              duration: "18:20",
              isPreview: false,
            },
            {
              id: 4,
              title: "Introduction to HTML",
              duration: "25:30",
              isPreview: false,
            },
            {
              id: 5,
              title: "HTML Structure and Tags",
              duration: "30:10",
              isPreview: false,
            },
          ],
        },
        {
          id: 2,
          title: "HTML Fundamentals",
          duration: "4h 30m",
          lessons: [
            {
              id: 6,
              title: "HTML Forms and Input Types",
              duration: "35:20",
              isPreview: false,
            },
            {
              id: 7,
              title: "Semantic HTML",
              duration: "28:15",
              isPreview: false,
            },
            {
              id: 8,
              title: "HTML Tables and Lists",
              duration: "22:40",
              isPreview: false,
            },
            {
              id: 9,
              title: "HTML Media Elements",
              duration: "30:25",
              isPreview: false,
            },
            {
              id: 10,
              title: "HTML Best Practices",
              duration: "25:10",
              isPreview: false,
            },
          ],
        },
        {
          id: 3,
          title: "CSS Styling and Layout",
          duration: "5h 45m",
          lessons: [
            {
              id: 11,
              title: "CSS Basics and Selectors",
              duration: "32:15",
              isPreview: false,
            },
            {
              id: 12,
              title: "Box Model and Positioning",
              duration: "40:30",
              isPreview: false,
            },
            {
              id: 13,
              title: "Flexbox Layout",
              duration: "45:20",
              isPreview: false,
            },
            {
              id: 14,
              title: "CSS Grid Layout",
              duration: "50:15",
              isPreview: false,
            },
            {
              id: 15,
              title: "Responsive Design",
              duration: "38:25",
              isPreview: false,
            },
          ],
        },
        {
          id: 4,
          title: "JavaScript Fundamentals",
          duration: "6h 20m",
          lessons: [
            {
              id: 16,
              title: "Variables and Data Types",
              duration: "35:10",
              isPreview: false,
            },
            {
              id: 17,
              title: "Functions and Scope",
              duration: "42:30",
              isPreview: false,
            },
            {
              id: 18,
              title: "Arrays and Objects",
              duration: "38:45",
              isPreview: false,
            },
            {
              id: 19,
              title: "DOM Manipulation",
              duration: "45:20",
              isPreview: false,
            },
            {
              id: 20,
              title: "Event Handling",
              duration: "40:15",
              isPreview: false,
            },
          ],
        },
        {
          id: 5,
          title: "Advanced JavaScript",
          duration: "7h 10m",
          lessons: [
            {
              id: 21,
              title: "Async JavaScript and Promises",
              duration: "48:30",
              isPreview: false,
            },
            {
              id: 22,
              title: "ES6+ Features",
              duration: "52:15",
              isPreview: false,
            },
            {
              id: 23,
              title: "Modules and Import/Export",
              duration: "35:40",
              isPreview: false,
            },
            {
              id: 24,
              title: "Error Handling",
              duration: "30:25",
              isPreview: false,
            },
            {
              id: 25,
              title: "JavaScript Design Patterns",
              duration: "55:20",
              isPreview: false,
            },
          ],
        },
      ],
    },
  };

  useEffect(() => {
    fetchCourse();
    fetchChapters();
  }, []);

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
                <span>
                  {totalChapters} chapters
                </span>
                <span>•</span>
                <span>{totalLessons} lessons</span>
                <span>•</span>
                <span>
                  {course.duration} total length
                </span>
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
                          className={`bi ${expandedChapters[chapter.id] ? "bi-chevron-down" : "bi-chevron-right"}`}
                        ></i>
                        <span key={chapter.id}>
                          Chapter {index + 1}: {chapter.name}
                        </span>
                      </div>
                    </div>

                    {expandedChapters[chapter.id] && (
                      <div className={s.lessonsContainer}>
                        {chapter.lessons.map((lesson, index) => (
                          <div key={lesson.id} className={s.lessonItem}>
                            <div className={s.lessonLeft}>
                              <span>{index + 1}.</span>
                              <span>{lesson.name}</span>
                            </div>
                            <div className={s.lessonRight}>
                              {lesson.isPreview && (
                                <span className={s.previewBadge}>
                                  Preview
                                </span>
                              )}
                              <span className={s.duration}>
                                {lesson.duration}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                    <div className={s.discount}>
                      {calculateDiscount()}% OFF
                    </div>
                  )}
                </div>

                <button className={s.enrollBtn}>
                  <i className="bi bi-cart-plus-fill"></i>
                  Enroll Now
                </button>

                <button className={s.wishlistBtn}>
                  <i className="bi bi-heart"></i>
                  Add to Wishlist
                </button>

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
