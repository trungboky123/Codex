import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import s from "../css/MyCourseDetails.module.scss";
import authFetch from "../function/authFetch";

export default function MyCourseDetails() {
  const navigate = useNavigate();
  const { id, courseSlug, chapterSlug, lessonSlug } = useParams();
  const [loading, setLoading] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [course, setCourse] = useState({
    id: "",
    name: "",
    slug: "",
    chapters: [],
  });

  const [currentLesson, setCurrentLesson] = useState(null);
  const [hasEnrolled, setHasEnrolled] = useState(false);

  useEffect(() => {
    checkEnrollment();
  }, [id]);

  // Refetch course when enrollment status changes
  useEffect(() => {
    if (hasEnrolled !== null) {
      fetchCourse();
    }
  }, [hasEnrolled]);

  // Load lesson based on URL slug
  useEffect(() => {
    if (course.chapters && course.chapters.length > 0 && lessonSlug) {
      for (const chapter of course.chapters) {
        if (chapter.slug === chapterSlug && chapter.lessons) {
          const lesson = chapter.lessons.find((l) => l.slug === lessonSlug);
          if (lesson) {
            setCurrentLesson({
              id: lesson.id,
              name: lesson.name,
              slug: lesson.slug,
              videoUrl: convertToEmbedUrl(lesson.videoUrl) || "",
              pdfUrl: lesson.pdfUrl || "",
              chapterName: chapter.name,
            });
            setExpandedChapters((prev) => ({ ...prev, [chapter.id]: true }));
            break;
          }
        }
      }
    }
  }, [course.chapters, lessonSlug, chapterSlug]);

  // Auto-navigate to first lesson if no lessonSlug in URL
  useEffect(() => {
    if (
      course.chapters &&
      course.chapters.length > 0 &&
      !lessonSlug &&
      course.slug
    ) {
      const firstChapter = course.chapters[0];
      if (firstChapter.lessons && firstChapter.lessons.length > 0) {
        const firstLesson = firstChapter.lessons[0];
        navigate(
          `/course/${id}/${course.slug}/${firstChapter.slug}/${firstLesson.slug}`,
          { replace: true },
        );
      }
    }
  }, [course.chapters, lessonSlug, course.slug]);

  async function checkEnrollment() {
    try {
      const res = await authFetch(
        `http://localhost:8080/enrollments/check/course/${id}`,
      );
      if (res.ok) {
        const data = await res.json();
        setHasEnrolled(data.status === "ENROLLED");
      }
    } catch (error) {
      console.error("Failed to check enrollment:", error);
      setHasEnrolled(false);
    }
  }

  function convertToEmbedUrl(url) {
    if (!url) return "";

    if (
      url.includes("youtube.com/embed/") ||
      (url.includes("drive.google.com/file/d/") && url.includes("/preview"))
    ) {
      return url;
    }

    if (url.includes("drive.google.com")) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }

    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0].split("/")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      const videoId = urlParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return url;
  }

  async function fetchCourse() {
    setLoading(true);
    try {
      const endpoint = hasEnrolled
        ? `http://localhost:8080/courses/contents/${id}`
        : `http://localhost:8080/courses/contents/preview/${id}`;

      const res = await authFetch(endpoint);
      if (!res.ok) {
        navigate("/my-enrollments?type=courses");
        return;
      }
      const data = await res.json();
      setCourse(data);
    } catch (error) {
      console.error("Failed to fetch course:", error);
    } finally {
      setLoading(false);
    }
  }

  function toggleChapter(chapterId) {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  }

  function handleLessonClick(lesson, chapter) {
    // Navigate with slugs
    navigate(`/course/${id}/${course.slug}/${chapter.slug}/${lesson.slug}`);
  }

  function getPreviousLesson() {
    if (!currentLesson || !course.chapters) return null;

    const allLessons = [];
    course.chapters.forEach((chapter) => {
      if (chapter.lessons) {
        chapter.lessons.forEach((lesson) => {
          allLessons.push({ lesson, chapter });
        });
      }
    });

    const currentIndex = allLessons.findIndex(
      (item) => item.lesson.slug === lessonSlug,
    );
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  }

  function getNextLesson() {
    if (!currentLesson || !course.chapters) return null;

    const allLessons = [];
    course.chapters.forEach((chapter) => {
      if (chapter.lessons) {
        chapter.lessons.forEach((lesson) => {
          allLessons.push({ lesson, chapter });
        });
      }
    });

    const currentIndex = allLessons.findIndex(
      (item) => item.lesson.slug === lessonSlug,
    );
    return currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;
  }

  const previousLesson = getPreviousLesson();
  const nextLesson = getNextLesson();

  if (!currentLesson) {
    return (
      <div className={s.player}>
        <div className={s.loading}>
          <div className={s.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <title>
        {currentLesson.name} - {course.name}
      </title>
      <div className={s.player}>
        {/* Main Content */}
        <div className={`${s.main} ${!sidebarOpen ? s.mainExpanded : ""}`}>
          {/* Header */}
          <div className={s.header}>
            <div className={s.headerLeft}>
              <button
                className={s.backBtn}
                onClick={() => navigate("/my-enrollments?type=courses")}
              >
                <i className="bi bi-arrow-left"></i>
              </button>
              <div className={s.breadcrumb}>
                <span>{course.name}</span>
                <i className="bi bi-chevron-right"></i>
                <span>{currentLesson.chapterName}</span>
                <i className="bi bi-chevron-right"></i>
                <span className={s.current}>{currentLesson.name}</span>
              </div>
            </div>
            <button
              className={s.toggleBtn}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i
                className={`bi ${sidebarOpen ? "bi-layout-sidebar-inset-reverse" : "bi-layout-sidebar-reverse"}`}
              ></i>
            </button>
          </div>

          {/* Player */}
          <div className={s.playerWrapper}>
            {loading ? (
              <div className={s.loading}>
                <div className={s.spinner}></div>
              </div>
            ) : (
              <div className={s.content}>
                {/* Video Section */}
                <div className={s.videoSection}>
                  <iframe
                    src={currentLesson.videoUrl}
                    title={currentLesson.name + " - Video"}
                    className={s.iframe}
                    allowFullScreen
                  ></iframe>
                </div>

                {/* PDF Section */}
                <div className={s.pdfSection}>
                  <div className={s.pdfHeader}>
                    <i className="bi bi-file-pdf-fill"></i>
                    <h3>Lesson Materials</h3>
                  </div>
                  <iframe
                    src={currentLesson.pdfUrl}
                    title={currentLesson.name + " - PDF"}
                    className={s.pdfIframe}
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          {/* Info & Nav */}
          <div className={s.footer}>
            <div className={s.nav}>
              {previousLesson && (
                <button
                  onClick={() =>
                    handleLessonClick(
                      previousLesson.lesson,
                      previousLesson.chapter,
                    )
                  }
                >
                  <i className="bi bi-chevron-left"></i>
                  Previous
                </button>
              )}
              {nextLesson && (
                <button
                  className={s.next}
                  onClick={() =>
                    handleLessonClick(nextLesson.lesson, nextLesson.chapter)
                  }
                >
                  Next
                  <i className="bi bi-chevron-right"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`${s.sidebar} ${!sidebarOpen ? s.sidebarClosed : ""}`}>
          <div className={s.sidebarHeader}>
            <i className="bi bi-list-ul"></i>
            <h2>Course Contents</h2>
          </div>

          <div className={s.curriculum}>
            {course.chapters &&
              course.chapters.map((chapter) => (
                <div key={chapter.id} className={s.chapter}>
                  <div
                    className={`${s.chapterHead} ${expandedChapters[chapter.id] ? s.open : ""}`}
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <i className={`bi bi-chevron-right ${s.chevron}`}></i>
                    <i className="bi bi-folder2"></i>
                    <span>{chapter.name}</span>
                  </div>

                  {expandedChapters[chapter.id] && (
                    <div className={s.items}>
                      {chapter.lessons &&
                        chapter.lessons.map((lesson, idx) => {
                          const isActive = currentLesson && lesson.slug === lessonSlug;
                          const isLocked = !hasEnrolled && !lesson.isPreview;

                          return (
                            <div
                              key={lesson.id}
                              className={`${s.item} ${isActive ? s.active : ""} ${isLocked ? s.locked : ""}`}
                              onClick={() => {
                                if (isLocked) return;
                                handleLessonClick(lesson, chapter);
                              }}
                            >
                              <div className={s.itemLeft}>
                                <i className="bi bi-play-circle-fill"></i>
                                <span className={s.num}>{idx + 1}.</span>
                                <span className={s.name}>{lesson.name}</span>
                              </div>
                              <div className={s.itemRight}>
                                {!hasEnrolled && lesson.isPreview ? (
                                  <span className={s.preview}>
                                    <i className="bi bi-eye-fill"></i>
                                  </span>
                                ) : !hasEnrolled && !lesson.isPreview ? (
                                  <i className="bi bi-lock-fill"></i>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}

                      {chapter.quiz && (
                        <div
                          className={`${s.quiz} ${!hasEnrolled ? s.locked : ""}`}
                          onClick={() => {
                            if (!hasEnrolled) return;
                            // navigate(`/course/${id}/quiz/${chapter.quiz.id}`);
                          }}
                        >
                          <i className="bi bi-patch-question-fill"></i>
                          <span>{chapter.quiz.name}</span>
                          {!hasEnrolled && <i className="bi bi-lock-fill"></i>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
