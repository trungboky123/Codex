import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to={"/login"}/>
  }

  const role = jwtDecode(token).roles;

  if (!role.includes("ROLE_ADMIN")) {
    return <Navigate to={"/error"}/>  
  }

  return <Outlet/>;
}