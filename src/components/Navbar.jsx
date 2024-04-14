import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { ModalsContext } from "../contexts/ModalsProvider";
import { ModalTypes } from "../utils/modalTypes";

const Navbar = ({ admin }) => {
  const openModal = useContext(ModalsContext).openModal;
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [authButtonText, setAuthButtonText] = useState("Sign up");
  const [adminButtonText, setAdminButtonText] = useState("Admin");
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem("username")) {
      setUser(localStorage.getItem("username"));
    }
  }, []);

  const handleAdmin = () => {
    if (location.pathname.includes("admin")) {
      navigate(import.meta.env.BASE_URL);
      setAdminButtonText("Admin");
    } else {
      navigate(import.meta.env.BASE_URL + "admin");
      setAdminButtonText("Home");
    }
  };

  const handleAuth = () => {
    if (user) {
      setUser("");
      setAuthButtonText("Sign up");
    } else {
      openModal(ModalTypes.SIGN_UP);
    }
  };

  const handleSession = () => {
    openModal(ModalTypes.SESSION);
  }

  const handleLP = () => {
    openModal(ModalTypes.PLATE);
  }

  const handleOpen = () => {
    navigate(import.meta.env.BASE_URL + "session");
  }

  const handleSignUp = () => {
    openModal(ModalTypes.SIGN_UP);
  }

  const handleSignIn = () => {
    openModal(ModalTypes.SIGN_IN);
  }

  const handleSignOut = () => {
    setUser("");
    localStorage.removeItem("username");
    localStorage.removeItem("accountType");
    localStorage.removeItem("fullName");
    localStorage.removeItem("contactNumber");
    localStorage.removeItem("address");
    localStorage.removeItem("identityNumber");
    localStorage.removeItem("email");
    localStorage.removeItem("password");

    navigate(import.meta.env.BASE_URL);
  }

  const handleInfo = () => {
    openModal(ModalTypes.UPDATE);
  }

  return (
    <nav className="navbar navbar-dark bg-primary" style={{ marginBottom: "20px" }}>
      <div className="container-fluid">
        <div className="navbar-brand mb-0 h1 me-auto">
          <img
            src={import.meta.env.BASE_URL + "logo.png"}
            alt="Logo"
            width="30"
            height="24"
            className="d-inline-block align-text-top"
            style={{ marginRight: "10px" }}
          />
          <span style={{ fontWeight: "bold" }}>The Auction App</span>
        </div>
        <div className="row row-cols-auto" style={{ alignItems: "center" }}>
  
          {!user && (
            <div>
              <button onClick={handleSignUp} className="btn btn-secondary me-2">SIGN UP</button>
              <button onClick={handleSignIn} className="btn btn-secondary me-2">SIGN IN</button>
            </div>
          )}
  
          {user && (
            <div className="d-flex align-items-center">
              <div className="navbar-brand">
                <button onClick={handleInfo} className="btn btn-secondary me-2">{user}</button>
                <button onClick={handleSignOut} className="btn btn-secondary me-2">SIGN OUT</button>
              </div>
              <button onClick={handleSession} className="btn btn-secondary me-2">Create Session</button>
              <button onClick={handleLP} className="btn btn-secondary me-2">Register License Plate</button>
              <button onClick={handleOpen} className="btn btn-secondary me-2">About us</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
  
};

Navbar.propTypes = {
  admin: PropTypes.bool
}

export default Navbar;
