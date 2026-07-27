import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { API_URL } from "../config";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      if (data.role !== "admin") {
        setError("Access denied (Admin only)");
        return;
      }

        localStorage.setItem("adminInfo", JSON.stringify(data));

      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <h1 className="login-title">Admin Login</h1>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={submitHandler} className="login-form">

          <input
            type="email"
            placeholder="Admin Email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-btn">Login</button>

        </form>
      </div>
    </div>
  );
};

export default AdminLogin;