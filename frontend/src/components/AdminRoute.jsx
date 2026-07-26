import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const admin = JSON.parse(localStorage.getItem("adminInfo"));

  if (!admin) {
    return <Navigate to="/admin/login" />;
  }

  if (admin.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;