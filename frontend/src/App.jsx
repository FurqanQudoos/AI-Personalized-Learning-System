import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";

import Header from "./components/Header";
import Footer from "./components/Footer";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import AboutScreen from "./screens/AboutScreen";
import ContactScreen from "./screens/ContactScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import UploadScreen from "./screens/UploadScreen";
import InsightsScreen from "./screens/InsightsScreen";
import GoogleSuccess from "./screens/GoogleSuccess";
import OtpScreen from "./screens/OtpScreen"; // ✅ IMPORTANT

import AdminLogin from "./components/AdminLogin";
import AdminLayout from "./Admin/AdminLayout";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminUsers from "./Admin/AdminUsers";
import AdminContacts from "./Admin/AdminContacts";
import AdminRoute from "./components/AdminRoute";

function App() {
  // const [userInfo, setUserInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(() => {

    const saved = localStorage.getItem("userInfo");

    return saved ? JSON.parse(saved) : null;

  });
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");
  useEffect(() => {

    if (userInfo) {

      localStorage.setItem(
        "userInfo",
        JSON.stringify(userInfo)
      );

    }

  }, [userInfo]);
  // const handleLogout = () => {
  //   localStorage.removeItem("userInfo");
  //   setUserInfo(null);
  // };
  const handleLogout = () => {

    localStorage.removeItem("userInfo");

    sessionStorage.removeItem("analysis");
    sessionStorage.removeItem("learningMode");
    sessionStorage.removeItem("quizMode");
    sessionStorage.removeItem("teachChat");
    sessionStorage.removeItem("quizQuestions");
    sessionStorage.removeItem("quizAnswers");
    sessionStorage.removeItem("quizId");
    sessionStorage.removeItem("quizResult");
    sessionStorage.removeItem("quizAttempted");
    sessionStorage.removeItem("uploadedImage");
    sessionStorage.removeItem("quiz");

    localStorage.removeItem("lastActivity");

    setUserInfo(null);

  };
  useEffect(() => {

    const updateActivity = () => {

      localStorage.setItem(
        "lastActivity",
        Date.now()
      );

    };

    updateActivity();

    window.addEventListener("mousemove", updateActivity);

    window.addEventListener("keydown", updateActivity);

    window.addEventListener("click", updateActivity);

    window.addEventListener("scroll", updateActivity);

    const timer = setInterval(() => {

      const last = Number(
        localStorage.getItem("lastActivity")
      );

      if (
        userInfo &&
        Date.now() - last > 15 * 60 * 1000
      ) {

        handleLogout();

      }

    }, 60000);

    return () => {

      clearInterval(timer);

      window.removeEventListener("mousemove", updateActivity);

      window.removeEventListener("keydown", updateActivity);

      window.removeEventListener("click", updateActivity);

      window.removeEventListener("scroll", updateActivity);

    };

  }, [userInfo]);

  return (
    <div className="app-wrapper">

      {/* HEADER */}
      {!isAdminRoute && userInfo && (
        <Header userInfo={userInfo} onLogout={handleLogout} />
      )}

      {/* USER ROUTES */}
      {!isAdminRoute && (
        <main className="app-main">
          <Routes>

            {/* AUTH */}
            <Route
              path="/login"
              element={
                userInfo ? (
                  <Navigate to="/" />
                ) : (
                  <LoginScreen onLogin={setUserInfo} />
                )
              }
            />

            <Route
              path="/register"
              element={userInfo ? <Navigate to="/" /> : <RegisterScreen />}
            />

            {/* 🔥 OTP ROUTE ADD */}
            <Route path="/verify-otp" element={<OtpScreen />} />

            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/reset/:token" element={<ResetPasswordScreen />} />

            {/* MAIN */}
            <Route
              path="/"
              element={userInfo ? <HomeScreen /> : <Navigate to="/login" />}
            />

            <Route
              path="/about"
              element={userInfo ? <AboutScreen /> : <Navigate to="/login" />}
            />

            <Route
              path="/contact"
              element={userInfo ? <ContactScreen /> : <Navigate to="/login" />}
            />

            <Route
              path="/upload"
              element={userInfo ? <UploadScreen /> : <Navigate to="/login" />}
            />

            <Route
              path="/insights"
              element={userInfo ? <InsightsScreen /> : <Navigate to="/login" />}
            />

            <Route
              path="/google-success"
              element={<GoogleSuccess onLogin={setUserInfo} />}
            />

          </Routes>
        </main>
      )}

      {/* ADMIN ROUTES */}
      {isAdminRoute && (
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="contacts" element={<AdminContacts />} />
          </Route>
        </Routes>
      )}

      {/* FOOTER */}
      {!isAdminRoute && userInfo && <Footer />}

    </div>
  );
}

export default App;