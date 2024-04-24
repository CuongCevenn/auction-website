import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router";
import { ModalsContext } from "../contexts/ModalsProvider";
import { ModalTypes } from "../utils/modalTypes";

const Navbar = ({ admin }) => {
  const openModal = useContext(ModalsContext).openModal;
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [userManage, setUserManage] = useState("User Manage");

  function admin() {
    return localStorage.getItem("accountType") === "admin";
  }

  useEffect(() => {
    if (localStorage.getItem("username")) {
      setUser(localStorage.getItem("username"));
    }
  }, []);

  const handleLP = () => {
    openModal(ModalTypes.PLATE);
  }

  const handleSignUp = () => {
    openModal(ModalTypes.SIGN_UP);
  }

  const handleSignIn = () => {
    openModal(ModalTypes.SIGN_IN);
  }

  const handleViewLP = () => {
    openModal(ModalTypes.VIEW_PLATE);
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

  const handleUser = () => {
    if (userManage === "User Manage") {
      setUserManage("Dashboard");
      navigate(import.meta.env.BASE_URL + "admin");
    } else {
      setUserManage("User Manage");
      navigate(import.meta.env.BASE_URL);
    }
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
              {admin() && (
                <button onClick={handleUser} className="btn btn-secondary me-2">{userManage}</button>
              )}
              {!admin() && (
                <div>
                  <button onClick={handleLP} className="btn btn-secondary me-2">Register License Plate</button>
                  <button onClick={handleViewLP} className="btn btn-secondary me-2">License Plate</button>
                </div>
              )}
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
