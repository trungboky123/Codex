import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import s from "../css/Login.module.scss";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const from = location.state?.from?.pathname || "/"
  const [user, setUser] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    const usernameOrEmail = user.usernameOrEmail.trim();
    const password = user.password.trim();
    e.preventDefault();

    const lang = localStorage.getItem("lang") || "en";
    const res = await fetch(`http://localhost:8080/auth/login?lang=${lang}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setIsSignedIn(false);
      setMessage(data.message);
      return;
    } else {
      setIsSignedIn(true);
      setMessage(data.message);
      if (rememberMe) {
        localStorage.setItem("accessToken", data.accessToken);
      } else {
        sessionStorage.setItem("accessToken", data.accessToken);
      }

      const role = jwtDecode(data.accessToken).roles;
      setTimeout(() => {
        if (role.includes("ROLE_ADMIN")) {
          navigate("/admin/dashboard", {replace: true});
        }
        else if (role.includes("ROLE_INSTRUCTOR")) {
          navigate("/instructor/course-list", {replace: true});
        }
        else {
          navigate(from, {replace: true});
        }
      }, 2000);
    }
  }

  return (
    <div className={s["login"] + " min-h-screen flex"}>
      <div className={s["login__container"]}>
        <div className={s["login__image"]}></div>

        <div className={s["login__card-wrapper"]}>
          <div className={s["login__card"]}>
            <div className={s["login__logo"]}>
              <Link to="/home">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB-bPDeH5tq3NmV-weR7J6MjCfIeblCnf9tA&s"
                  alt="Logo"
                  className={s["login__logo-img"]}
                />
              </Link>
              <h1 className={s["login__title"]}>{t("login.text")}</h1>
              <p className={s["login__subtitle"]}>
                {t("login.subtitle")}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={s["login__form-group"]}>
                <label className={s["login__label"]}>{t("login.usernameOrEmail")}</label>
                <input
                  type="text"
                  name="usernameOrEmail"
                  className={s["login__input"]}
                  value={user.usernameOrEmail}
                  placeholder={t("login.usernameOrEmail.placeholder")}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={s["login__form-group"]}>
                <label className={s["login__label"]}>{t("login.password")}</label>
                <div className={s["login__password"]}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className={
                      s["login__input"] + " " + s["login__input--password"]
                    }
                    value={user.password}
                    placeholder={t("login.password.placeholder")}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      e.key === "Enter" && handleSubmit(e);
                    }}
                    required
                  />
                  <button
                    type="button"
                    className={s["login__toggle-password"]}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        {" "}
                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />{" "}
                        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />{" "}
                        <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />{" "}
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        {" "}
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />{" "}
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />{" "}
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {message && (
                <p
                  className={`${s["login__message"]} ${
                    isSignedIn
                      ? s["login__message--success"]
                      : s["login__message--error"]
                  }`}
                >
                  {message}
                </p>
              )}

              <div className={s["login__options"]}>
                <label className={s["login__remember"]}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  {t("login.rememberMe")}
                </label>

                <Link to="/forgot-password" className={s["login__forgot"]}>
                  {t("login.forgotPassword")}
                </Link>
              </div>

              <button className={s["login__button"]} type="submit">
                {t("login.text")}
              </button>

              <div className={s["login__register"]}>
                {t("login.noAccount")}
                <Link to="/register"> {t("register.text")}</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
