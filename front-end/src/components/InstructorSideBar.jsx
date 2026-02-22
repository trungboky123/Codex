import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import s from "../css/AdminSideBar.module.scss";
import { useTranslation } from "react-i18next";

export default function InstructorSideBar({ onCollapseChange }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      path: "/instructor/student-list",
      icon: "bi-people-fill",
      label: "Student List",
    },
    {
      path: "/instructor/course-list",
      icon: "bi-book-fill",
      label: "Course List",
    },
    {
      path: "/instructor/class-list",
      icon: "bi-laptop",
      label: "Class List",
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);

    // Notify parent component about collapse state change
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  };

  // Notify parent on mount
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, []);

  return (
    <aside className={`${s.sidebar} ${isCollapsed ? s.collapsed : ""}`}>
      {/* Header */}
      <div className={s.header}>
        <div className={s.logo}>
          {!isCollapsed && <span className={s.logoText}>Code X</span>}
        </div>
        <button onClick={toggleSidebar} className={s.toggleBtn}>
          <i className="bi bi-list"></i>
        </button>
      </div>

      {/* Menu Items */}
      <nav className={s.nav}>
        <ul className={s.menu}>
          {menuItems.map((item) => (
            <li key={item.path} className={s.menuItem}>
              <Link
                to={item.path}
                className={`${s.menuLink} ${isActive(item.path) ? s.active : ""}`}
                title={isCollapsed ? item.label : ""}
              >
                <i className={`bi ${item.icon} ${s.icon}`}></i>
                {!isCollapsed && <span className={s.label}>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
