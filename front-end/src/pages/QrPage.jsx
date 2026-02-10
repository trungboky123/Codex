import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import s from "../css/QrPage.module.scss";
import Header from "../components/Header";
import authFetch from "../function/authFetch";
import { QRCodeCanvas } from "qrcode.react";

export default function QrPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const id = location.state?.id;
  const name = location.state?.name;
  const type = location.state?.type;
  const qrCode = location.state?.qrCode;
  const bankName = "Ngan Hang TMCP Quan Doi";
  const accountNumber = location.state?.accountNumber;
  const accountName = location.state?.accountName;
  const amount = location.state?.amount;
  const description = location.state?.description;

  useEffect(() => {
    if (!location.state) {
      navigate("/error");
      return;
    }
  }, []);

  const [copied, setCopied] = useState({
    accountNumber: false,
    amount: false,
    content: false,
  });

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [field]: true });
      setTimeout(() => {
        setCopied({ ...copied, [field]: false });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleBackToHome = () => {
    navigate(-1);
  };

  useEffect(() => {
    const orderCode = description.replace(/\D/g, "");
    const timer = setInterval(async () => {
      const res = await authFetch(
        `http://localhost:8080/payments/status/${orderCode}`,
        {
          method: "GET",
        },
      );
      const data = await res.json();

      if (data.status === "PAID") {
        setPaymentSuccess(true);
        clearInterval(timer);
        const res = await authFetch(
          `http://localhost:8080/wishlist/find?itemId=${id}&type=${type}`,
          {
            method: "GET",
          },
        );
        if (res.ok) {
          await authFetch(
            `http://localhost:8080/wishlist/remove?itemId=${id}&type=${type}`,
            {
              method: "DELETE",
            },
          );
        }
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [description]);

  return (
    <>
      <title>Payment</title>
      <Header />
      <div className={s.paymentQR}>
        <div className={s.container}>
          {!paymentSuccess ? (
            <>
              <div className={s.header}>
                <button className={s.backBtn} onClick={handleBackToHome}>
                  <i className="bi bi-arrow-left"></i>
                </button>
                {type === "Course" ? (
                  <h1 className={s.title}>
                    Payment: Course <i>{name}</i>
                  </h1>
                ) : (
                  <h1 className={s.title}>
                    Payment: Class <i>{name}</i>
                  </h1>
                )}
              </div>

              <div className={s.content}>
                {/* QR Code Card */}
                <div className={s.qrCard}>
                  <div className={s.qrHeader}>
                    <h2 className={s.qrTitle}>Scan QR Code to Pay</h2>
                    <p className={s.qrSubtitle}>
                      Use your banking app to scan this QR code
                    </p>
                  </div>

                  <div className={s.qrImageWrapper}>
                    <div className={s.qrImageContainer}>
                      <QRCodeCanvas
                        value={qrCode}
                        size={250}
                        level="M"
                        className={s.qrImage}
                      />
                      <div className={s.qrOverlay}>
                        <div
                          className={s.corner}
                          data-position="top-left"
                        ></div>
                        <div
                          className={s.corner}
                          data-position="top-right"
                        ></div>
                        <div
                          className={s.corner}
                          data-position="bottom-left"
                        ></div>
                        <div
                          className={s.corner}
                          data-position="bottom-right"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details Card */}
                <div className={s.detailsCard}>
                  <div className={s.detailsHeader}>
                    <h3 className={s.detailsTitle}>Payment Information</h3>
                    <span className={s.statusBadge}>
                      <i className="bi bi-circle-fill"></i>
                      Pending
                    </span>
                  </div>

                  <div className={s.detailsList}>
                    {/* Bank Info */}
                    <div className={s.detailSection}>
                      <div className={s.sectionHeader}>
                        <i className="bi bi-bank"></i>
                        <h4>Bank Information</h4>
                      </div>

                      <div className={s.detailItem}>
                        <span className={s.label}>Bank Name</span>
                        <span className={s.value}>{bankName}</span>
                      </div>

                      <div className={s.detailItem}>
                        <span className={s.label}>Account Name</span>
                        <span className={s.value}>{accountName}</span>
                      </div>

                      <div className={s.detailItem}>
                        <span className={s.label}>Account Number</span>
                        <div className={s.valueWithCopy}>
                          <span className={s.value}>{accountNumber}</span>
                          <button
                            className={s.copyBtn}
                            onClick={() =>
                              copyToClipboard(accountNumber, "accountNumber")
                            }
                          >
                            {copied.accountNumber ? (
                              <>
                                <i className="bi bi-check2"></i>
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <i className="bi bi-copy"></i>
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className={s.detailSection}>
                      <div className={s.sectionHeader}>
                        <i className="bi bi-cash-coin"></i>
                        <h4>Transfer Details</h4>
                      </div>

                      <div className={s.detailItem}>
                        <span className={s.label}>Amount</span>
                        <div className={s.valueWithCopy}>
                          <span className={`${s.value} ${s.amount}`}>
                            {formatCurrency(amount)}
                          </span>
                          <button
                            className={s.copyBtn}
                            onClick={() =>
                              copyToClipboard(amount.toString(), "amount")
                            }
                          >
                            {copied.amount ? (
                              <>
                                <i className="bi bi-check2"></i>
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <i className="bi bi-copy"></i>
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className={s.detailItem}>
                        <span className={s.label}>Transfer Content</span>
                        <div className={s.valueWithCopy}>
                          <span className={s.value}>{description}</span>
                          <button
                            className={s.copyBtn}
                            onClick={() =>
                              copyToClipboard(description, "description")
                            }
                          >
                            {copied.content ? (
                              <>
                                <i className="bi bi-check2"></i>
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <i className="bi bi-copy"></i>
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div className={s.notesSection}>
                    <div className={s.noteItem}>
                      <i className="bi bi-exclamation-circle"></i>
                      <p>
                        Please ensure the transfer content exactly matches:{" "}
                        <strong>{description}</strong>
                      </p>
                    </div>
                    <div className={s.noteItem}>
                      <i className="bi bi-shield-check"></i>
                      <p>
                        Your payment will be verified automatically within
                        seconds
                      </p>
                    </div>
                    <div className={s.noteItem}>
                      <i className="bi bi-telephone"></i>
                      <p>
                        Contact support if you encounter any issues:{" "}
                        <strong>0833210030</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Success Modal
            <div className={s.successModal}>
              <div className={s.successContent}>
                <div className={s.successIcon}>
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <h2 className={s.successTitle}>Payment Successful!</h2>
                <p className={s.successMessage}>
                  Your payment has been processed successfully.
                  {type === "Course" ? (
                    <>
                      {" "}
                      You can now access the course: <strong>{name}</strong>
                    </>
                  ) : (
                    <>
                      {" "}
                      You are now enrolled in the class: <strong>{name}</strong>
                    </>
                  )}
                </p>
                {type === "Course" ? (
                  <>
                    <button
                      className={s.homeBtn}
                      onClick={() => navigate("/my-courses")}
                    >
                      <i className="bi bi-house-door-fill"></i>
                      Go to My Courses
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={s.homeBtn}
                      onClick={() => navigate("my-classes")}
                    >
                      <i className="bi bi-house-door-fill"></i>
                      Go to My Classes
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
