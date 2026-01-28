import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import s from "../css/Dashboard.module.scss";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSideBar";
import authFetch from "../function/authFetch";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function AdminDashboard() {
  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Stats data - Replace with API fetch
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalClasses: 0,
    monthlyRevenue: 0,
  });

  // Monthly revenue data - Replace with API fetch
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);

  // Top selling courses - Replace with API fetch
  const [topCourses, setTopCourses] = useState([]);

  // Top selling classes - Replace with API fetch
  const [topClasses, setTopClasses] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // TODO: Replace with actual API calls
    // const statsRes = await fetch('/api/admin/stats');
    // const revenueRes = await fetch('/api/admin/monthly-revenue');
    // const coursesRes = await fetch('/api/admin/top-courses');
    // const classesRes = await fetch('/api/admin/top-classes');

    // Mock data - Replace with actual API data

    setMonthlyRevenueData([
      45000000, 52000000, 48000000, 61000000, 58000000, 72000000, 85000000,
      91000000, 88000000, 95000000, 102000000, 125000000,
    ]);
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Chart configuration
  const revenueChartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Monthly Revenue",
        data: monthlyRevenueData,
        borderColor: "#667eea",
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "#667eea",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1f2937",
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#374151",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) => formatCurrency(context.parsed.y),
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#f3f4f6",
          drawBorder: false,
        },
        ticks: {
          callback: (value) => {
            return value >= 1000000 ? `${value / 1000000}M` : value;
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const statsCards = [
    {
      title: "Total Users",
      value: formatNumber(stats.totalUsers),
      icon: "bi-people-fill",
      color: "#667eea",
      bgColor: "rgba(102, 126, 234, 0.1)",
      change: "+12.5%",
      changeType: "up",
    },
    {
      title: "Total Courses",
      value: formatNumber(stats.totalCourses),
      icon: "bi-book-fill",
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.1)",
      change: "+8.2%",
      changeType: "up",
    },
    {
      title: "Total Classes",
      value: formatNumber(stats.totalClasses),
      icon: "bi-laptop",
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.1)",
      change: "+5.7%",
      changeType: "up",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.monthlyRevenue),
      icon: "bi-currency-dollar",
      color: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.1)",
      change: "+18.3%",
      changeType: "up",
    },
  ];

  useEffect(() => {
    getTotalUsers();
    getTotalCourses();
    getTotalClasses();
    getTotalRevenue();
    getTopSoldCourses();
    getTopSoldClasses();
  }, [])

  async function getTotalUsers() {
    const res = await authFetch("http://localhost:8080/users/total", {
      method: "GET"
    });
    const data = await res.json();
    setStats(prev => ({
      ...prev,
      totalUsers: data.totalUsers
    }))
  };

  async function getTotalCourses() {
    const res = await authFetch("http://localhost:8080/courses/total", {
      method: "GET"
    });
    const data = await res.json();
    setStats(prev => ({
      ...prev,
      totalCourses: data.totalCourses
    }))
  };

  async function getTotalClasses() {
    const res = await authFetch("http://localhost:8080/classes/total", {
      method: "GET"
    });
    const data = await res.json();
    setStats(prev => ({
      ...prev,
      totalClasses: data.totalClasses
    }))
  };

  async function getTotalRevenue() {
    const res = await authFetch("http://localhost:8080/enrollments/total-revenue", {
      method: "GET"
    });
    const data = await res.json();
    setStats(prev => ({
      ...prev,
      monthlyRevenue: data.totalRevenue
    }))
  };

  async function getTopSoldCourses() {
    const res = await authFetch("http://localhost:8080/enrollments/top-courses", {
      method: "GET"
    });
    const data = await res.json();
    setTopCourses(data);
  };

  async function getTopSoldClasses() {
    const res = await authFetch("http://localhost:8080/enrollments/top-classes", {
      method: "GET"
    });
    const data = await res.json();
    setTopClasses(data);
  };

  return (
    <>
      <title>Dashboard</title>
      <AdminHeader sidebarCollapsed={sidebarCollapsed} />
      <AdminSidebar onCollapseChange={handleSidebarCollapse} />

      <div
        className={s.dashboard}
        style={{
          marginLeft: sidebarCollapsed ? "85px" : "280px",
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className={s.container}>
          {/* Header */}
          <div className={s.header}>
            <div>
              <h1 className={s.title}>Admin Dashboard</h1>
              <p className={s.subtitle}>
                Welcome back! Here's what's happening today.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={s.statsGrid}>
            {statsCards.map((card, index) => (
              <div key={index} className={s.statCard}>
                <div className={s.statCardHeader}>
                  <div
                    className={s.statIcon}
                    style={{ backgroundColor: card.bgColor }}
                  >
                    <i
                      className={`bi ${card.icon}`}
                      style={{ color: card.color }}
                    ></i>
                  </div>
                </div>
                <div className={s.statCardBody}>
                  <h3 className={s.statValue}>{card.value}</h3>
                  <p className={s.statTitle}>{card.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className={s.chartSection}>
            <div className={s.chartCard}>
              <div className={s.chartHeader}>
                <div>
                  <h2 className={s.chartTitle}>Revenue Overview</h2>
                  <p className={s.chartSubtitle}>Monthly revenue for 2024</p>
                </div>
                <div className={s.chartLegend}>
                  <div className={s.legendItem}>
                    <span className={s.legendDot}></span>
                    <span>Revenue</span>
                  </div>
                </div>
              </div>
              <div className={s.chartBody}>
                <Line data={revenueChartData} options={revenueChartOptions} />
              </div>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className={s.topSellingGrid}>
            {/* Top Courses */}
            <div className={s.topSellingCard}>
              <div className={s.topSellingHeader}>
                <h2 className={s.topSellingTitle}>
                  <i className="bi bi-trophy-fill"></i>
                  Top 3 Selling Courses
                </h2>
              </div>
              <div className={s.topSellingBody}>
                {topCourses.map((course, index) => (
                  <div key={course.id} className={s.topItem}>
                    <div className={s.topItemRank}>{index + 1}</div>
                    <img
                      src={course.thumbnailUrl}
                      alt={course.courseName}
                      className={s.topItemImage}
                    />
                    <div className={s.topItemInfo}>
                      <h4 className={s.topItemName}>{course.name}</h4>
                      <p className={s.topItemStats}>
                        {course.totalSold} sold • {formatCurrency(course.totalRevenue)}
                      </p>
                    </div>
                    <div className={s.topItemBadge}>
                      <i className="bi bi-fire"></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Classes */}
            <div className={s.topSellingCard}>
              <div className={s.topSellingHeader}>
                <h2 className={s.topSellingTitle}>
                  <i className="bi bi-trophy-fill"></i>
                  Top 3 Selling Classes
                </h2>
              </div>
              <div className={s.topSellingBody}>
                {topClasses.map((clazz, index) => (
                  <div key={clazz.id} className={s.topItem}>
                    <div className={s.topItemRank}>{index + 1}</div>
                    <img
                      src={clazz.thumbnailUrl}
                      alt={clazz.className}
                      className={s.topItemImage}
                    />
                    <div className={s.topItemInfo}>
                      <h4 className={s.topItemName}>{clazz.className}</h4>
                      <p className={s.topItemStats}>
                        {clazz.totalSold} sold •{" "}
                        {formatCurrency(clazz.totalRevenue)}
                      </p>
                    </div>
                    <div className={s.topItemBadge}>
                      <i className="bi bi-star-fill"></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
