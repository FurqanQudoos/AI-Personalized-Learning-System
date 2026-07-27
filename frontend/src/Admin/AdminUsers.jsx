import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import "./admin.css";
import "../../src/App.css";
import { API_URL } from "../config";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [filterRole, setFilterRole] = useState("All");
  const [statusTab, setStatusTab] = useState("All");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  /* FETCH USERS */
  const fetchUsers = async () => {
    try {
      const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));

      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${adminInfo.token}`,
        },
      });

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* 🔥 FINAL FILTER */
  const filteredUsers = users.filter((user) => {

  const roleMatch =
    filterRole === "All" ||
    user.role === filterRole;

  let statusMatch = false;

  // ALL -> EXCLUDE DELETED
  if (statusTab === "All") {

    statusMatch =
      user.status !== "deleted";
  }

  // OTHER TABS
  else {

    statusMatch =
      user.status === statusTab.toLowerCase();
  }

  return roleMatch && statusMatch;
});

  /* INPUT */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* ADD OPEN */
  const openAddModal = () => {
    setEditMode(false);
    setEditId(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Student",
    });
    setShowModal(true);
  };

  /* EDIT */
  const handleEdit = (user) => {
    setEditMode(true);
    setEditId(user._id);

    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });

    setShowModal(true);
  };

  /* ADD USER */
  const addUser = async () => {
    try {
      const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));

      const res = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminInfo.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("User Added");
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  /* UPDATE */
  const updateUser = async () => {
    try {
      const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));

      const res = await fetch(
        `${API_URL}/api/admin/users/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminInfo.token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("User Updated ✅");

      setShowModal(false);
      setEditMode(false);
      setEditId(null);

      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  /* DELETE */
  const deleteUser = async (id) => {

  if (
    !window.confirm(
      "Delete this user permanently?"
    )
  ) return;

  try {

    const adminInfo = JSON.parse(
      localStorage.getItem("adminInfo")
    );

    const res = await fetch(
      `${API_URL}/api/admin/users/${id}`,
      {
        method: "DELETE",

        headers: {
          Authorization:
            `Bearer ${adminInfo.token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok)
      throw new Error(data.message);

    fetchUsers();

  } catch (err) {

    alert(err.message);
  }
};
  /* CHANGE STATUS */
  const changeStatus = async (id, status) => {
    try {
      const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));

      const res = await fetch(
        `${API_URL}/api/admin/users/status/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminInfo.token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      fetchUsers();

    } catch (err) {
      alert(err.message);
    }
  };
  const customStyles = {

  headRow: {
    style: {

      backgroundColor: "#1e1b7a",

      color: "white",

      fontSize: "15px",

      fontWeight: "600",

      minHeight: "60px",

      borderTopLeftRadius: "12px",

      borderTopRightRadius: "12px",
    },
  },

  headCells: {
    style: {

      color: "white",

      fontWeight: "600",

      fontSize: "15px",
    },
  },
};

  /* COLUMNS */
  const columns = [

  {
    name: "Name",
    selector: (row) => row.name,
  },

  {
    name: "Email",
    selector: (row) => row.email,
  },

  {
    name: "Role",

    cell: (row) => (

      <span
        className={
          row.role === "Admin"
            ? "role-admin"
            : "role-student"
        }
      >
        {row.role}
      </span>
    ),
  },

  // SHOW ONLY IN DELETED TAB
  ...(statusTab === "Deleted"
    ? [

        {
          name: "Deleted By",

          selector: (row) =>
            row.deletedBy || "-",
        },

        {
          name: "Deleted At",

          selector: (row) =>

            row.deletedAt
              ? new Date(
                  row.deletedAt
                ).toLocaleString()
              : "-",
        },
      ]

    : []),

  {
    name: "Status",

    cell: (row) => {

      if (statusTab === "Inactive") {

        return (

          <select
            value={row.status}
            onChange={(e) =>
              changeStatus(
                row._id,
                e.target.value
              )
            }
            className={`status-select status-${row.status}`}
          >
            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        );
      }

      return (

        <span
          className={`status-badge status-${row.status}`}
        >
          {row.status}
        </span>
      );
    },
  },

  {
  name: "Action",

  cell: (row) => (

    <>
      <button
        className="edit-btn"
        onClick={() => handleEdit(row)}
      >
        Edit
      </button>

      <button
        className="delete-btn"
        onClick={() =>
          deleteUser(row._id)
        }
      >
        Delete
      </button>
    </>
  ),
},
];

  return (
    <div>
      {/* TOP */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Users</h2>

        <div style={{ display: "flex", gap: "10px" }}>
          <select
            className="filter-select"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Admin">Admin</option>
            <option value="Student">Student</option>
          </select>

          <button className="add-btn" onClick={openAddModal}>
            + Add User
          </button>
        </div>
      </div>

      {/* 🔥 TABS */}
      <div className="tabs">
        {["All", "Active", "Inactive"].map((tab) => (
          <button
            key={tab}
            className={statusTab === tab ? "tab active" : "tab"}
            onClick={() => setStatusTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <DataTable
  data={filteredUsers}
  columns={columns}
  pagination
  customStyles={customStyles}
/>

      {/* MODAL */}
      {showModal && (
        <div className="edit-overlay">
          <div className="edit-modal">

            <div className="modal-header">

              <h3>
                {editMode ? "Edit User" : "Add User"}
              </h3>

            </div>

            <div className="form-group">

              <label>
                Full Name:
              </label>

              <input
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>
                Email Address:
              </label>

              <input
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>
                Password:
              </label>

              <input
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>
                User Role:
              </label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Student">
                  Student
                </option>

                <option value="Admin">
                  Admin
                </option>
              </select>

            </div>

            <div className="modal-actions">

              <button
                className="premium-btn"
                onClick={editMode ? updateUser : addUser}
              >
                {editMode ? "Update User" : "Add User"}
              </button>

              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;