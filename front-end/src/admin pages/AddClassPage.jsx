import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import s from "../css/AddClass.module.scss";
import authFetch from "../function/authFetch";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function AddClassPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [newData, setNewData] = useState({
    name: "",
    listedPrice: "",
    salePrice: "",
    instructorId: "",
    startDate: "",
    endDate: "",
    description: "",
    status: true,
    categoryIds: [],
  });
  const { sidebarCollapsed } = useOutletContext();
  const [previewThumbnail, setPreviewThumbnail] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Quill modules config
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
  }, []);

  async function fetchInstructors() {
    const res = await authFetch(
      "http://localhost:8080/users/instructors/getAll",
      {
        method: "GET",
      },
    );
    const data = await res.json();
    setInstructors(data.content || data || []);
  }

  async function fetchCategories() {
    const res = await authFetch("http://localhost:8080/settings/categories", {
      method: "GET",
    });
    const data = await res.json();
    setCategories(data.content || data || []);
  }

  const handleChange = (field, value) => {
    setNewData({ ...newData, [field]: value });
  };

  function handleCategoryChange(categoryId) {
    setNewData((prev) => {
      const exists = prev.categoryIds.includes(categoryId);

      return {
        ...prev,
        categoryIds: exists
          ? prev.categoryIds.filter((id) => id !== categoryId)
          : [...prev.categoryIds, categoryId],
      };
    });
  }

  function handleInstructorChange(e) {
    const instId = Number(e.target.value);
    setNewData({
      ...newData,
      instructorId: instId,
    });
  }

  function handleDescriptionChange(value) {
    setNewData({ ...newData, description: value });
  }

  function toISODate(display) {
    if (!display) return "";
    // If not complete DD/MM/YYYY format yet, return as is for typing
    if (!display.includes("/")) return display;
    const parts = display.split("/");
    if (parts.length !== 3) return display;
    const [d, m, y] = parts;
    if (!d || !m || !y) return display;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
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

    const res = await authFetch("http://localhost:8080/classes/create", {
      method: "POST",
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
      navigate("/admin/class-list");
    }, 1800);
  }

  const formatPrice = (price) => {
    if (!price) return "";
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const calculateDiscount = () => {
    if (!newData.salePrice || !newData.listedPrice) return 0;
    const discount =
      ((newData.listedPrice - newData.salePrice) / newData.listedPrice) * 100;
    return Math.round(discount);
  };

  return (
    <div className={s.layout}>
      <title>Add Class</title>
      <div className={`${s.main} ${sidebarCollapsed ? s.mainCollapsed : ""}`}>
        <div className={s.wrapper}>
          {/* Breadcrumb */}
          <div className={s.breadcrumb}>
            <span
              className={s.breadcrumbLink}
              onClick={() => navigate("/admin/class-list")}
            >
              <i className="bi bi-laptop"></i>
              Classes
            </span>
            <i className="bi bi-chevron-right"></i>
            <span className={s.breadcrumbCurrent}>Add Class</span>
          </div>

          {/* Page Header */}
          <div className={s.pageHeader}>
            <div>
              <h1 className={s.pageTitle}>Add Class</h1>
              <p className={s.pageSubtitle}>
                Create a new course with all necessary details
              </p>
            </div>
            <button
              className={s.backBtn}
              onClick={() => navigate("/admin/class-list")}
            >
              <i className="bi bi-arrow-left"></i>
              Back to Class List
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave}>
            <div className={s.formGrid}>
              {/* Left Column: Thumbnail + Pricing + Status */}
              <div className={s.leftColumn}>
                {/* Thumbnail Card */}
                <div className={s.card}>
                  <h3 className={s.cardTitle}>
                    <i className="bi bi-image"></i>
                    Class Thumbnail
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
                        onChange={(e) =>
                          handleChange("salePrice", e.target.value)
                        }
                        placeholder="Enter sale price (optional)"
                        className={s.input}
                      />
                    </div>
                  </div>

                  {newData.listedPrice && (
                    <div className={s.discountPreview}>
                      <div className={s.discountInfo}>
                        <span className={s.discountLabel}>Discount:</span>
                        <span className={s.discountValue}>
                          {calculateDiscount()}% OFF
                        </span>
                      </div>
                      <div className={s.pricePreview}>
                        <span className={s.originalPrice}>
                          {formatPrice(newData.listedPrice)}₫
                        </span>
                        <span className={s.salePrice}>
                          {formatPrice(newData.salePrice)}₫
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
                      className={`${s.radioItem} ${newData.status ? s.radioActive : ""}`}
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={newData.status}
                        onChange={() => handleChange("status", true)}
                        className={s.radioInput}
                      />
                      <div className={s.radioBox}>
                        <div className={s.radioCircle}></div>
                        <div>
                          <span className={s.radioLabel}>Active</span>
                          <span className={s.radioDesc}>
                            Class is visible to students
                          </span>
                        </div>
                      </div>
                    </label>

                    <label
                      className={`${s.radioItem} ${!newData.status ? s.radioActive : ""}`}
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={!newData.status}
                        onChange={() => handleChange("status", false)}
                        className={s.radioInput}
                      />
                      <div className={s.radioBox}>
                        <div className={s.radioCircle}></div>
                        <div>
                          <span className={s.radioLabel}>Inactive</span>
                          <span className={s.radioDesc}>
                            Class is hidden from students
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Class Info */}
              <div className={s.rightColumn}>
                <div className={s.card}>
                  <h3 className={s.cardTitle}>
                    <i className="bi bi-info-circle-fill"></i>
                    Class Information
                  </h3>

                  <div className={s.formGroup}>
                    <label className={s.label}>Class Name</label>
                    <div className={s.inputWrapper}>
                      <i className="bi bi-laptop"></i>
                      <input
                        type="text"
                        name="name"
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Enter class name"
                        className={s.input}
                        required
                      />
                    </div>
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.label}>Categories</label>
                    <div className={s.categoriesGrid}>
                      {categories.map((category) => {
                        const isSelected = newData.categoryIds.includes(
                          category.id,
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
                              className={s.categoryCheckbox}
                            />
                            <span className={s.categoryName}>
                              {category.name}
                            </span>
                            {isSelected && (
                              <i className="bi bi-check-circle-fill"></i>
                            )}
                          </label>
                        );
                      })}
                    </div>
                    {newData.categoryIds.length === 0 && (
                      <p className={s.categoryHint}>
                        <i className="bi bi-info-circle"></i>
                        Select at least one category
                      </p>
                    )}
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.label}>Instructor</label>
                    <div className={s.selectWrapper}>
                      <select
                        name="instructorId"
                        onChange={handleInstructorChange}
                        className={s.select}
                        required
                      >
                        <option value="">Select Instructor</option>
                        {instructors.map((instructor) => (
                          <option key={instructor.id} value={instructor.id}>
                            {instructor.fullName}
                          </option>
                        ))}
                      </select>
                      <i className="bi bi-chevron-down"></i>
                    </div>
                  </div>

                  <div className={s.formRow}>
                    <div className={s.formGroup}>
                      <label className={s.label}>Start Date</label>
                      <div className={s.inputWrapper}>
                        <i className="bi bi-calendar-event"></i>
                        <input
                          type="text"
                          name="startDate"
                          onChange={(e) =>
                            handleChange("startDate", toISODate(e.target.value))
                          }
                          placeholder="dd/MM/yyyy"
                          className={s.input}
                          required
                        />
                      </div>
                    </div>

                    <div className={s.formGroup}>
                      <label className={s.label}>End Date</label>
                      <div className={s.inputWrapper}>
                        <i className="bi bi-calendar-check"></i>
                        <input
                          type="text"
                          name="endDate"
                          onChange={(e) =>
                            handleChange("endDate", toISODate(e.target.value))
                          }
                          placeholder="dd/MM/yyyy"
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
                        onChange={handleDescriptionChange}
                        modules={modules}
                        formats={formats}
                        placeholder="Write class description here..."
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
                          <i className="bi bi-floppy"></i>
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
