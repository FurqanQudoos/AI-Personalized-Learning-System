import React, { useState,useEffect  } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from 'lucide-react';
import robotImage from "../assets/robot.png";
import "../App.css";
import { API_URL } from "../config";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          profileImage: data.profileImage,
          token: data.token,
        })
      );

      onLogin(data);
      navigate("/");
    } catch (err) {
      setError(err.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-left">
          <h1 className="login-title">Login</h1>

          {error && <p className="login-error">{error}</p>}

          {/* Google Sign In */}
          <button
            className="google-btn"
            onClick={() =>
              (window.location.href = `${API_URL}/api/users/google`)
            }
          >
            {/* Google SVG */}
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.9 0 7.4 1.3 10.2 3.9l7.6-7.6C37.4 2.1 31.1 0 24 0 14.7 0 6.6 5.4 2.6 13.3l8.8 6.8C13.5 13.5 18.3 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3.1-2.3 5.7-4.8 7.5l7.5 5.8c4.4-4.1 7.1-10.2 7.1-17.8z" />
              <path fill="#FBBC05" d="M11.4 28.1c-1.1-3.3-1.1-6.9 0-10.2l-8.8-6.8C.9 14.4 0 18.1 0 22s.9 7.6 2.6 10.9l8.8-4.8z" />
              <path fill="#34A853" d="M24 44c6.5 0 12-2.1 16-5.7l-7.5-5.8c-2.1 1.4-4.8 2.2-8.5 2.2-5.7 0-10.5-4-12.2-9.4l-8.8 4.8C6.6 38.6 14.7 44 24 44z" />
            </svg>

            <span>Sign in with Google</span>
          </button>

          {/* OR Divider */}
          <div className="or-divider">
            <span>OR</span>
          </div>

          <form onSubmit={submitHandler} className="login-form">
            <input
              type="email"
              placeholder="Email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="eye-btn">
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* 🔹 Forgot Password Link */}
          <p className="login-text">
            <Link to="/forgot-password" className="link-btn">
              Forgot password?
            </Link>
          </p>

          <p className="login-text">
            Don’t have an account?{" "}
            <Link to="/register" className="link-btn">
              Register here
            </Link>
          </p>
        </div>

        <div className="login-right">
          <img src={robotImage} alt="Robot" className="robot-img" />
        </div>
      </div>

      <p className="footer-text">© 2025 AI Learning Companion</p>
    </div>
  );
};

export default Login;
