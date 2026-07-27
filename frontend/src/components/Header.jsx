import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "./header.css";

const Header = ({ userInfo, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const logoutHandler = () => {
    localStorage.removeItem("analysis");
    localStorage.removeItem("quizQuestions");
    localStorage.removeItem("quizAnswers");
    localStorage.removeItem("quizId");
    localStorage.removeItem("teachData");
    localStorage.removeItem("chatHistory");
    localStorage.removeItem("selectedTopic");

    setMenuOpen(false);
    onLogout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <nav className={`navbar ${menuOpen ? "menu-open" : ""}`}>
      <div className="logo" onClick={() => goTo("/")}>
        <img src={logo} alt="AI Learning Companion" />
      </div>

      <button
        type="button"
        className="nav-toggle"
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        {userInfo ? (
          <>
            <li
              className={isActive("/") ? "active" : ""}
              onClick={() => goTo("/")}
            >
              Dashboard
            </li>
            <li
              className={isActive("/upload") ? "active" : ""}
              onClick={() => goTo("/upload")}
            >
              Upload
            </li>
            <li
              className={isActive("/insights") ? "active" : ""}
              onClick={() => goTo("/insights")}
            >
              Insights
            </li>
            <li
              className={isActive("/about") ? "active" : ""}
              onClick={() => goTo("/about")}
            >
              About
            </li>
            <li
              className={isActive("/contact") ? "active" : ""}
              onClick={() => goTo("/contact")}
            >
              Contact
            </li>
            <li className="logout" onClick={logoutHandler}>
              Logout
            </li>
          </>
        ) : (
          <>
            <li onClick={() => goTo("/login")}>Login</li>
            <li onClick={() => goTo("/register")}>Register</li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Header;
