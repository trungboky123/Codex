import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import s from "../css/StudentList.module.scss";
import authFetch from "../function/authFetch";

export default function StudentListPage() {
  const navigate = useNavigate();
  const { sidebarCollapsed } = useOutletContext();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedClassName, setSelectedClassName] = useState("");

  // Dropdown refs
  const courseDropdownRef = useRef(null);
  const classDropdownRef = useRef(null);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  
  async function fetchStudents() {
    setLoading(true);
    const res = await authFetch("http://localhost:8080/enrollments/student-list", {
      method: "GET"
    });
    const data = await res.json();
    setStudents(data);
    setLoading(false);
  }
  const mockCourses = [
    { id: 1, name: "React Fundamentals" },
    { id: 2, name: "Advanced JavaScript" },
    { id: 3, name: "UI/UX Design" },
    { id: 4, name: "Python Basics" },
  ];

  const mockClasses = [
    { id: 1, name: "Web Dev Bootcamp 2024" },
    { id: 2, name: "Design Thinking Class" },
  ];

  useEffect(() => {
    // REPLACE with your API calls
    fetchStudents();
    setCourses(mockCourses);
    setClasses(mockClasses);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        courseDropdownRef.current &&
        !courseDropdownRef.current.contains(e.target)
      )
        setCourseDropdownOpen(false);
      if (
        classDropdownRef.current &&
        !classDropdownRef.current.contains(e.target)
      )
        setClassDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleCourseSelect(courseId, courseName) {
    setSelectedCourse(courseId);
    setSelectedCourseName(courseId === "all" ? "" : courseName);
    setCourseDropdownOpen(false);
  }

  const getStatus = (status) => {
    return status ? "Active" : "Inactive";
  };

  function handleClassSelect(classId, className) {
    setSelectedClass(classId);
    setSelectedClassName(classId === "all" ? "" : className);
    setClassDropdownOpen(false);
  }

  function handleToggleStatus(studentId) {
    // REPLACE with your API call
    console.log("Toggle status for student:", studentId);
  }

  function handleEdit(studentId) {
    navigate(`/instructor/students/edit/${studentId}`);
  }

  return (
    <div className={s.pageWrapper}>
      <title>Student List</title>
      <main
        className={`${s.mainContent} ${sidebarCollapsed ? s.collapsed : ""}`}
      >
        <div className={s.container}>
          {/* Header */}
          <div className={s.pageHeader}>
            <div>
              <h1 className={s.pageTitle}>
                <i className="bi bi-people"></i>
                Student List
              </h1>
              <p className={s.pageSubtitle}>
                Manage students enrolled in your courses and classes
              </p>
            </div>
            <button
              className={s.addBtn}
              onClick={() => navigate("/instructor/students/add")}
            >
              <i className="bi bi-plus-lg"></i>
              Add Student
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
                  placeholder="Search by name…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Course dropdown */}
              <div className={s.dropdown} ref={courseDropdownRef}>
                <button
                  className={`${s.filterBtn} ${courseDropdownOpen ? s.filterBtnOpen : ""} ${selectedCourse !== "all" ? s.filterBtnActive : ""}`}
                  onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
                >
                  <i className="bi bi-book"></i>
                  <span>{selectedCourseName || "All Courses"}</span>
                  <i
                    className={`bi bi-chevron-down ${courseDropdownOpen ? s.rotate : ""}`}
                  ></i>
                </button>

                {courseDropdownOpen && (
                  <div className={s.dropdownMenu}>
                    <button
                      className={`${s.dropdownItem} ${selectedCourse === "all" ? s.dropdownItemActive : ""}`}
                      onClick={() => handleCourseSelect("all", "")}
                    >
                      <span>All Courses</span>
                      {selectedCourse === "all" && (
                        <i className="bi bi-check-lg"></i>
                      )}
                    </button>
                    {courses.map((course) => (
                      <button
                        key={course.id}
                        className={`${s.dropdownItem} ${selectedCourse === String(course.id) ? s.dropdownItemActive : ""}`}
                        onClick={() =>
                          handleCourseSelect(String(course.id), course.name)
                        }
                      >
                        <span>{course.name}</span>
                        {selectedCourse === String(course.id) && (
                          <i className="bi bi-check-lg"></i>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Class dropdown */}
              <div className={s.dropdown} ref={classDropdownRef}>
                <button
                  className={`${s.filterBtn} ${classDropdownOpen ? s.filterBtnOpen : ""} ${selectedClass !== "all" ? s.filterBtnActive : ""}`}
                  onClick={() => setClassDropdownOpen(!classDropdownOpen)}
                >
                  <i className="bi bi-people"></i>
                  <span>{selectedClassName || "All Classes"}</span>
                  <i
                    className={`bi bi-chevron-down ${classDropdownOpen ? s.rotate : ""}`}
                  ></i>
                </button>

                {classDropdownOpen && (
                  <div className={s.dropdownMenu}>
                    <button
                      className={`${s.dropdownItem} ${selectedClass === "all" ? s.dropdownItemActive : ""}`}
                      onClick={() => handleClassSelect("all", "")}
                    >
                      <span>All Classes</span>
                      {selectedClass === "all" && (
                        <i className="bi bi-check-lg"></i>
                      )}
                    </button>
                    {classes.map((cls) => (
                      <button
                        key={cls.id}
                        className={`${s.dropdownItem} ${selectedClass === String(cls.id) ? s.dropdownItemActive : ""}`}
                        onClick={() =>
                          handleClassSelect(String(cls.id), cls.name)
                        }
                      >
                        <span>{cls.name}</span>
                        {selectedClass === String(cls.id) && (
                          <i className="bi bi-check-lg"></i>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className={s.resultCount}>
              Showing {students.length} student
              {students.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Table */}
          <div className={s.tableCard}>
            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Courses</th>
                    <th>Classes</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className={s.loadingCell}>
                        <div className={s.spinner}></div>
                        <p>Loading students…</p>
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan="8" className={s.emptyCell}>
                        <i className="bi bi-inbox"></i>
                        <p>No students found</p>
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id}>
                        <td className={s.idCell}>{student.id}</td>
                        <td className={s.nameCell}>
                          <div className={s.studentInfo}>
                            <span>{student.fullName}</span>
                          </div>
                        </td>
                        <td>{student.username}</td>
                        <td className={s.emailCell}>{student.email}</td>
                        <td>
                          <div className={s.tags}>
                            {student.courses.length > 0 ? (
                              student.courses.map((course, idx) => (
                                <span key={idx} className={s.tag}>
                                  {course}
                                </span>
                              ))
                            ) : (
                              <span className={s.noData}>—</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className={s.tags}>
                            {student.classes.length > 0 ? (
                              student.classes.map((cls, idx) => (
                                <span key={idx} className={s.tag}>
                                  {cls}
                                </span>
                              ))
                            ) : (
                              <span className={s.noData}>—</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`${s.statusBadge} ${student.status ? s.statusActive : s.statusInactive}`}
                          >
                            {getStatus(student.status)}
                          </span>
                        </td>
                        <td>
                          <div className={s.actions}>
                            <button
                              className={s.actionBtn}
                              onClick={() => handleEdit(student.id)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className={`${s.actionBtn} ${student.status ? s.actionDeactivate : s.actionActivate}`}
                              onClick={() => handleToggleStatus(student.id)}
                              title={
                                student.status
                                  ? "Deactivate"
                                  : "Activate"
                              }
                            >
                              <i
                                className={`bi ${student.status ? "bi-x-circle" : "bi-check-circle"}`}
                              ></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
