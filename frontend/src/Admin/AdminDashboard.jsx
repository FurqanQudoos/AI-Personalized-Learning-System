import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    uploads: 0,
    messages: 0,
  });

  const [loading, setLoading] = useState(true);

  /* FETCH DASHBOARD DATA */
  const fetchStats = async () => {
  try {
    const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));

    if (!adminInfo || !adminInfo.token) {
      console.log("No admin token found");
      return;
    }

    const res = await fetch("http://localhost:5000/api/admin/stats", {
      headers: {
        Authorization: `Bearer ${adminInfo.token}`,
      },
    });

    const data = await res.json();

    setStats({
      users: data.users || 0,
      uploads: data.uploads || 0,
      messages: data.messages || 0,
    });

    setLoading(false);
  } catch (error) {
    console.log(error);
    setLoading(false);
  }
};

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <div className="admin-cards">
        <div className="admin-card">
          <h3>{loading ? "..." : stats.users}</h3>
          <p>Total Users</p>
        </div>

        <div className="admin-card">
          <h3>{loading ? "..." : stats.uploads}</h3>
          <p>Uploads</p>
        </div>

        <div className="admin-card">
          <h3>{loading ? "..." : stats.messages}</h3>
          <p>Messages</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;