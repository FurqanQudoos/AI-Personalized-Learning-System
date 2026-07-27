import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";
import { API_URL } from "../config";

const OtpScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [redirectMsg, setRedirectMsg] = useState("");

  /* TIMER */
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* INPUT CHANGE */
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  /* BACKSPACE */
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  /* VERIFY OTP */
  const verifyOtp = async () => {
    try {
      const finalOtp = otp.join("");

      if (finalOtp.length !== 6) {
        setError("Enter complete OTP");
        return;
      }

      const res = await fetch(`${API_URL}/api/users/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: finalOtp,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setSuccess("OTP Verified Successfully!");
      setRedirectMsg("Redirecting to login page...");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  /* RESEND OTP */
  const resendOtp = async () => {
    try {
      setTimer(60);

      await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">

        <h2>Verify OTP</h2>
        <p>Enter the code sent to your email</p>

        {error && <p className="otp-error">{error}</p>}
        {success && <p className="otp-success">{success}</p>}

{redirectMsg && <p className="otp-redirect">{redirectMsg}</p>}

        {/* OTP INPUTS */}
        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>

        {/* VERIFY BUTTON */}
        <button className="otp-btn" onClick={verifyOtp}>
          Verify
        </button>

        {/* TIMER */}
        <p className="otp-timer">
          {timer > 0 ? `Resend in ${timer}s` : "You can resend OTP"}
        </p>

        {/* RESEND */}
        {timer === 0 && (
          <button className="resend-btn" onClick={resendOtp}>
            Resend OTP
          </button>
        )}

      </div>
    </div>
  );
};

export default OtpScreen;