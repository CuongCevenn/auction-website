import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import { ModalsContext } from "../contexts/ModalsProvider";
import { ModalTypes } from "../utils/modalTypes";
import { Status } from "../utils/status";
import { useGlobal } from "../contexts/GlobalContext";

const Modal = ({ type, title, children }) => {
  const { closeModal, currentModal } = useContext(ModalsContext);

  if (type !== currentModal) return null;

  return ReactDOM.createPortal(
    <div
      className="modal fade show"
      style={{ display: "block" }}
    // onClick={closeModal}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button className="btn-close" onClick={closeModal} />
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

Modal.propTypes = {
  type: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.element)
}


const SessionModal = () => {
  const { closeModal } = useContext(ModalsContext);
  const [auctionId, setAuctionId] = useState("");
  const [beginningTime, setBeginningTime] = useState("");
  const [endingTime, setEndingTime] = useState("");
  const [status, setStatus] = useState(Status.PENDING);
  const [startingPrice, setStartingPrice] = useState(0);
  const [userId, setUserId] = useState(localStorage.getItem("username"));
  const [licensePlateId, setLicensePlateId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8082/auction_session");
        const data = await response.json();
        console.log(data);

        let randomId = generateRandomNumber(data);
        setAuctionId(randomId);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const generateRandomNumber = (data) => {
    let randomNum;
    if (Array.isArray(data)) {
      do {
        randomNum = Math.floor(1000 + Math.random() * 9000).toString().slice(0, 4);
      } while (data.some(item => item.auctionId === randomNum));
    } else {
      console.error('Data is not an array');
      randomNum = "1000";
    }
    return randomNum;
  };

  function checkLP(licensePlateId) {
    const data = JSON.parse(localStorage.getItem("license"));
    for (var i = 0; i < data.length; i++) {
      if (data[i].licensePlateId === licensePlateId) {
        return false;
      }
    }
    return true;
  }

  const handleSubmitSession = async (e) => {
    e.preventDefault();

    if (checkLP(licensePlateId)) {
      setError("Bạn cần đăng ký biển số xe trước!");
      return;
    } else {
      setError("");
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "auctionId": auctionId,
        "beginningTime": beginningTime,
        "endingTime": endingTime,
        "status": status,
        "startingPrice": startingPrice,
        "userId": userId,
        "licensePlateId": licensePlateId
      })
    };
    const response = await fetch('http://localhost:8082/auction_session', requestOptions);

    closeModal();
    if (response.ok) {
      alert("Tạo thành công phiên đấu giá!");
    } else {
      alert("Tạo thất bại!");
      console.log("Tạo thất bại!");
    }
  }

  const handleBeginningTime = (e) => {
    const inputDateTime = e.target.value;
    // const formattedDateTime = inputDateTime.replace(' ', 'T');
    setBeginningTime(inputDateTime);
  }

  const handleEndingTime = (e) => {
    const inputDateTime = e.target.value;
    // const formattedDateTime = inputDateTime.replace(' ', 'T');
    setEndingTime(inputDateTime);
  }

  return (
    <Modal type={ModalTypes.SESSION} title="Create Session">
      <form onSubmit={handleSubmitSession}>
        <div className="form-group">
          <label htmlFor="licensePlateId">License Plate Number</label>
          <input
            type="text"
            id="licensePlateId"
            className="form-control"
            placeholder="XXXXX or XXXX ..."
            value={licensePlateId}
            onChange={(e) => setLicensePlateId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="beginningTime">Beginning Time</label>
          <input
            type="text"
            id="beginningTime"
            className="form-control"
            placeholder="YYYY-MM-DD HH:mm:ss"
            onChange={(e) => handleBeginningTime(e)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endingTime">Ending Time</label>
          <input
            type="text"
            id="endingTime"
            className="form-control"
            placeholder="YYYY-MM-DD HH:mm:ss"
            onChange={(e) => handleEndingTime(e)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="startingPrice">Starting Price</label>
          <input
            type="number"
            id="startingPrice"
            className="form-control"
            placeholder="1000..."
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            required
          />
        </div>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <div className="text-center mt-4">
          <button type="submit" className="btn btn-primary">Create Session</button>
        </div>
      </form>
    </Modal>
  );
}

const LicensePlateModal = () => {
  const { closeModal } = useContext(ModalsContext);
  const [licensePlateId, setLicensePlateId] = useState("");
  const [meanOfTransport, setMeanOfTransport] = useState("motorbike");
  const [userId, setUserId] = useState(localStorage.getItem("username"));
  const [licensePlateProvince, setLicensePlateProvince] = useState("");

  const handleSubmitLP = async (e) => {
    e.preventDefault();

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "licensePlateId": licensePlateId,
        "meanOfTransport": meanOfTransport,
        "userName": userId,
        "province_id": licensePlateProvince
      })
    };
    const response = await fetch('http://localhost:8082/license_plate', requestOptions);

    closeModal();
    if (response.ok) {
      alert("Đăng ký thành công biển số xe!");
    } else {
      alert("Đăng ký thất bại!");
      console.log("Tạo thất bại!");
    }
  }

  return (
    <Modal type={ModalTypes.PLATE} title="Register License Plate">
      <div className="modal-body">
        <h2>Đăng ký biển số xe</h2>
        <form onSubmit={handleSubmitLP}>
          <div className="form-group">
            <label htmlFor="licensePlateId">License Plate Number</label>
            <input
              type="text"
              id="licensePlateId"
              className="form-control"
              placeholder="XX.XXX or XXXX ..."
              value={licensePlateId}
              onChange={(e) => setLicensePlateId(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="meanOfTransport">Mean of Transport</label>
            <select
              id="meanOfTransport"
              className="form-control"
              value={meanOfTransport}
              onChange={(e) => setMeanOfTransport(e.target.value)}
            >
              <option value="motorbike">Motorbike</option>
              <option value="car">Car</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="licensePlateProvince">Province Code</label>
            <input
              type="text"
              id="licensePlateProvince"
              className="form-control"
              placeholder="Province code"
              value={licensePlateProvince}
              onChange={(e) => setLicensePlateProvince(e.target.value)}
              required
            />
          </div>
          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary">Register</button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

const ViewLPModal = () => {
  const { closeModal } = useContext(ModalsContext);
  const [licensePlateId, setLicensePlateId] = useState("");
  const [meanOfTransport, setMeanOfTransport] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem(""));
  const [licensePlateProvince, setLicensePlateProvince] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmitLP = async (e) => {
    e.preventDefault();

    const response = await fetch(`http://localhost:8082/license_plate/${licensePlateId}`);
    const data = await response.json();
    setMeanOfTransport(data.meanOfTransport);
    setUserId(data.userName);
    setLicensePlateProvince(data.province_id);
    if (response.ok) {
      alert("Tìm kiếm thành công biển số xe!");
      setSuccess(true);
    } else {
      alert("Tìm kiếm thất bại!");
    }
  }

  return (
    <Modal type={ModalTypes.VIEW_PLATE} title="Find License Plate">
      <div className="modal-body">
        <h2>Tìm biển số xe</h2>
        <form onSubmit={handleSubmitLP}>
          <div className="form-group">
            <label htmlFor="licensePlateId">License Plate Number</label>
            <input
              type="text"
              id="licensePlateId"
              className="form-control"
              placeholder="XX.XXX or XXXX ..."
              onChange={(e) => setLicensePlateId(e.target.value)}
              required
            />
          </div>
          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary">Find</button>
          </div>
          {(success) && (
            <div>
              <div className="form-group">
                <label htmlFor="licensePlateId">License Plate Id: {licensePlateId}</label>
              </div>
              <div className="form-group">
                <label htmlFor="meanOfTransport">Mean of Transport: {meanOfTransport}</label>
              </div>
              <div className="form-group">
                <label htmlFor="licensePlateProvince">Province Code: {licensePlateProvince}</label>
              </div>
              <div className="form-group">
                <label htmlFor="userId">User Id: {userId}</label>
              </div>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
}

const SignUpModal = () => {
  const { closeModal } = useContext(ModalsContext);
  const [username, setUsername] = useState("");
  const [accountType, setAccountType] = useState("user");
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function arePasswordsEqual(password, confirmPassword) {
    return password === confirmPassword;
  }

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!username || !fullName || !contactNumber || !address || !identityNumber || !email || !password || !confirmPassword) {
      setError("All fields are necessary.");
      return;
    }

    if (!arePasswordsEqual(password, confirmPassword)) {
      setError("Passwords do not match");
      return;
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "username": username,
        "password": password,
        "accountType": accountType,
        "fullname": fullName,
        "contactNumber": contactNumber,
        "address": address,
        "identityNumber": identityNumber,
        "email": email
      })
    };
    const response = await fetch('http://localhost:8082/user', requestOptions);
    const result = await response.json();
    closeModal();
    if (response.ok) {
      alert("Đăng ký tài khoản thành công!");
    } else {
      alert("Đăng ký tài khoản thất bại!");
    }

  };

  return (
    <Modal type={ModalTypes.SIGN_UP} title="Sign up for Auction">
      <div className="modal-body">
        <p>Please fill in the following information to sign up:</p>
        <form onSubmit={handleSignUp}>
          <div className="form-group">
            <label htmlFor="username-input">Username</label>
            <input
              id="username-input"
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="fullName-input">Full Name</label>
            <input
              id="fullName-input"
              type="text"
              className="form-control"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone-input">Phone Number</label>
            <input
              id="phone-input"
              type="tel"
              className="form-control"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword-input">Confirm Password</label>
            <input
              id="confirmPassword-input"
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address-input">Address</label>
            <input
              id="address-input"
              type="text"
              className="form-control"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="idn-input">Identity Number</label>
            <input
              id="idn-input"
              type="text"
              className="form-control"
              value={identityNumber}
              onChange={(e) => setIdentityNumber(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const SignInModal = () => {
  const { closeModal } = useContext(ModalsContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { updateGlobalValue } = useGlobal();

  function handleChangeGlobalValue(e) {
    console.log("123");
    updateGlobalValue(e);
  };

  useEffect(() => {
    if (submitted) {
      const fetchData = async () => {
        try {
          const response = await fetch(`http://localhost:8082/user/${username}`);
          const data = await response.json();
          console.log(data);

          localStorage.setItem("accountType", data.accountType);
          localStorage.setItem("fullName", data.fullname);
          localStorage.setItem("contactNumber", data.contactNumber);
          localStorage.setItem("address", data.address);
          localStorage.setItem("identityNumber", data.identityNumber);
          localStorage.setItem("email", data.email);
          localStorage.setItem("password", data.password);

          handleChangeGlobalValue(data.accountType);

        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
      fetchData();
      window.location.reload();
    }

    setSubmitted(false);
  }, [submitted]);

  function success(result) {
    return result === "Đăng nhập thành công";
  }

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("All fields are necessary.");
      return;
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "username": username,
        "password": password,
        "accountType": "",
        "fullname": "",
        "contactNumber": "",
        "address": "",
        "identityNumber": "",
        "email": ""
      })
    };
    const response = await fetch('http://localhost:8082/login', requestOptions);
    const result = await response.text();

    if (success(result)) {
      localStorage.setItem("username", username);
      alert("Đăng nhập thành công!");

      const response2 = await fetch(`http://localhost:8082/license_plate`);
      const data = await response2.json();
      localStorage.setItem("license", JSON.stringify(data));

      setSubmitted(true);
      closeModal();
    } else {
      if (result === "Sai mật khẩu") {
        alert("Sai mật khẩu!");
      } else {
        alert("Đăng nhập thất bại! Kiểm tra lại tài khoản, mật khẩu!");
      }
    }
  };

  return (
    <Modal type={ModalTypes.SIGN_IN} title="Sign in for Auction">
      <div className="modal-body">
        <form onSubmit={handleSignIn}>
          <div className="form-group">
            <label htmlFor="username-input">Username</label>
            <input
              autoFocus
              id="username-input"
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const UpdateModal = () => {
  const { closeModal } = useContext(ModalsContext);
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [accountType, setAccountType] = useState(localStorage.getItem("accountType"));
  const [fullName, setFullName] = useState(localStorage.getItem("fullName"));
  const [contactNumber, setContactNumber] = useState(localStorage.getItem("contactNumber"));
  const [address, setAddress] = useState(localStorage.getItem("address"));
  const [identityNumber, setIdentityNumber] = useState(localStorage.getItem("identityNumber"));
  const [email, setEmail] = useState(localStorage.getItem("email"));
  const [error, setError] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!username || !fullName || !contactNumber || !address || !identityNumber || !email) {
      setError("All fields are necessary.");
      return;
    }
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "username": username,
        "password": localStorage.getItem("password"),
        "accountType": accountType,
        "fullname": fullName,
        "contactNumber": contactNumber,
        "address": address,
        "identityNumber": identityNumber,
        "email": email
      })
    };
    const response = await fetch('http://localhost:8082/user', requestOptions);
    const result = await response.json();
    closeModal();
    if (response.ok) {
      alert("Update successful!");
    } else {
      alert("Update failed!");
    }
  };

  return (
    <Modal type={ModalTypes.UPDATE} title="User Information">
      <div className="modal-body">
        <p>Update your information here</p>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label htmlFor="username-input">Username</label>
            <input
              autoFocus
              id="username-input"
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="fullName-input">Full Name</label>
            <input
              id="fullName-input"
              type="text"
              className="form-control"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone-input">Phone Number</label>
            <input
              id="phone-input"
              type="tel"
              className="form-control"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address-input">Address</label>
            <input
              id="address-input"
              type="text"
              className="form-control"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="idn-input">Identity Number</label>
            <input
              id="idn-input"
              type="text"
              className="form-control"
              value={identityNumber}
              onChange={(e) => setIdentityNumber(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-danger">
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

const ViewModal = () => {
  const { closeModal } = useContext(ModalsContext);
  // const [username, setUsername] = useState(localStorage.getItem("tempUsername"));
  // const [accountType, setAccountType] = useState(localStorage.getItem("tempAccountType"));
  // const [fullName, setFullName] = useState(localStorage.getItem("tempFullName"));
  // const [contactNumber, setContactNumber] = useState(localStorage.getItem("tempContactNumber"));
  // const [address, setAddress] = useState(localStorage.getItem("tempAddress"));
  // const [identityNumber, setIdentityNumber] = useState(localStorage.getItem("tempIdentityNumber"));
  // const [email, setEmail] = useState(localStorage.getItem("tempEmail"));
  // const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [accountType, setAccountType] = useState("");
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // useEffect(() => {
  //   setUsername(localStorage.getItem("tempUsername"));
  //   setAccountType(localStorage.getItem("tempAccountType"));
  //   setFullName(localStorage.getItem("tempFullName"));
  //   setContactNumber(localStorage.getItem("tempContactNumber"));
  //   setAddress(localStorage.getItem("tempAddress"));
  //   setIdentityNumber(localStorage.getItem("tempIdentityNumber"));
  //   setEmail(localStorage.getItem("tempEmail"));
  // }, []);


  const handleUpdate = async (e) => {

    if (!username || !fullName || !contactNumber || !address || !identityNumber || !email) {
      setError("All fields are necessary.");
      return;
    }
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "username": username,
        "password": localStorage.getItem("tempPassword"),
        "accountType": accountType,
        "fullname": fullName,
        "contactNumber": contactNumber,
        "address": address,
        "identityNumber": identityNumber,
        "email": email
      })
    };
    const response = await fetch('http://localhost:8082/user', requestOptions);
    const result = await response.json();
    closeModal();
    if (response.ok) {
      alert("Update successful!");
    } else {
      alert("Update failed!");
    }
  };

  return (
    <Modal type={ModalTypes.VIEW_USER} title="User Information">
      <div className="modal-body">
        <p>Update your information here</p>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label htmlFor="username-input">Username</label>
            <input
              autoFocus
              id="username-input"
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="accountType-input">Account Type</label>
            <input
              autoFocus
              id="accountType-input"
              type="text"
              className="form-control"
              value={accountType}
              required
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="fullName-input">Full Name</label>
            <input
              id="fullName-input"
              type="text"
              className="form-control"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone-input">Phone Number</label>
            <input
              id="phone-input"
              type="tel"
              className="form-control"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address-input">Address</label>
            <input
              id="address-input"
              type="text"
              className="form-control"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="idn-input">Identity Number</label>
            <input
              id="idn-input"
              type="text"
              className="form-control"
              value={identityNumber}
              onChange={(e) => setIdentityNumber(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-danger">
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export { SignUpModal, SessionModal, LicensePlateModal, SignInModal, UpdateModal, ViewLPModal, ViewModal };
