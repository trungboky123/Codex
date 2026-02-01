import { useEffect, useRef, useState } from "react";
import s from "../css/VerifyEmail.module.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const { t } = useTranslation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef([]);

  const isComplete = otp.every((digit) => digit !== "");

  useEffect(() => {
    if (!email) {
      navigate("/register");
      return;
    }
    inputRefs.current[0]?.focus();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const digits = pastedData.match(/[0-9]/g);

    if (digits) {
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (i < 6) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);

      if (digits.length === 6) {
        inputRefs.current[5]?.focus();
      }
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const otpCode = otp.join("");
    const res = await fetch("http://localhost:8080/auth/verify-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code: otpCode }),
    });

    if (!res.ok) {
      const data = await res.json();
      setMessage(data.message);
      setIsError(true);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      return;
    } else {
      await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(location.state),
      });

      setIsVerified(true);
    }
  }

  async function handleResend() {
    if (!canResend) return;

    const res = await fetch("http://localhost:8080/auth/send-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(location.state),
    });

    if (res.ok) {
      setMessage(t("verify.newCode"));
      setIsError(false);
      setOtp(["", "", "", "", "", ""]);
      setCountdown(60);
      setCanResend(false);
      inputRefs.current[0]?.focus();

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className={s["verify"] + " min-h-screen flex"}>
      <title>Verify Email</title>
      <div className={s["verify__container"]}>
        <div className={s["verify__image"]}></div>
        <div className={s["verify__card-wrapper"]}>
          <div className={s["verify__card"]}>
            {!isVerified ? (
              <>
                <div className={s["verify__logo-container"]}>
                  <Link to="/home">
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB-bPDeH5tq3NmV-weR7J6MjCfIeblCnf9tA&s"
                      alt="Logo"
                      className={s["verify__logo"]}
                      style={{ width: "150px", margin: "0" }}
                    />
                  </Link>
                  <h1 className={s["verify__title"]}>{t("verify.email")}</h1>
                  <p className={s["verify__subtitle"]}>
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                <div className={s["verify__email"]}>
                  Code sent to{" "}
                  <strong className={s["verify__email-text"]}>{email}</strong>
                </div>

                <div className="form-group">
                  <label className="form-label">Verification Code</label>
                  <div className={s["verify__otp-container"]}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className={s["verify__otp-input"]}
                        data-filled={digit !== ""}
                      />
                    ))}
                  </div>
                </div>

                {message && (
                  <p
                    className={
                      s["message"] +
                      " " +
                      (isError
                        ? s["verify__error-message"]
                        : s["verify__success-message"])
                    }
                  >
                    {message}
                  </p>
                )}

                <button
                  type="button"
                  className={s["verify__submit-button"]}
                  onClick={handleSubmit}
                  disabled={!isComplete}
                >
                  Verify
                </button>

                <div className={s["verify__resend-container"]}>
                  Didn't receive code?{" "}
                  <span
                    onClick={handleResend}
                    className={
                      canResend
                        ? s["verify__resend-link"]
                        : s["verify__resend-disabled"]
                    }
                  >
                    Resend
                  </span>
                  {!canResend && (
                    <span className={s["verify__countdown"]}>
                      {" "}
                      in{" "}
                      <span className={s["verify__countdown-number"]}>
                        {countdown}
                      </span>
                      s
                    </span>
                  )}
                </div>

                <div className={s["verify__back-link-container"]}>
                  <Link to="/login" className={s["verify__back-link"]}>
                    ← Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <div className={s["verify__success-card"]}>
                <div className={s["verify__success-icon"]}>
                  <i className="bi bi-check-lg"></i>
                </div>
                <h1 className={s["verify__success-title"]}>Email Verified!</h1>
                <p className={s["verify__success-message"]}>
                  Your email has been successfully verified. You can now login
                  to your account.
                </p>
                <button
                  className={s["verify__back-to-login-btn"]}
                  onClick={handleBackToLogin}
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
