import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import s from "../css/ResetPassword.module.scss";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const inputRefs = useRef([]);

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    const res = await fetch(
      `http://localhost:8080/auth/verify-email?email=${email}`,
      {
        method: "POST",
      },
    );

    const data = await res.json();

    if (!res.ok) {
      setIsError(true);
      setMessage(data.message);
      return;
    }

    setMessage(data.message);
    setTimeout(() => {
      setCurrentStep(2);
      setMessage("");
    }, 1500);
  };

  // Step 2: Verify Code
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

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    console.log(email);
    const otpCode = otp.join("");
    console.log(otpCode);
    const res = await fetch("http://localhost:8080/auth/verify-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        code: otpCode,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setIsError(true);
      setMessage(data.message);
      return;
    }

    setMessage("Code verified successfully!");
    setTimeout(() => {
      setCurrentStep(3);
      setMessage("");
    }, 1500);
  };

  const handleResend = async () => {
    setMessage("");
    setIsError(false);

    await fetch(`http://localhost:8080/auth/verify-email?email=${email}`, {
      method: "POST",
    });

    setMessage("New code has been sent to your email!");
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    const otpCode = otp.join("");

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match!");
      return;
    }

    const res = await fetch("http://localhost:8080/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        code: otpCode,
        newPassword: newPassword.trim(),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setIsError(true);
      setMessage(data.message);
      return;
    }

    setCurrentStep(4);
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className={s.forgotPassword}>
      <div className={s.forgotPassword__container}>
        <div className={s.forgotPassword__image}></div>

        <div className={s.forgotPassword__cardWrapper}>
          <div className={s.forgotPassword__card}>
            {/* Step Indicator */}
            <div className={s.forgotPassword__steps}>
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`${s.forgotPassword__step} ${
                    currentStep >= step ? s["forgotPassword__step--active"] : ""
                  } ${currentStep === step ? s["forgotPassword__step--current"] : ""}`}
                >
                  {currentStep > step ? (
                    <i className="bi bi-check-lg"></i>
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
              ))}
            </div>

            <div className={s.forgotPassword__logo}>
              <Link to="/home">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB-bPDeH5tq3NmV-weR7J6MjCfIeblCnf9tA&s"
                  alt="Logo"
                  className={s.forgotPassword__logoImg}
                />
              </Link>

              {/* Step 1: Enter Email */}
              {currentStep === 1 && (
                <>
                  <h1 className={s.forgotPassword__title}>Forgot Password?</h1>
                  <p className={s.forgotPassword__subtitle}>
                    Enter your email to receive a verification code
                  </p>
                </>
              )}

              {/* Step 2: Verify Code */}
              {currentStep === 2 && (
                <>
                  <h1 className={s.forgotPassword__title}>Verify Code</h1>
                  <p className={s.forgotPassword__subtitle}>
                    Enter the 6-digit code sent to {email}
                  </p>
                </>
              )}

              {/* Step 3: New Password */}
              {currentStep === 3 && (
                <>
                  <h1 className={s.forgotPassword__title}>Reset Password</h1>
                  <p className={s.forgotPassword__subtitle}>
                    Create a new secure password
                  </p>
                </>
              )}

              {/* Step 4: Success */}
              {currentStep === 4 && (
                <>
                  <div className={s.forgotPassword__successIcon}>
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                  <h1 className={s.forgotPassword__title}>Success!</h1>
                  <p className={s.forgotPassword__subtitle}>
                    Your password has been reset successfully
                  </p>
                </>
              )}
            </div>

            {/* Step 1 Form */}
            {currentStep === 1 && (
              <form onSubmit={handleSubmitEmail}>
                <div className={s.forgotPassword__formGroup}>
                  <label className={s.forgotPassword__label}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className={s.forgotPassword__input}
                    value={email}
                    placeholder="Enter your email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {message && (
                  <p
                    className={`${s.forgotPassword__message} ${
                      isError
                        ? s["forgotPassword__message--error"]
                        : s["forgotPassword__message--success"]
                    }`}
                  >
                    {message}
                  </p>
                )}

                <button className={s.forgotPassword__button} type="submit">
                  Send Verification Code
                </button>

                <div className={s.forgotPassword__backToLogin}>
                  Remember your password?
                  <Link to="/login"> Login</Link>
                </div>
              </form>
            )}

            {/* Step 2 Form */}
            {currentStep === 2 && (
              <form onSubmit={handleVerifyCode}>
                <div className="form-group">
                  <label className="form-label">Verification Code</label>
                  <div className={s["forgotPassword__otp-container"]}>
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
                        className={s["forgotPassword__otp-input"]}
                        data-filled={digit !== ""}
                      />
                    ))}
                  </div>
                </div>

                {message && (
                  <p
                    className={`${s.forgotPassword__message} ${
                      isError
                        ? s["forgotPassword__message--error"]
                        : s["forgotPassword__message--success"]
                    }`}
                  >
                    {message}
                  </p>
                )}

                <button className={s.forgotPassword__button} type="submit">
                  Verify Code
                </button>

                <div className={s.forgotPassword__backToLogin}>
                  Didn't receive the code?
                  <button
                    type="button"
                    onClick={handleResend}
                    className={s.forgotPassword__link}
                  >
                    Resend
                  </button>
                </div>
              </form>
            )}

            {/* Step 3 Form */}
            {currentStep === 3 && (
              <form onSubmit={handleResetPassword}>
                <div className={s.forgotPassword__formGroup}>
                  <label className={s.forgotPassword__label}>
                    New Password
                  </label>
                  <div className={s.forgotPassword__password}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`${s.forgotPassword__input} ${s["forgotPassword__input--password"]}`}
                      value={newPassword}
                      placeholder="Enter new password"
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={s.forgotPassword__togglePassword}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <i className="bi bi-eye-slash-fill"></i>
                      ) : (
                        <i className="bi bi-eye-fill"></i>
                      )}
                    </button>
                  </div>
                </div>

                <div className={s.forgotPassword__formGroup}>
                  <label className={s.forgotPassword__label}>
                    Confirm Password
                  </label>
                  <div className={s.forgotPassword__password}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`${s.forgotPassword__input} ${s["forgotPassword__input--password"]}`}
                      value={confirmPassword}
                      placeholder="Confirm new password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={s.forgotPassword__togglePassword}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <i className="bi bi-eye-slash-fill"></i>
                      ) : (
                        <i className="bi bi-eye-fill"></i>
                      )}
                    </button>
                  </div>
                </div>

                {message && (
                  <p
                    className={`${s.forgotPassword__message} ${
                      isError
                        ? s["forgotPassword__message--error"]
                        : s["forgotPassword__message--success"]
                    }`}
                  >
                    {message}
                  </p>
                )}

                <button className={s.forgotPassword__button} type="submit">
                  Reset Password
                </button>
              </form>
            )}

            {/* Step 4 Success */}
            {currentStep === 4 && (
              <div className={s.forgotPassword__successContent}>
                <button
                  className={s.forgotPassword__button}
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
