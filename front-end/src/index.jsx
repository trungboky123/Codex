import React from 'react';
import ReactDOM from 'react-dom/client';
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import Draft from './draft';
import VerifyEmailPage from './pages/VerifyEmailPage';
import PublicCoursesPage from './pages/PublicCoursesPage';
import PublicClassesPage from './pages/PublicClassesPage';
import PublicCourseDetailsPage from './pages/PublicCourseDetailsPage';

const router = createBrowserRouter([
  {
    path: "/", 
    element: <Navigate to="/home" replace />
  },
  {
    path: "/home",
    element: <HomePage />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/register",
    element: <RegisterPage />
  },
  {
    path: "/verify",
    element: <VerifyEmailPage />
  },
  {
    path: "/profile",
    element: <UserProfilePage/>
  },
  {
    path: "/public-courses",
    element: <PublicCoursesPage/>
  },
  {
    path: "/public-course-details/:slug/:id",
    element: <PublicCourseDetailsPage/>
  },
  {
    path: "/public-classes",
    element: <PublicClassesPage/>
  },
  {
    path: "/draft",
    element: <Draft/>
  }
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
