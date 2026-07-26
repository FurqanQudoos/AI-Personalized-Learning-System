import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GoogleSuccess = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const user = {
      token: params.get("token"),
      name: params.get("name"),
      email: params.get("email"),
      profileImage: params.get("image"),
    };

    localStorage.setItem("userInfo", JSON.stringify(user));
    onLogin(user);
    navigate("/");
  }, []);

  return <h2>Signing in...</h2>;
};

export default GoogleSuccess;
