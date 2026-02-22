import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import s from "../css/TransactionHistory.module.scss";
import authFetch from "../function/authFetch";

export default function TransactionHistoryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [groupedData, setGroupedData] = useState([]); 

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await authFetch(
        "http://localhost:8080/payments/transaction-history",
        { method: "GET" },
      );
      if (!res.ok) {
        navigate("/login", { state: { from: location }, replace: true });
        return;
      }
      const data = await res.json();
      setGroupedData(data); 
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function formatDateOnly(dateString) {
    // dateString format: "2026-02-01" → "01/02/2026"
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }

  function formatDateTime(isoString) {
    // "2026-02-01T11:49:26" → "01/02/2026 11:49:26"
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

  function calculateTotalByDate(payments) {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }

  const grandTotal = groupedData.reduce(
    (sum, group) => sum + calculateTotalByDate(group.payments),
    0,
  );

  const totalTransactions = groupedData.reduce(
    (sum, group) => sum + group.payments.length,
    0,
  );

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
                <p className={s.summaryValue}>{totalTransactions}</p>
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
            ) : groupedData.length === 0 ? (
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
              groupedData.map((group) => (
                <div key={group.date} className={s.dateGroup}>
                  {/* Date header */}
                  <div className={s.dateHeader}>
                    <div className={s.dateBadge}>
                      <i className="bi bi-calendar-event"></i>
                      <span className={s.dateText}>
                        {formatDateOnly(group.date)}
                      </span>
                    </div>
                    <div className={s.dateLine}></div>
                    <div className={s.dateTotal}>
                      {formatCurrency(calculateTotalByDate(group.payments))}
                    </div>
                  </div>

                  {/* Transaction cards for this date */}
                  <div className={s.cards}>
                    {group.payments.map((payment) => (
                      <div key={payment.itemId} className={s.card}>
                        {/* Thumbnail */}
                        <div className={s.cardImage}>
                          <img src={payment.thumbnail} alt={payment.name} />
                          <span className={s.typeBadge}>
                            <i
                              className={`bi ${payment.itemType === "Course" ? "bi-book" : "bi-people"}`}
                            ></i>
                            {payment.itemType}
                          </span>
                        </div>

                        {/* Content */}
                        <div className={s.cardBody}>
                          <h3 className={s.cardTitle}>{payment.name}</h3>

                          <div className={s.cardMeta}>
                            <div className={s.metaItem}>
                              <i className="bi bi-clock"></i>
                              <span>{formatDateTime(payment.paidAt)}</span>
                            </div>
                          </div>

                          <div className={s.cardFooter}>
                            <div className={s.amount}>
                              <span className={s.amountLabel}>Amount Paid</span>
                              <span className={s.amountValue}>
                                {formatCurrency(payment.amount)}
                              </span>
                            </div>
                            <div
                              className={`${s.status} ${payment.status === "Paid" ? s.statusPaid : ""}`}
                            >
                              <i className="bi bi-check-circle-fill"></i>
                              <span>{payment.status}</span>
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
