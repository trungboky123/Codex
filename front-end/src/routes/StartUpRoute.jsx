import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

export default function StartUpRoot() {
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to={"/home"} replace />;
  }

  const role = jwtDecode(token).roles;
  if (role.includes("ROLE_ADMIN")) {
    return <Navigate to={"/admin/dashboard"} replace/>;
  }
  else if (role.includes("ROLE_INSTRUCTOR")) {
    return <Navigate to={"/instructor/course-list"} replace/>;
  }
  else {
    return <Navigate to={"/home"} replace/>;
  }
}