import { Link, Outlet } from "react-router-dom";
import { useState } from "react";
import "../App.css";

const AdminLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-container">

      {/* TOGGLE BUTTON */}
      <button className="menu-btn" onClick={() => setOpen(!open)}>
        ☰
      </button>

      {/* SIDEBAR */}
      <div className={`admin-sidebar ${open ? "active" : ""}`}>
        <h2>Admin</h2>

        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/contacts">Messages</Link>
      </div>

      {/* CONTENT */}
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;