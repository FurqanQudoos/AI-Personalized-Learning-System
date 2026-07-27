import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "./header.css";

const Header = ({ userInfo, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation(); // active route detect

  const logoutHandler = () => {

    // AI session data clear
    localStorage.removeItem("analysis");
    localStorage.removeItem("quizQuestions");
    localStorage.removeItem("quizAnswers");
    localStorage.removeItem("quizId");
    localStorage.removeItem("teachData");
    localStorage.removeItem("chatHistory");
    localStorage.removeItem("selectedTopic");

    onLogout();

    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* LOGO */}
      <div className="logo" onClick={() => navigate("/")}>
        <img src={logo} alt="AI Learning Companion" />
      </div>

      <ul className="nav-links">
        {userInfo ? (
          <>
            <li
              className={isActive("/") ? "active" : ""}
              onClick={() => navigate("/")}
            >
              Dashboard
            </li>

            <li
              className={isActive("/upload") ? "active" : ""}
              onClick={() => navigate("/upload")}
            >
              Upload
            </li>

            <li
              className={isActive("/insights") ? "active" : ""}
              onClick={() => navigate("/insights")}
            >
              Insights
            </li>

            <li
              className={isActive("/about") ? "active" : ""}
              onClick={() => navigate("/about")}
            >
              About
            </li>

            <li
              className={isActive("/contact") ? "active" : ""}
              onClick={() => navigate("/contact")}
            >
              Contact
            </li>

            <li className="logout" onClick={logoutHandler}>
              Logout
            </li>
          </>
        ) : (
          <>
            <li onClick={() => navigate("/login")}>Login</li>
            <li onClick={() => navigate("/register")}>Register</li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Header;
