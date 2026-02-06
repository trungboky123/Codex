import { useEffect, useState } from "react";
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
  const emptyUser = {
    fullName: "",
    email: "",
    username: "",
    avatarUrl: "",
  };
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [role, setRole] = useState("");

  const languages = [
    { code: "vi", name: `${t("nav.lang.vietnam")}`, flag: "🇻🇳" },
    { code: "en", name: `${t("nav.lang.english")}`, flag: "🇺🇸" },
    { code: "fr", name: `${t("nav.lang.french")}`, flag: "🇫🇷" },
  ];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("lang", langCode);
    setSelectedLanguage(langCode);
  };

  const handleLogout = async () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    setUser(emptyUser);
    setRole("");

    await fetch("http://localhost:8080/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    navigate("/home");
  };

  async function getMe() {
    const res = await authFetch("http://localhost:8080/users/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getCurrentLanguage = () => {
    return languages.find((lang) => lang.code === selectedLanguage);
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container">
        <Link to={"/home"} className="navbar-brand">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB-bPDeH5tq3NmV-weR7J6MjCfIeblCnf9tA&s"
            alt=""
            style={{ height: "45px" }}
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
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
            {/* User Auth Section */}
            {!user.username ? (
              <>
                <div className="auth-buttons">
                  <Link
                    to="/login"
                    className="btn btn-outline-primary"
                    style={{ marginRight: "10px" }}
                  >
                    {t("nav.login")}
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    {t("nav.register")}
                  </Link>
                </div>

                <div className="language-dropdown me-3">
                  <button
                    className="btn btn-link nav-link dropdown-toggle d-flex align-items-center"
                    data-bs-toggle="dropdown"
                    id="languageDropdown"
                  >
                    <span className="flag-icon me-2">
                      {getCurrentLanguage()?.flag}
                    </span>
                    <span className="language-name">
                      {getCurrentLanguage()?.name}
                    </span>
                  </button>

                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="languageDropdown"
                  >
                    {languages.map((language) => (
                      <li key={language.code}>
                        <button
                          className={`dropdown-item ${selectedLanguage === language.code ? "active" : ""}`}
                          onClick={() => handleLanguageChange(language.code)}
                        >
                          <span className="flag-icon me-2">
                            {language.flag}
                          </span>
                          {language.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : role === "ROLE_ADMIN" ? (
              <>
                <ul className="navbar-nav">
                  <li className="navbar-item dropdown">
                    <Link
                      to={"/home"}
                      className="nav-link dropdown-toggle d-flex align-items-center"
                      data-bs-toggle="dropdown"
                      id="userDropdown"
                    >
                      <img
                        src={user.avatarUrl || defaultAvatar}
                        alt="Avatar"
                        className="rounded-circle me-2"
                        width={40}
                        height={40}
                      />
                      {user.fullName}
                    </Link>

                    <ul
                      className="dropdown-menu dropdown-menu-end"
                      aria-labelledby="userDropdown"
                    >
                      <li>
                        <Link className="dropdown-item" to="/profile">
                          {t("nav.profile")}
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/admin/dashboard">
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={handleLogout}
                        >
                          <i className="fa fa-sign-out-alt me-2"></i>
                          {t("nav.logout")}
                        </button>
                      </li>
                    </ul>
                  </li>
                </ul>
                <div className="language-dropdown ms-2">
                  <button
                    className="btn btn-link nav-link dropdown-toggle d-flex align-items-center"
                    data-bs-toggle="dropdown"
                    id="languageDropdown"
                  >
                    <span className="flag-icon me-2">
                      {getCurrentLanguage()?.flag}
                    </span>
                    <span className="language-name">
                      {getCurrentLanguage()?.name}
                    </span>
                  </button>

                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="languageDropdown"
                  >
                    {languages.map((language) => (
                      <li key={language.code}>
                        <button
                          className={`dropdown-item ${selectedLanguage === language.code ? "active" : ""}`}
                          onClick={() => handleLanguageChange(language.code)}
                        >
                          <span className="flag-icon me-2">
                            {language.flag}
                          </span>
                          {language.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <>
                <ul className="navbar-nav">
                  <li className="navbar-item dropdown">
                    <Link
                      to={"/home"}
                      className="nav-link dropdown-toggle d-flex align-items-center"
                      data-bs-toggle="dropdown"
                      id="userDropdown"
                    >
                      <img
                        src={user.avatarUrl || defaultAvatar}
                        alt="Avatar"
                        className="rounded-circle me-2"
                        width={40}
                        height={40}
                      />
                      {user.fullName}
                    </Link>

                    <ul
                      className="dropdown-menu dropdown-menu-end"
                      aria-labelledby="userDropdown"
                    >
                      <li>
                        <Link className="dropdown-item" to="/profile">
                          {t("nav.profile")}
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/wishlist">
                          {t("nav.wishlist")}
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/my-courses">
                          {t("nav.myCourses")}
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/my-classes">
                          {t("nav.myClasses")}
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/my-enrollments">
                          {t("nav.enrollments")}
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={handleLogout}
                        >
                          <i className="fa fa-sign-out-alt me-2"></i>
                          {t("nav.logout")}
                        </button>
                      </li>
                    </ul>
                  </li>
                </ul>

                <div className="language-dropdown ms-2">
                  <button
                    className="btn btn-link nav-link dropdown-toggle d-flex align-items-center"
                    data-bs-toggle="dropdown"
                    id="languageDropdown"
                  >
                    <span className="flag-icon me-2">
                      {getCurrentLanguage()?.flag}
                    </span>
                    <span className="language-name">
                      {getCurrentLanguage()?.name}
                    </span>
                  </button>

                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="languageDropdown"
                  >
                    {languages.map((language) => (
                      <li key={language.code}>
                        <button
                          className={`dropdown-item ${selectedLanguage === language.code ? "active" : ""}`}
                          onClick={() => handleLanguageChange(language.code)}
                        >
                          <span className="flag-icon me-2">
                            {language.flag}
                          </span>
                          {language.name}
                        </button>
                      </li>
                    ))}
                  </ul>
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
