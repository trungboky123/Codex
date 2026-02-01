import { Link, useNavigate } from "react-router-dom";
import s from "../css/Register.module.scss";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);

  const [user, setUser] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(e) {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const username = user.username ? user.username.trim() : "";
    const email = user.email ? user.email.trim() : "";
    const fullName = user.fullName ? user.fullName.trim() : "";
    const password = user.password ? user.password.trim() : "";
    const confirmPassword = user.confirmPassword.trim();

    if (password !== confirmPassword) {
      setMessage(t("register.password.notMatch"));
      setIsRegistered(false);
      return;
    }

    const lang = localStorage.getItem("lang") || "en";
    const res = await fetch(`http://localhost:8080/auth/send-code?lang=${lang}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fullName, username, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setMessage(data.message);
      setIsRegistered(false);
      return;
    }

    setIsRegistered(true);
    navigate("/verify-email", {
      state: {
        email: email,
        username: username,
        fullName: fullName,
        password: password,
      },
    });
  }
  return (
    <div className={s["register"] + " min-h-screen flex"}>
      <title>Register</title>
      <div className={s["register__container"]}>
        <div className={s["register__image"]}></div>
        <div className={s["register__card-wrapper"]}>
          <div className={s["register__card"]}>
            <div className={s["register__logo"]}>
              <Link to={"/home"}>
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB-bPDeH5tq3NmV-weR7J6MjCfIeblCnf9tA&s"
                  alt="Logo"
                  className="logo"
                  style={{ width: "150px", margin: "0" }}
                />
              </Link>
              <h1 className={s["register__title"]}>{t("register.text")}</h1>
              <p className={s["register__subtitle"]}>
                {t("register.subtitle")}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={s["register__form-group"]}>
                <label className={s["register__label"]}>{t("register.fullName")}</label>
                <input
                  type="text"
                  name="fullName"
                  className={s["register__input"]}
                  placeholder={t("register.fullName.placeholder")}
                  value={user.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={s["register__form-group"]}>
                <label className={s["register__label"]}>{t("register.username")}</label>
                <input
                  type="text"
                  name="username"
                  className={s["register__input"]}
                  placeholder={t("register.username.placeholder")}
                  value={user.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={s["register__form-group"]}>
                <label className={s["register__label"]}>{t("register.email")}</label>
                <input
                  type="text"
                  name="email"
                  className={s["register__input"]}
                  placeholder={t("register.email.placeholder")}
                  value={user.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={s["register__form-group"]}>
                <label className={s["register__label"]}>{t("register.password")}</label>
                <div className={s["register__password-wrapper"]}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className={
                      s["register__input"] +
                      " " +
                      s["register__input--password"]
                    }
                    placeholder={t("register.password.placeholder")}
                    value={user.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className={s["register__toggle-password"]}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
                        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
                        <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className={s["register__form-group"]}>
                <label className={s["register__label"]}>{t("register.confirmPassword")}</label>
                <div className={s["register__password-wrapper"]}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    className={
                      s["register__input"] +
                      " " +
                      s["register__input--password"]
                    }
                    placeholder={t("register.confirm.placeholder")}
                    value={user.confirmPassword}
                    onChange={handleChange}
                    required
                    onKeyDown={(e) => {
                      e.key === "Enter" && handleSubmit(e);
                    }}
                  />
                  <button
                    type="button"
                    className={s["register__toggle-password"]}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
                        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
                        <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {!isRegistered && message && (
                <p
                  className={
                    s["register__message"] + " " + s["register__message--error"]
                  }
                >
                  {message}
                </p>
              )}
              {isRegistered && message && (
                <p
                  className={
                    s["register__message"] +
                    " " +
                    s["register__message--success"]
                  }
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                className={s["register__button"]}
              >
                {t("register.text")}
              </button>

              <div className={s["register__link"]}>
                {t("register.hadAccount")}
                <Link
                  to="/login"
                  className="text-decoration-none"
                  style={{ marginLeft: "5px" }}
                >
                  {t("login.text")}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
