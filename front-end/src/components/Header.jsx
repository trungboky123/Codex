import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import defaultAvatar from "../images/default-avatar.png";
import "../css/Header.css";
import authFetch from "../function/authFetch";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    username: "",
    avatarUrl: "",
  });

  const handleLogout = async () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    setUser(null);
  
    await fetch("http://localhost:8080/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    
    navigate("/home");
  };

  async function getMe() {
    const res = await authFetch(
      "http://localhost:8080/users/me",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const data = await res.json();
    setUser(data);
  }

  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (token) {
      getMe();
    }
  }, [navigate]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container">
        <Link to={"/home"} className="navbar-brand">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB-bPDeH5tq3NmV-weR7J6MjCfIeblCnf9tA&s" alt="" style={{height: "45px"}}/>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto ms-4">
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/public-courses') ? 'active' : ''}`}
                to="/public-courses"
              >
                Course
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/public-classes') ? 'active' : ''}`}
                to="/public-classes"
              >
                Class
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/blog') ? 'active' : ''}`}
                to="/blog"
              >
                Blog
              </Link>
            </li>
          </ul>

          {!user.username ? (
            <div className="auth-buttons">
              <Link
                to="/login"
                className="btn btn-outline-primary"
                style={{ marginRight: "10px" }}
              >
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </div>
          ) : (
            <ul className="navbar-nav">
              <li className="navbar-item dropdown">
                <Link
                  to={"/home"}
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  data-bs-toggle="dropdown"
                  id="userDropdown"
                >
                  <img
                    src={user.avatarUrl || defaultAvatar}
                    alt="Avatar"
                    className="rounded-circle me-2"
                    width={40}
                    height={40}
                  />
                  {user.fullName}
                </Link>

                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="userDropdown"
                >
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-courses">
                      My Courses
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-classes">
                      My Classes
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-enrollments">
                      My Enrollments
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <i className="fa fa-sign-out-alt me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;