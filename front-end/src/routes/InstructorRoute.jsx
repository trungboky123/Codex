import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function InstructorRoute() {
  const location = useLocation();
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to={"/login"} state={{ from: location }} replace />;
  }

  const role = jwtDecode(token).roles;

  if (!role.includes("ROLE_INSTRUCTOR")) {
    return <Navigate to={"/error"} />;
  }

  return <Outlet />;
}
