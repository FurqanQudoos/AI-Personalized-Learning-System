import React, { useState } from "react";
import "../App.css";
import brain from "../assets/brain.png";
import map from "../assets/map.png";

const ContactScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const submitHandler = async () => {
    if (!name || !email || !subject || !message) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccess("Message sent successfully!");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Mission Box */}
      <div className="mission-box">
        <div>
          <h2>Our Mission</h2>
          <p>
            AI Learning Companion is an AI-powered platform that helps students
            progress, identify weak areas, and improve learning.
          </p>
        </div>
        <img src={brain} alt="brain" />
      </div>

      {/* Contact Section */}
      <div className="contact-section">
        {/* Contact Form */}
        <div className="contact-card">
          {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
          {success && (
            <p style={{ color: "green", fontSize: "14px" }}>{success}</p>
          )}

          <input
            type="text"
            placeholder="Name"
            className="contact-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="contact-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="Subject"
            className="contact-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <textarea
            placeholder="Message"
            className="contact-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <button className="send-btn" onClick={submitHandler} disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </div>

        {/* Contact Details */}
        <div className="contact-card">
          <h3>Our Details</h3>

          <div className="contact-info">📧 info@ailearning.com</div>
          <div className="contact-info">📞 +1 (556) 123-667</div>
          <div className="contact-info">📍 Find Us</div>

          <img src={map} alt="map" className="map-img" />
        </div>
      </div>
    </div>
  );
};

export default ContactScreen;
