import PropTypes from "prop-types";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ModalsProvider } from "./contexts/ModalsProvider";
import { GlobalProvider } from "./contexts/GlobalContext";
import Navbar from "./components/Navbar";
import { SignUpModal, SessionModal, LicensePlateModal, SignInModal, UpdateModal, ViewModal, RechargeModal } from "./components/Modal";
import AdminPage from "./pages/Admin";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Session from "./pages/Session";
import UserManage from "./pages/UserManage";
import CompletedPage from "./pages/Completed";

function App() {
  function isAdmin() {
    return localStorage.getItem("accountType") === "admin";
  }

  const admin = isAdmin();

  const Providers = ({ children }) => {
    return (
      <GlobalProvider>
        <ModalsProvider>{children}</ModalsProvider>
      </GlobalProvider>
    );
  };

  return (
    <Providers>
      <Router>
        <Navbar admin={admin} />
        <UpdateModal />
        <SignInModal />
        <SignUpModal />
        <SessionModal />
        <LicensePlateModal />
        <ViewModal />
        <RechargeModal />
        {admin && (
          <Routes>
            <Route path={import.meta.env.BASE_URL} Component={AdminPage} />
            <Route path={import.meta.env.BASE_URL + "completed"} Component={CompletedPage} />
            <Route path={import.meta.env.BASE_URL + "admin"} Component={UserManage} />
          </Routes>
        )}
        {!admin && (
          <Routes>
            <Route path={import.meta.env.BASE_URL} Component={Dashboard} />
            <Route path={import.meta.env.BASE_URL + "session"} Component={Session} />
          </Routes>
        )}
      </Router>
      <Footer />
    </Providers>
  );
}

App.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element),
  condition: PropTypes.bool
}

export default App;
