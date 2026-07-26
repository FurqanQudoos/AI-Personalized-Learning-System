import { useEffect, useState } from "react";
import "./admin.css";

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);

  /* FETCH CONTACTS */
  const fetchContacts = async () => {
    try {
      const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));

      const res = await fetch(
        "http://localhost:5000/api/admin/contacts",
        {
          headers: {
            Authorization: `Bearer ${adminInfo.token}`,
          },
        }
      );

      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  /* DELETE CONTACT */
  const deleteContact = async (id) => {
    if (!window.confirm("Delete message?")) return;

    try {
      const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));

      await fetch(
        `http://localhost:5000/api/admin/contacts/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${adminInfo.token}`,
          },
        }
      );

      fetchContacts();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h2>Contact Messages</h2>

      <div className="contact-container">

        {contacts.length === 0 ? (
          <div className="empty-state">
            <h3>No Messages Yet 📭</h3>
            <p>When users send messages, they will appear here.</p>
          </div>
        ) : (
          contacts.map((item) => (
            <div className="contact-card" key={item._id}>
              
              <div className="contact-header">
                <h3>{item.name}</h3>
                <button
                  className="delete-btn"
                  onClick={() => deleteContact(item._id)}
                >
                  Delete
                </button>
              </div>

              <p><strong>Email:</strong> {item.email}</p>
              <p><strong>Subject:</strong> {item.subject}</p>

              <div className="message-box">
                <strong>Message:</strong>
                <p>{item.message}</p>
              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default AdminContacts;