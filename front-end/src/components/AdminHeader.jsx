import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import s from "../css/AdminHeader.module.scss";
import authFetch from "../function/authFetch";

export default function AdminHeader({ sidebarCollapsed }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    username: "",
    avatarUrl: "",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
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
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setUser(data);
  }

  return (
    <header className={`${s.header} ${sidebarCollapsed ? s.collapsed : ""}`}>
      <div className={s.container}>
        {/* Left Section - Home Button */}
        <div className={s.left}>
          <button onClick={() => navigate("/home")} className={s.homeBtn}>
            <i className="bi bi-house-door-fill"></i>
            <span>Home Page</span>
          </button>
        </div>

        {/* Right Section - User Profile */}
        <div className={s.right}>
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

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className={s.dropdown}>
                <button onClick={handleProfile} className={s.dropdownItem}>
                  <i className="bi bi-person"></i>
                  <span>Profile</span>
                </button>
                <div className={s.dropdownDivider}></div>
                <button onClick={handleLogout} className={s.dropdownItem}>
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
