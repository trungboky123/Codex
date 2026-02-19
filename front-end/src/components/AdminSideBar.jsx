import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import s from "../css/AdminSideBar.module.scss";
import { useTranslation } from "react-i18next";

export default function AdminSidebar({ onCollapseChange }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: "bi-graph-up-arrow",
      label: "Dashboard",
    },
    {
      path: "/admin/account-list",
      icon: "bi-people-fill",
      label: t("admin.sidebar.accounts"),
    },
    {
      path: "/admin/course-list",
      icon: "bi-book-fill",
      label: t("admin.sidebar.courses"),
    },
    {
      path: "/admin/class-list",
      icon: "bi-laptop",
      label: t("admin.sidebar.classes"),
    },
    {
      path: "/admin/setting-list",
      icon: "bi-gear-fill",
      label: t("admin.sidebar.settings"),
    },
    {
      path: "/admin/poster-list",
      icon: "bi-file-earmark-text-fill",
      label: t("admin.sidebar.posters"),
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
