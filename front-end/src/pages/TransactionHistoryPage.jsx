import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import s from "../css/TransactionHistory.module.scss";

export default function TransactionHistoryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // Mock data — REPLACE WITH YOUR API
  const mockTransactions = [
    {
      id: 1,
      name: "Complete React Developer Course 2024",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
      type: "Course",
      amount: 299000,
      paidAt: "2024-02-15T14:30:25",
    },
    {
      id: 2,
      name: "Advanced JavaScript Masterclass",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400",
      type: "Class",
      amount: 450000,
      paidAt: "2024-02-15T10:15:42",
    },
    {
      id: 3,
      name: "UI/UX Design Fundamentals",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
      type: "Course",
      amount: 350000,
      paidAt: "2024-02-14T16:45:12",
    },
    {
      id: 4,
      name: "Python for Data Science",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
      type: "Course",
      amount: 399000,
      paidAt: "2024-02-10T09:20:05",
    },
    {
      id: 5,
      name: "Web Development Bootcamp",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
      type: "Class",
      amount: 599000,
      paidAt: "2024-02-10T13:55:30",
    },
    {
      id: 6,
      name: "Docker & Kubernetes Complete Guide",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1605745341075-e4c3a9b28df4?w=400",
      type: "Course",
      amount: 275000,
      paidAt: "2024-01-28T11:10:18",
    },
  ];

  useEffect(() => {
    // REPLACE THIS with your API call
    // Example:
    // fetchTransactions();
    setTransactions(mockTransactions);
  }, []);

  // Group transactions by date (dd/MM/yyyy)
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = formatDateOnly(transaction.paidAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(transaction);
    return groups;
  }, {});

  // Sort dates descending (newest first)
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split("/").map(Number);
    const [dayB, monthB, yearB] = b.split("/").map(Number);
    return (
      new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA)
    );
  });

  function formatDateOnly(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function formatDateTime(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  function calculateTotalByDate(date) {
    return groupedTransactions[date].reduce((sum, t) => sum + t.amount, 0);
  }

  const grandTotal = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      <title>Transaction History</title>
      <div className={s.history}>
        <div className="container">
          {/* Header */}
          <div className={s.header}>
            <div className={s.headerContent}>
              <h1 className={s.title}>
                <i className="bi bi-receipt"></i>
                Transaction History
              </h1>
              <p className={s.subtitle}>
                View your payment history and transaction details.
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className={s.summary}>
            <div className={s.summaryCard}>
              <div className={s.summaryIcon}>
                <i className="bi bi-cart-check"></i>
              </div>
              <div className={s.summaryContent}>
                <p className={s.summaryLabel}>Total Transactions</p>
                <p className={s.summaryValue}>{transactions.length}</p>
              </div>
            </div>
            <div className={s.summaryCard}>
              <div className={s.summaryIcon}>
                <i className="bi bi-wallet2"></i>
              </div>
              <div className={s.summaryContent}>
                <p className={s.summaryLabel}>Total Spent</p>
                <p className={s.summaryValue}>{formatCurrency(grandTotal)}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className={s.timeline}>
            {loading ? (
              <div className={s.loading}>
                <div className={s.spinner}></div>
                <p>Loading transactions…</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className={s.empty}>
                <i className="bi bi-inbox"></i>
                <h3>No Transactions Yet</h3>
                <p>
                  You haven't made any purchases yet. Start exploring our
                  courses!
                </p>
                <button
                  className={s.emptyBtn}
                  onClick={() => navigate("/public-courses")}
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              sortedDates.map((date) => (
                <div key={date} className={s.dateGroup}>
                  {/* Date header */}
                  <div className={s.dateHeader}>
                    <div className={s.dateBadge}>
                      <i className="bi bi-calendar-event"></i>
                      <span className={s.dateText}>{date}</span>
                    </div>
                    <div className={s.dateLine}></div>
                    <div className={s.dateTotal}>
                      {formatCurrency(calculateTotalByDate(date))}
                    </div>
                  </div>

                  {/* Transaction cards for this date */}
                  <div className={s.cards}>
                    {groupedTransactions[date].map((transaction) => (
                      <div key={transaction.id} className={s.card}>
                        {/* Thumbnail */}
                        <div className={s.cardImage}>
                          <img
                            src={transaction.thumbnailUrl}
                            alt={transaction.name}
                          />
                          <span className={s.typeBadge}>
                            <i
                              className={`bi ${transaction.type === "Course" ? "bi-book" : "bi-people"}`}
                            ></i>
                            {transaction.type}
                          </span>
                        </div>

                        {/* Content */}
                        <div className={s.cardBody}>
                          <h3 className={s.cardTitle}>{transaction.name}</h3>

                          <div className={s.cardMeta}>
                            <div className={s.metaItem}>
                              <i className="bi bi-clock"></i>
                              <span>{formatDateTime(transaction.paidAt)}</span>
                            </div>
                          </div>

                          <div className={s.cardFooter}>
                            <div className={s.amount}>
                              <span className={s.amountLabel}>Amount Paid</span>
                              <span className={s.amountValue}>
                                {formatCurrency(transaction.amount)}
                              </span>
                            </div>
                            <div className={s.status}>
                              <i className="bi bi-check-circle-fill"></i>
                              <span>Completed</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
