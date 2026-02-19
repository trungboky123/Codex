import React from "react";
import ReactDOM from "react-dom/client";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./i18n";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserProfilePage from "./pages/UserProfilePage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import PublicCoursesPage from "./pages/PublicCoursesPage";
import PublicClassesPage from "./pages/PublicClassesPage";
import PublicCourseDetailsPage from "./pages/PublicCourseDetailsPage";
import PublicClassDetailsPage from "./pages/PublicClassDetailsPage";
import WishlistPage from "./pages/WishlistPage";
import AdminRoute from "./routes/AdminRoute";
import DashboardPage from "./admin pages/DashboardPage";
import AccountListPage from "./admin pages/AccountListPage";
import ErrorPage from "./error page/ErrorPage";
import StartUpRoot from "./routes/StartUpRoute";
import CourseListPage from "./admin pages/CourseListPage";
import ClassListPage from "./admin pages/ClassListPage";
import QrPage from "./pages/QrPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EditAccountPage from "./admin pages/EditAccountPage";
import EditCoursePage from "./admin pages/EditCoursePage";
import AddAccountPage from "./admin pages/AddAccountPage";
import AddCoursePage from "./admin pages/AddCoursePage";
import EditClassPage from "./admin pages/EditClassPage";
import AddClassPage from "./admin pages/AddClassPage";
import SettingListPage from "./admin pages/SettingListPage";
import AddSettingPage from "./admin pages/AddSettingPage";
import EditSettingPage from "./admin pages/EditSettingPage";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import MyEnrollmentsPage from "./pages/MyEnrollmentsPage";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <StartUpRoot />,
  },
  {
    path: "/error",
    element: <ErrorPage />,
  },
  {
    path: "/admin",
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "account-list",
            element: <AccountListPage />,
          },
          {
            path: "add-account",
            element: <AddAccountPage />,
          },
          {
            path: "edit-account/:id",
            element: <EditAccountPage />,
          },
          {
            path: "course-list",
            element: <CourseListPage />,
          },
          {
            path: "add-course",
            element: <AddCoursePage />,
          },
          {
            path: "edit-course/:id",
            element: <EditCoursePage />,
          },
          {
            path: "class-list",
            element: <ClassListPage />,
          },
          {
            path: "add-class",
            element: <AddClassPage />,
          },
          {
            path: "edit-class/:id",
            element: <EditClassPage />,
          },
          {
            path: "settings",
            element: <SettingListPage />,
          },
          {
            path: "add-setting",
            element: <AddSettingPage />,
          },
          {
            path: "edit-setting/:id",
            element: <EditSettingPage />,
          }
        ],
      },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: "/home",
        element: <HomePage />,
      },
      {
        path: "/profile",
        element: <UserProfilePage />,
      },
      {
        path: "/public-courses",
        element: <PublicCoursesPage />,
      },
      {
        path: "/public-course-details/:slug/:id",
        element: <PublicCourseDetailsPage />,
      },
      {
        path: "/public-classes",
        element: <PublicClassesPage />,
      },
      {
        path: "/public-class-details/:slug/:id",
        element: <PublicClassDetailsPage />,
      },
      {
        path: "/payment",
        element: <QrPage />,
      },
      {
        path: "/wishlist",
        element: <WishlistPage />,
      },
      {
        path: "/my-enrollments",
        element: <MyEnrollmentsPage/>
      },
      {
        path: "/transaction-history",
        element: <TransactionHistoryPage/>,
      }
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/verify",
    element: <VerifyEmailPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
