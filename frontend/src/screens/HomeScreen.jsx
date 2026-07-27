import { useState, useEffect } from "react";
import "../App.css";
import { API_URL } from "../config";

const HomeScreen = () => {
  const [learningProgress] = useState([
    { time: 0, value: 0 },
    { time: 48, value: 10 },
    { time: 90, value: 15 },
    { time: 196, value: 20 },
    { time: 1505, value: 25 },
    { time: 1550, value: 25 },
    { time: 2006, value: 30 },
  ]);

  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);

  /* 🔹 Get logged-in user */
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    if (storedUser) {
      setUser(storedUser);
      setEditName(storedUser.name); // IMPORTANT
    }
  }, []);

  /* ================= IMAGE CHANGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= UPDATE PROFILE ================= */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", editName);

      if (oldPassword) formData.append("oldPassword", oldPassword);
      if (newPassword) formData.append("newPassword", newPassword);
      if (image) formData.append("profileImage", image);

      const res = await fetch(
        `${API_URL}/api/users/update-profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          body: formData,
        }
      );

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

        {/* LEFT */}
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

        {/* MIDDLE */}
        <div className="progress-card">
          <h3>Welcome Back, {user?.name || "User"}!</h3>

          <div className="strength-buttons">
            <button className="strong">Strong</button>
            <button className="average">Average</button>
            <button className="weak">Weak</button>
          </div>

          <div className="learning-progress">
            <h4>Learning Progress</h4>

            <svg width="100%" height="150">
              {learningProgress.map((point, index) => {
                if (index === 0) return null;
                const prev = learningProgress[index - 1];

                return (
                  <line
                    key={index}
                    x1={(prev.time / 2006) * 100 + "%"}
                    y1={150 - prev.value * 5}
                    x2={(point.time / 2006) * 100 + "%"}
                    y2={150 - point.value * 5}
                    stroke="#4e9cff"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* RIGHT */}
        <div className="feedback-card">
          <h4>Recent Feedback</h4>
          <p>Learning feedback will appear here...</p>
          <button className="upload-btn">Upload New Progress</button>
        </div>
      </div>

      {/* ================= EDIT MODAL ================= */}
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
