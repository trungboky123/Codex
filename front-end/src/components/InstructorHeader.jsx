import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import s from "../css/AdminHeader.module.scss";
import authFetch from "../function/authFetch";
import { useTranslation } from "react-i18next";

export default function InstructorHeader({ sidebarCollapsed }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    username: "",
    avatarUrl: "",
  });

  const languages = [
    { code: "vi", name: `${t("nav.lang.vietnam")}`, flag: "🇻🇳" },
    { code: "en", name: `${t("nav.lang.english")}`, flag: "🇺🇸" },
    { code: "fr", name: `${t("nav.lang.french")}`, flag: "🇫🇷" },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("lang", langCode);
    setSelectedLanguage(langCode);
    setLangDropdownOpen(false);
  };

  const getCurrentLanguage = () => {
    return (
      languages.find((lang) => lang.code === selectedLanguage) ?? languages[0]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target)
      ) {
        setLangDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (token) {
      getMe();
    }
  }, [navigate]);

  const handleLogout = async () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    setUser(null);

    await fetch("http://localhost:8080/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    navigate("/home");
  };

  const handleProfile = () => {
    navigate("/profile");
    setDropdownOpen(false);
  };

  async function getMe() {
    const res = await authFetch("http://localhost:8080/users/me", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setUser(data);
  }

  const currentLang = getCurrentLanguage();

  return (
    <header className={`${s.header} ${sidebarCollapsed ? s.collapsed : ""}`}>
      <div className={s.container}>
        {/* Left — Home Button */}
        <div className={s.left}>
          <button onClick={() => navigate("/home")} className={s.homeBtn}>
            <i className="bi bi-house-door-fill"></i>
            <span>{t("admin.header.homepage")}</span>
          </button>
        </div>
        {/* Right — Language + User */}
        <div className={s.right}>
          {/* ── User dropdown ── */}
          <div className={s.userSection} ref={dropdownRef}>
            <button
              className={s.userBtn}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img
                src={user?.avatarUrl || "https://via.placeholder.com/40"}
                alt={user?.fullName || "User"}
                className={s.avatar}
              />
              <span className={s.userName}>
                {user?.fullName || "Admin User"}
              </span>
              <i
                className={`bi bi-chevron-down ${s.chevron} ${dropdownOpen ? s.chevronOpen : ""}`}
              ></i>
            </button>

            {dropdownOpen && (
              <div className={s.dropdown}>
                <button onClick={handleProfile} className={s.dropdownItem}>
                  <i className="bi bi-person"></i>
                  <span>{t("nav.profile")}</span>
                </button>
                <div className={s.dropdownDivider}></div>
                <button onClick={handleLogout} className={s.dropdownItem}>
                  <i className="bi bi-box-arrow-right"></i>
                  <span>{t("nav.logout")}</span>
                </button>
              </div>
            )}
          </div>

          <div className={s.langSection} ref={langDropdownRef}>
            <button
              className={`${s.langBtn} ${langDropdownOpen ? s.langBtnOpen : ""}`}
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            >
              <span className={s.langFlag}>{currentLang.flag}</span>
              <span className={s.langName}>{currentLang.name}</span>
              <i
                className={`bi bi-chevron-down ${s.chevron} ${langDropdownOpen ? s.chevronOpen : ""}`}
              ></i>
            </button>

            {langDropdownOpen && (
              <div className={s.langDropdown}>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`${s.langItem} ${selectedLanguage === lang.code ? s.langItemActive : ""}`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    <span className={s.langFlag}>{lang.flag}</span>
                    <span className={s.langItemName}>{lang.name}</span>
                    {selectedLanguage === lang.code && (
                      <i className="bi bi-check-lg"></i>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
