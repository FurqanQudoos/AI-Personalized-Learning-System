import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import defaultUser from "../assets/user.png";
import "../App.css";
import { API_URL } from "../config";

const Register = () => {
  const navigate = useNavigate();

  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const strongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(defaultUser);
  const [errors, setErrors] = useState({});
  const [emailStatus, setEmailStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* PASSWORD STRENGTH TEXT */
  const getPasswordStrength = (password) => {
    if (!password) return "";

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 2) return "Weak";
    if (score === 3 || score === 4) return "Medium";
    return "Strong";
  };

  /* STRENGTH BAR WIDTH */
  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    return (score / 5) * 100;
  };

  /* IMAGE */
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* VALIDATION */
  const validateForm = () => {
    let newErrors = {};

    if (!nameRegex.test(name))
      newErrors.name = "Name must contain only letters";

    if (!emailRegex.test(email))
      newErrors.email = "Enter valid email";

    if (!strongPassword.test(password))
      newErrors.password =
        "Password must include A-Z, a-z, number & symbol";

    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* SUBMIT */
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    if (image) formData.append("profileImage", image);

    try {
      const res = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // localStorage.setItem("userInfo", JSON.stringify(data));
      // navigate("/");
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      setErrors({ server: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
      {errors.server && <p className="error">{errors.server}</p>}
        {/* IMAGE */}
        <label className="image-upload">
          <div className="image-wrapper">
            <img src={preview} className="profile-preview" alt="profile" />
            <div className="camera-overlay">📷</div>
          </div>
          <input type="file" hidden onChange={handleImage} />
        </label>

        <h1 className="register-title">Create Your Account</h1>

        <form onSubmit={submitHandler} className="register-form">

          {/* NAME */}
          <input
            type="text"
            placeholder="Full Name (John Doe)"
            className="register-input"
            value={name}
            onChange={(e) =>
              /^[A-Za-z\s]*$/.test(e.target.value) &&
              setName(e.target.value)
            }
            required
          />
          {errors.name && <p className="form-error">{errors.name}</p>}

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email (johndoe@gmail.com)"
            className="register-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* PASSWORD */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (Johndoe123#$)"
              className="register-input password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="eye-btn"
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          {/* STRENGTH BAR */}
          <div className="strength-bar">
            <div
              style={{
                width: `${getStrength()}%`,
                background:
                  getPasswordStrength(password) === "Strong"
                    ? "#22c55e"
                    : getPasswordStrength(password) === "Medium"
                      ? "#f59e0b"
                      : "#ef4444",
              }}
            />
          </div>

          {/* STRENGTH TEXT */}
          {password && (
            <p
              className={`password-strength-text ${
                getPasswordStrength(password) === "Weak"
                  ? "weak"
                  : getPasswordStrength(password) === "Medium"
                    ? "medium"
                    : "strong"
              }`}
            >
              {getPasswordStrength(password)}
            </p>
          )}

          {/* CONFIRM */}
          <input
            type="password"
            placeholder="Confirm Password"
            className="register-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {/* MATCH STATUS */}
          {confirmPassword && (
            password === confirmPassword ? (
              <p className="match">Password Matched ✓</p>
            ) : (
              <p className="form-error">Passwords do not match</p>
            )
          )}
          {/* ROLE */} <div className="role-wrapper"> <label className="role-label">Role</label> <select className="register-input" disabled> <option>Student</option> </select> </div>
          <button className="register-btn" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="register-text">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>

      <p className="footer-text">© 2025 AI Learning Companion</p>
    </div>
  );
};

export default Register;
