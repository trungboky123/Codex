import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import authFetch from "../function/authFetch";

export default function InstructorRoute() {
  const [authorized, setAuthorized] = useState(null);
  const location = useLocation();

  useEffect(() => {
    async function fetchData() {
      const res = await authFetch("http://localhost:8080/users/me");

      if (!res.ok) {
        setAuthorized(false);
        return;
      }

      const data = await res.json();

      if (data.role?.name === "ROLE_INSTRUCTOR" || "ROLE_ADMIN") {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    }

    fetchData();
  }, []);

  if (authorized === null) {
    return <div>Loading...</div>;
  }

  if (!authorized) {
    return <Navigate to="/error" replace />;
  }

  return <Outlet />;
}