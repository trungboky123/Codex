import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import s from "../css/EditCourse.module.scss";
import authFetch from "../function/authFetch";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function EditCoursePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const { sidebarCollapsed } = useOutletContext();
  const [newData, setNewData] = useState({});

  const [course, setCourse] = useState({
    name: "",
    listedPrice: "",
    salePrice: "",
    thumbnailUrl: "",
    instructor: null,
    duration: "",
    categories: [],
    description: "",
    status: true,
  });

  const [categories, setCategories] = useState([]);
  const [previewThumbnail, setPreviewThumbnail] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "color",
    "background",
    "link",
  ];

  useEffect(() => {
    fetchInstructors();
    fetchCategories();
    fetchCourse();
  }, [id]);

  async function fetchCourse() {
    const res = await fetch(`http://localhost:8080/courses/${id}`, {
      method: "GET",
    });
    const data = await res.json();
    setCourse({
      name: data.name,
      listedPrice: data.listedPrice,
      salePrice: data.salePrice,
      thumbnailUrl: data.thumbnailUrl,
      instructor: data.instructor,
      categories: data.categories,
      duration: data.duration,
      description: data.description,
      status: data.status,
    });
    setPreviewThumbnail(data.thumbnailUrl);
  }

  async function fetchInstructors() {
    const res = await authFetch(
      "http://localhost:8080/users/instructors/getAll",
      {
        method: "GET",
      },
    );
    const data = await res.json();
    setInstructors(data);
  }

  async function fetchCategories() {
    const res = await fetch("http://localhost:8080/settings/categories", {
      method: "GET",
    });
    const data = await res.json();
    setCategories(data.content || data || []);
  }

  const handleChange = (field, value) => {
    setCourse({ ...course, [field]: value });
    setNewData({ ...newData, [field]: value });
  };

  function handleCategoryChange(categoryId) {
    const currentIds = [...(course.categories?.map((cat) => cat.id) || [])];
    const index = currentIds.indexOf(categoryId);

    if (index > -1) {
      currentIds.splice(index, 1);
    } else {
      currentIds.push(categoryId);
    }

    const selectedCategories = categories.filter((cat) =>
      currentIds.includes(cat.id),
    );

    setCourse({ ...course, categories: selectedCategories });
    setNewData({ ...newData, categoryIds: currentIds });
  }

  function handleThumbnailClick() {
    fileInputRef.current.click();
  }

  function handleThumbnailChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewThumbnail(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleInstructorChange(e) {
    const instId = Number(e.target.value);
    const selectedInst = instructors.find((i) => i.id === instId);
    setCourse({
      ...course,
      instructor: selectedInst,
    });
    setNewData({
      ...newData,
      instructorId: selectedInst.id,
    });
  }

  function handleRemoveThumbnail() {
    setPreviewThumbnail("");
    setThumbnailFile(null);
    fileInputRef.current.value = "";
  }

  async function handleSave(e) {
    e.preventDefault();
    const formData = new FormData();
    setIsSaving(true);
    setMessage("");

    formData.append(
      "data",
      new Blob([JSON.stringify({ ...newData })], { type: "application/json" }),
    );
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    const res = await authFetch(`http://localhost:8080/courses/update/${id}`, {
      method: "PATCH",
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
      setIsError(true);
      setMessage(data.message);
      setIsSaving(false);
      return;
    }

    setIsError(false);
    setMessage(data.message);
    setTimeout(() => {
      navigate("/admin/course-list");
    }, 1800);
  }

  const formatPrice = (price) => {
    if (!price) return "";
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const calculateDiscount = () => {
    if (!course.salePrice || !course.listedPrice) return 0;
    const discount =
      ((course.listedPrice - course.salePrice) / course.listedPrice) * 100;
    return Math.round(discount);
  };

  return (
    <div className={s.layout}>
      <title>Edit Course</title>
      <div className={`${s.main} ${sidebarCollapsed ? s.mainCollapsed : ""}`}>
        <div className={s.wrapper}>
          {/* Breadcrumb */}
          <div className={s.breadcrumb}>
            <span
              className={s.breadcrumbLink}
              onClick={() => navigate("/admin/course-list")}
            >
              <i className="bi bi-book-fill"></i>
              Courses
            </span>
            <i className="bi bi-chevron-right"></i>
            <span className={s.breadcrumbCurrent}>Edit Course</span>
          </div>

          {/* Page Header */}
          <div className={s.pageHeader}>
            <div>
              <h1 className={s.pageTitle}>Edit Course</h1>
              <p className={s.pageSubtitle}>
                Update course information and details
              </p>
            </div>
            <button
              className={s.backBtn}
              onClick={() => navigate("/admin/courses")}
            >
              <i className="bi bi-arrow-left"></i>
              Back to Course List
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave}>
            <div className={s.formGrid}>
              {/* Left Column: Thumbnail + Pricing */}
              <div className={s.leftColumn}>
                {/* Thumbnail Card */}
                <div className={s.card}>
                  <h3 className={s.cardTitle}>
                    <i className="bi bi-image"></i>
                    Course Thumbnail
                  </h3>

                  <div className={s.thumbnailWrapper}>
                    <div
                      className={s.thumbnailPreview}
                      onClick={handleThumbnailClick}
                    >
                      {previewThumbnail ? (
                        <img
                          src={previewThumbnail}
                          alt="Thumbnail"
                          className={s.thumbnailImg}
                        />
                      ) : (
                        <div className={s.thumbnailPlaceholder}>
                          <i className="bi bi-image"></i>
                          <span>No Image</span>
                        </div>
                      )}
                      <div className={s.thumbnailOverlay}>
                        <i className="bi bi-camera"></i>
                        <span>Change Image</span>
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className={s.fileInput}
                    />

                    <div className={s.thumbnailActions}>
                      {previewThumbnail && (
                        <button
                          type="button"
                          className={s.removeBtn}
                          onClick={handleRemoveThumbnail}
                        >
                          <i className="bi bi-trash"></i>
                          Remove
                        </button>
                      )}
                    </div>
                    <p className={s.thumbnailNote}>
                      Recommended: 1280x720px, JPG/PNG, max 5MB
                    </p>
                  </div>
                </div>

                {/* Pricing Card */}
                <div className={s.card}>
                  <h3 className={s.cardTitle}>
                    <i className="bi bi-tag-fill"></i>
                    Pricing
                  </h3>

                  <div className={s.formGroup}>
                    <label className={s.label}>Listed Price (VND)</label>
                    <div className={s.inputWrapper}>
                      <i className="bi bi-cash"></i>
                      <input
                        type="number"
                        name="listedPrice"
                        value={course.listedPrice}
                        onChange={(e) =>
                          handleChange("listedPrice", e.target.value)
                        }
                        placeholder="Enter listed price"
                        className={s.input}
                        required
                      />
                    </div>
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.label}>Sale Price (VND)</label>
                    <div className={s.inputWrapper}>
                      <i className="bi bi-percent"></i>
                      <input
                        type="number"
                        name="salePrice"
                        value={course.salePrice}
                        onChange={(e) =>
                          handleChange("salePrice", e.target.value)
                        }
                        placeholder="Enter sale price (optional)"
                        className={s.input}
                      />
                    </div>
                  </div>

                  {course.listedPrice && (
                    <div className={s.discountPreview}>
                      <div className={s.discountInfo}>
                        <span className={s.discountLabel}>Discount:</span>
                        <span className={s.discountValue}>
                          {calculateDiscount()}% OFF
                        </span>
                      </div>
                      <div className={s.pricePreview}>
                        <span className={s.originalPrice}>
                          {formatPrice(course.listedPrice)}₫
                        </span>
                        <span className={s.salePrice}>
                          {formatPrice(course.salePrice)}₫
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Card */}
                <div className={s.card}>
                  <h3 className={s.cardTitle}>
                    <i className="bi bi-toggle-on"></i>
                    Status
                  </h3>

                  <div className={s.radioGroup}>
                    <label
                      className={`${s.radioItem} ${course.status ? s.radioActive : ""}`}
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={course.status}
                        onChange={() => handleChange("status", true)}
                        className={s.radioInput}
                      />
                      <div className={s.radioBox}>
                        <div className={s.radioCircle}></div>
                        <div>
                          <span className={s.radioLabel}>Active</span>
                          <span className={s.radioDesc}>
                            Course is visible to students
                          </span>
                        </div>
                      </div>
                    </label>

                    <label
                      className={`${s.radioItem} ${!course.status ? s.radioActive : ""}`}
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={!course.status}
                        onChange={() => handleChange("status", false)}
                        className={s.radioInput}
                      />
                      <div className={s.radioBox}>
                        <div className={s.radioCircle}></div>
                        <div>
                          <span className={s.radioLabel}>Inactive</span>
                          <span className={s.radioDesc}>
                            Course is hidden from students
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Course Info */}
              <div className={s.rightColumn}>
                <div className={s.card}>
                  <h3 className={s.cardTitle}>
                    <i className="bi bi-info-circle-fill"></i>
                    Course Information
                  </h3>

                  <div className={s.formGroup}>
                    <label className={s.label}>Course Name</label>
                    <div className={s.inputWrapper}>
                      <i className="bi bi-book"></i>
                      <input
                        type="text"
                        name="name"
                        value={course.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Enter course name"
                        className={s.input}
                        required
                      />
                    </div>
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.label}>Categories</label>
                    <div className={s.categoriesGrid}>
                      {categories.map((category) => {
                        const isSelected = course.categories.some(
                          (cat) => cat.id === category.id,
                        );
                        return (
                          <label
                            key={category.id}
                            className={`${s.categoryItem} ${
                              isSelected ? s.categorySelected : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCategoryChange(category.id)}
                            />
                            <span>{category.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    {course.categories.length === 0 && (
                      <p className={s.categoryHint}>
                        <i className="bi bi-info-circle"></i>
                        Select at least one category
                      </p>
                    )}
                  </div>

                  <div className={s.formRow}>
                    <div className={s.formGroup}>
                      <label className={s.label}>Instructor</label>
                      <div className={s.selectWrapper}>
                        <select
                          name="instructorId"
                          value={course.instructor?.id}
                          onChange={handleInstructorChange}
                          className={s.select}
                          required
                        >
                          {instructors.map((instructor) => (
                            <option key={instructor.id} value={instructor.id}>
                              {instructor.fullName}
                            </option>
                          ))}
                        </select>
                        <i className="bi bi-chevron-down"></i>
                      </div>
                    </div>

                    <div className={s.formGroup}>
                      <label className={s.label}>Duration</label>
                      <div className={s.inputWrapper}>
                        <i className="bi bi-clock"></i>
                        <input
                          type="text"
                          name="duration"
                          value={course.duration}
                          onChange={(e) =>
                            handleChange("duration", e.target.value)
                          }
                          placeholder="e.g., 12 hours"
                          className={s.input}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.label}>Description</label>
                    <div className={s.editorWrapper}>
                      <ReactQuill
                        theme="snow"
                        value={course.description}
                        onChange={(value) => handleChange("description", value)}
                        modules={modules}
                        formats={formats}
                        placeholder="Write course description here..."
                        className={s.editor}
                      />
                    </div>
                  </div>

                  {/* Message */}
                  {message && (
                    <p
                      className={`${s.message} ${isError ? s.messageError : s.messageSuccess}`}
                    >
                      <i
                        className={
                          isError
                            ? "bi bi-exclamation-circle"
                            : "bi bi-check-circle"
                        }
                      ></i>
                      {message}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className={s.actions}>
                    <button
                      type="button"
                      className={s.cancelBtn}
                      onClick={() => navigate(-1)}
                    >
                      <i className="bi bi-x-lg"></i>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={s.saveBtn}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <i className="bi bi-arrow-repeat"></i>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-floppy-disk"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
