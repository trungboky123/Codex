import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import defaultAvatar from "../images/default-avatar.png";
import "../css/Header.css";
import authFetch from "../function/authFetch";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [user, setUser] = useState({
    fullName: "",
    email: "",
    username: "",
    avatarUrl: "",
  });
  const emptyUser = { fullName: "", email: "", username: "", avatarUrl: "" };
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [role, setRole] = useState("");

  // Dropdown states
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Refs for click-outside detection
  const userDropdownRef = useRef(null);
  const langDropdownRef = useRef(null);

  const languages = [
    { code: "vi", name: `${t("nav.lang.vietnam")}`, flag: "🇻🇳" },
    { code: "en", name: `${t("nav.lang.english")}`, flag: "🇺🇸" },
    { code: "fr", name: `${t("nav.lang.french")}`, flag: "🇫🇷" },
  ];

  const getCurrentLanguage = () =>
    languages.find((lang) => lang.code === selectedLanguage) ?? languages[0];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("lang", langCode);
    setSelectedLanguage(langCode);
    setLangDropdownOpen(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    setUser(emptyUser);
    setRole("");
    setUserDropdownOpen(false);
    await fetch("http://localhost:8080/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/home");
  };

  async function getMe() {
    const res = await authFetch("http://localhost:8080/users/me", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setUser(data);
  }

  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (token) {
      setRole(jwtDecode(token).roles[0]);
      getMe();
    }
  }, [navigate]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target)
      )
        setUserDropdownOpen(false);
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(e.target)
      )
        setLangDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setLangDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const currentLang = getCurrentLanguage();

  return (
    <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container">
        {/* Brand */}
        <Link to="/home" className="navbar-brand">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB-bPDeH5tq3NmV-weR7J6MjCfIeblCnf9tA&s"
            alt=""
            style={{ height: "45px" }}
          />
        </Link>

        {/* Bootstrap toggler — còn giữ để mobile collapse hoạt động */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Nav links */}
          <ul className="navbar-nav me-auto ms-4">
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/public-courses") ? "active" : ""}`}
                to="/public-courses"
              >
                {t("nav.course")}
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/public-classes") ? "active" : ""}`}
                to="/public-classes"
              >
                {t("nav.class")}
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/blog") ? "active" : ""}`}
                to="/blog"
              >
                {t("nav.blog")}
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center">
            {/* ── GUEST ───────────────────────────────────────────────── */}
            {!user.username ? (
              <>
                <div className="auth-buttons me-2">
                  <Link to="/login" className="btn btn-outline-primary">
                    {t("nav.login")}
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    {t("nav.register")}
                  </Link>
                </div>

                {/* Language */}
                <div className="hd-dropdown" ref={langDropdownRef}>
                  <button
                    className={`hd-lang-btn ${langDropdownOpen ? "open" : ""}`}
                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  >
                    <span className="flag-icon">{currentLang.flag}</span>
                    <span className="language-name">{currentLang.name}</span>
                    <i
                      className={`bi bi-chevron-down hd-chevron ${langDropdownOpen ? "rotate" : ""}`}
                    ></i>
                  </button>

                  {langDropdownOpen && (
                    <div className="hd-menu lang-menu">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          className={`hd-item ${selectedLanguage === lang.code ? "active" : ""}`}
                          onClick={() => handleLanguageChange(lang.code)}
                        >
                          <span className="flag-icon">{lang.flag}</span>
                          <span className="language-name">{lang.name}</span>
                          {selectedLanguage === lang.code && (
                            <i className="bi bi-check-lg hd-check"></i>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : role === "ROLE_ADMIN" ? (
              /* ── ADMIN ─────────────────────────────────────────────── */
              <>
                {/* User dropdown */}
                <div className="hd-dropdown" ref={userDropdownRef}>
                  <button
                    className={`hd-user-btn ${userDropdownOpen ? "open" : ""}`}
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  >
                    <img
                      src={user.avatarUrl || defaultAvatar}
                      alt="Avatar"
                      className="hd-avatar"
                    />
                    <span className="hd-username">{user.fullName}</span>
                    <i
                      className={`bi bi-chevron-down hd-chevron ${userDropdownOpen ? "rotate" : ""}`}
                    ></i>
                  </button>

                  {userDropdownOpen && (
                    <div className="hd-menu user-menu">
                      <Link
                        className="hd-item"
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <i className="bi bi-person"></i>
                        {t("nav.profile")}
                      </Link>
                      <Link
                        className="hd-item"
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <i className="bi bi-grid"></i>
                        Dashboard
                      </Link>
                      <div className="hd-divider"></div>
                      <button className="hd-item danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i>
                        {t("nav.logout")}
                      </button>
                    </div>
                  )}
                </div>

                {/* Language */}
                <div className="hd-dropdown ms-2" ref={langDropdownRef}>
                  <button
                    className={`hd-lang-btn ${langDropdownOpen ? "open" : ""}`}
                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  >
                    <span className="flag-icon">{currentLang.flag}</span>
                    <span className="language-name">{currentLang.name}</span>
                    <i
                      className={`bi bi-chevron-down hd-chevron ${langDropdownOpen ? "rotate" : ""}`}
                    ></i>
                  </button>

                  {langDropdownOpen && (
                    <div className="hd-menu lang-menu">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          className={`hd-item ${selectedLanguage === lang.code ? "active" : ""}`}
                          onClick={() => handleLanguageChange(lang.code)}
                        >
                          <span className="flag-icon">{lang.flag}</span>
                          <span className="language-name">{lang.name}</span>
                          {selectedLanguage === lang.code && (
                            <i className="bi bi-check-lg hd-check"></i>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* ── USER ──────────────────────────────────────────────── */
              <>
                {/* User dropdown */}
                <div className="hd-dropdown" ref={userDropdownRef}>
                  <button
                    className={`hd-user-btn ${userDropdownOpen ? "open" : ""}`}
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  >
                    <img
                      src={user.avatarUrl || defaultAvatar}
                      alt="Avatar"
                      className="hd-avatar"
                    />
                    <span className="hd-username">{user.fullName}</span>
                    <i
                      className={`bi bi-chevron-down hd-chevron ${userDropdownOpen ? "rotate" : ""}`}
                    ></i>
                  </button>

                  {userDropdownOpen && (
                    <div className="hd-menu user-menu">
                      <Link
                        className="hd-item"
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <i className="bi bi-person"></i>
                        {t("nav.profile")}
                      </Link>
                      <Link
                        className="hd-item"
                        to="/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <i className="bi bi-heart"></i>
                        {t("nav.wishlist")}
                      </Link>
                      <Link
                        className="hd-item"
                        to="/my-enrollments"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <i className="bi bi-journal-bookmark"></i>
                        {t("nav.myEnrollments")}
                      </Link>
                      <Link
                        className="hd-item"
                        to="/transaction-history"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <i className="bi bi-clock-history"></i>
                        {t("nav.history")}
                      </Link>
                      <div className="hd-divider"></div>
                      <button className="hd-item danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i>
                        {t("nav.logout")}
                      </button>
                    </div>
                  )}
                </div>

                {/* Language */}
                <div className="hd-dropdown ms-2" ref={langDropdownRef}>
                  <button
                    className={`hd-lang-btn ${langDropdownOpen ? "open" : ""}`}
                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  >
                    <span className="flag-icon">{currentLang.flag}</span>
                    <span className="language-name">{currentLang.name}</span>
                    <i
                      className={`bi bi-chevron-down hd-chevron ${langDropdownOpen ? "rotate" : ""}`}
                    ></i>
                  </button>

                  {langDropdownOpen && (
                    <div className="hd-menu lang-menu">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          className={`hd-item ${selectedLanguage === lang.code ? "active" : ""}`}
                          onClick={() => handleLanguageChange(lang.code)}
                        >
                          <span className="flag-icon">{lang.flag}</span>
                          <span className="language-name">{lang.name}</span>
                          {selectedLanguage === lang.code && (
                            <i className="bi bi-check-lg hd-check"></i>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
