import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { API_URL } from "../config";

const HomeScreen = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);

  const [insightsLoading, setInsightsLoading] = useState(true);
  const [performance, setPerformance] = useState(null);
  const [progressHistory, setProgressHistory] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    if (storedUser) {
      setUser(storedUser);
      setEditName(storedUser.name);
    }
  }, []);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("userInfo"));
        if (!storedUser?.token) return;

        const res = await fetch(`${API_URL}/api/insights`, {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load insights");

        setPerformance(data.performance || null);
        setProgressHistory(data.progressHistory || []);
      } catch (err) {
        console.error(err);
        setPerformance(null);
        setProgressHistory([]);
      } finally {
        setInsightsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const chartPoints = useMemo(() => {
    if (!progressHistory.length) return [];

    const maxX = Math.max(progressHistory.length - 1, 1);

    return progressHistory.map((item, index) => ({
      x: (index / maxX) * 100,
      y: 100 - Math.min(100, Math.max(0, item.percentage)),
      percentage: item.percentage,
      label: item.label || `Quiz ${index + 1}`,
    }));
  }, [progressHistory]);

  const polylinePoints = chartPoints
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const activeLevel = (performance?.level || "").toLowerCase();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", editName);

      if (oldPassword) formData.append("oldPassword", oldPassword);
      if (newPassword) formData.append("newPassword", newPassword);
      if (image) formData.append("profileImage", image);

      const res = await fetch(`${API_URL}/api/users/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);

      setShowEdit(false);
      setOldPassword("");
      setNewPassword("");
      setImage(null);
      setPreview(null);

      alert("Profile updated successfully");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="user-main-content">
        <div className="profile-card">
          <img
            src={
              user?.profileImage?.startsWith("http")
                ? user.profileImage
                : `${API_URL}${user?.profileImage || "/uploads/profile/default.png"}`
            }
            alt="profile"
            className="profile-img"
          />

          <h3>{user?.name || "User"}</h3>
          <p>Student</p>

          <button className="edit-btn" onClick={() => setShowEdit(true)}>
            Edit
          </button>
        </div>

        <div className="progress-card">
          <h3>Welcome Back, {user?.name || "User"}!</h3>

          <div className="strength-buttons">
            <button
              type="button"
              className={`strong ${activeLevel.includes("excellent") || activeLevel.includes("good") || activeLevel.includes("strong") ? "is-active" : ""}`}
            >
              Strong
            </button>
            <button
              type="button"
              className={`average ${activeLevel.includes("average") ? "is-active" : ""}`}
            >
              Average
            </button>
            <button
              type="button"
              className={`weak ${activeLevel.includes("needs") || activeLevel.includes("weak") || activeLevel.includes("no data") ? "is-active" : ""}`}
            >
              Weak
            </button>
          </div>

          <div className="learning-progress">
            <div className="learning-progress-header">
              <h4>Learning Progress</h4>
              {performance && (
                <span className="progress-meta">
                  {performance.totalQuizzes || 0} quizzes · Avg{" "}
                  {performance.percentage || 0}%
                </span>
              )}
            </div>

            {insightsLoading ? (
              <p className="progress-empty">Loading progress...</p>
            ) : chartPoints.length === 0 ? (
              <div className="progress-empty">
                <p>No quiz history yet.</p>
                <button
                  type="button"
                  className="upload-btn"
                  onClick={() => navigate("/upload")}
                >
                  Start Learning
                </button>
              </div>
            ) : (
              <div className="progress-chart-wrap">
                <svg
                  className="progress-chart"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Learning progress chart based on quiz scores"
                >
                  <line x1="0" y1="25" x2="100" y2="25" className="chart-grid" />
                  <line x1="0" y1="50" x2="100" y2="50" className="chart-grid" />
                  <line x1="0" y1="75" x2="100" y2="75" className="chart-grid" />

                  {chartPoints.length > 1 && (
                    <polyline
                      points={polylinePoints}
                      fill="none"
                      stroke="#4e9cff"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}

                  {chartPoints.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="2.2"
                      fill="#2563eb"
                      vectorEffect="non-scaling-stroke"
                    >
                      <title>
                        {point.label}: {point.percentage}%
                      </title>
                    </circle>
                  ))}
                </svg>

                <div className="progress-chart-labels">
                  {progressHistory.map((item, index) => (
                    <span key={index}>
                      Q{item.quiz}
                      <small>{item.percentage}%</small>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <div className="edit-overlay">
          <div className="edit-modal">
            <div className="edit-avatar">
              <img
                src={
                  preview
                    ? preview
                    : `${API_URL}${user?.profileImage}`
                }
                alt="profile"
              />

              <label className="edit-camera">
                📷
                <input type="file" onChange={handleImageChange} />
              </label>
            </div>

            <form className="edit-form" onSubmit={handleUpdateProfile}>
              <input
                type="text"
                className="edit-input"
                placeholder="Full Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <input
                type="password"
                className="edit-input"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />

              <input
                type="password"
                className="edit-input"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <div className="edit-actions">
                <button
                  type="button"
                  className="edit-cancel"
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="edit-save">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
