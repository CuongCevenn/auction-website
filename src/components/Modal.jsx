/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import { ModalsContext } from "../contexts/ModalsProvider";
import { ModalTypes } from "../utils/modalTypes";
import { Status } from "../utils/status";
import { useGlobal } from "../contexts/GlobalContext";
import './Modal.css'; // Đảm bảo đã thêm CSS cho modal

const Modal = ({ type, title, children }) => {
  const { closeModal, currentModal } = useContext(ModalsContext);

  if (type !== currentModal) return null; // Chỉ hiển thị modal khi đúng loại

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={closeModal}> {/* Lớp phủ mờ */}
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click chồng chéo
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button className="btn-close" onClick={closeModal} />
          </div>
          <div className="modal-body">{children}</div> {/* Nội dung chính của modal */}
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
    const formattedDateTime = inputDateTime.replace('T', ' ').slice(0, 19);
    setBeginningTime(formattedDateTime + ':00');
  }

  const handleEndingTime = (e) => {
    const inputDateTime = e.target.value;
    const formattedDateTime = inputDateTime.replace('T', ' ').slice(0, 19);
    setEndingTime(formattedDateTime + ':00');
  }

  return (
    <Modal type={ModalTypes.SESSION} title="Create Session">
      <form onSubmit={handleSubmitSession} style={{ textAlign: 'left', padding: '20px' }}>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="licensePlateId" style={{ fontWeight: 'bold', color: '#333' }}>License Plate Number</label>
          <input
            type="text"
            id="licensePlateId"
            className="form-control"
            placeholder="Nhập biển số xe"
            value={licensePlateId}
            onChange={(e) => setLicensePlateId(e.target.value)}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="beginningTime" style={{ fontWeight: 'bold', color: '#333' }}>Beginning Time</label>
          <input
            type="datetime-local"
            id="beginningTime"
            className="form-control"
            // placeholder="YYYY-MM-DD HH:mm:ss"
            onChange={(e) => handleBeginningTime(e)}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="endingTime" style={{ fontWeight: 'bold', color: '#333' }}>Ending Time</label>
          <input
            type="datetime-local"
            id="endingTime"
            className="form-control"
            // placeholder="YYYY-MM-DD HH:mm:ss"
            onChange={(e) => handleEndingTime(e)}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="startingPrice" style={{ fontWeight: 'bold', color: '#333' }}>Starting Price</label>
          <input
            type="number"
            id="startingPrice"
            className="form-control"
            placeholder="1000..."
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {error && (
          <div className="alert alert-danger" role="alert" style={{ textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div className="text-center" style={{ marginTop: '20px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              maxWidth: '150px',
              padding: '10px 20px', // Tăng padding
              fontSize: '14px', // Kích thước chữ vừa phải
              borderRadius: '6px', // Bo góc
              transition: 'background-color 0.3s',
            }}
          >
            Create Session
          </button>
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
  const [licensePlateProvince, setLicensePlateProvince] = useState("1");
  const provinces = [
    {
      "id": 1,
      "provinceName": "Hà Nội"
    },
    {
      "id": 2,
      "provinceName": "Hồ Chí Minh"
    },
    {
      "id": 3,
      "provinceName": "Đà Nẵng"
    },
    {
      "id": 4,
      "provinceName": "Hải Phòng"
    },
    {
      "id": 5,
      "provinceName": "Cần Thơ"
    },
    {
      "id": 6,
      "provinceName": "An Giang"
    },
    {
      "id": 7,
      "provinceName": "Bà Rịa - Vũng Tàu"
    },
    {
      "id": 8,
      "provinceName": "Bắc Giang"
    },
    {
      "id": 9,
      "provinceName": "Bắc Kạn"
    },
    {
      "id": 10,
      "provinceName": "Bạc Liêu"
    },
    {
      "id": 11,
      "provinceName": "Bắc Ninh"
    },
    {
      "id": 12,
      "provinceName": "Bến Tre"
    },
    {
      "id": 13,
      "provinceName": "Bình Định"
    },
    {
      "id": 14,
      "provinceName": "Bình Dương"
    },
    {
      "id": 15,
      "provinceName": "Bình Phước"
    },
    {
      "id": 16,
      "provinceName": "Bình Thuận"
    },
    {
      "id": 17,
      "provinceName": "Cà Mau"
    },
    {
      "id": 18,
      "provinceName": "Cao Bằng"
    },
    {
      "id": 19,
      "provinceName": "Đắk Lắk"
    },
    {
      "id": 20,
      "provinceName": "Đắk Nông"
    },
    {
      "id": 21,
      "provinceName": "Điện Biên"
    },
    {
      "id": 22,
      "provinceName": "Đồng Nai"
    },
    {
      "id": 23,
      "provinceName": "Đồng Tháp"
    },
    {
      "id": 24,
      "provinceName": "Gia Lai"
    },
    {
      "id": 25,
      "provinceName": "Hà Giang"
    },
    {
      "id": 26,
      "provinceName": "Hà Nam"
    },
    {
      "id": 27,
      "provinceName": "Hà Tĩnh"
    },
    {
      "id": 28,
      "provinceName": "Hải Dương"
    },
    {
      "id": 29,
      "provinceName": "Hậu Giang"
    },
    {
      "id": 30,
      "provinceName": "Hòa Bình"
    },
    {
      "id": 31,
      "provinceName": "Hưng Yên"
    },
    {
      "id": 32,
      "provinceName": "Khánh Hòa"
    },
    {
      "id": 33,
      "provinceName": "Kiên Giang"
    },
    {
      "id": 34,
      "provinceName": "Kon Tum"
    },
    {
      "id": 35,
      "provinceName": "Lai Châu"
    },
    {
      "id": 36,
      "provinceName": "Lâm Đồng"
    },
    {
      "id": 37,
      "provinceName": "Lạng Sơn"
    },
    {
      "id": 38,
      "provinceName": "Lào Cai"
    },
    {
      "id": 39,
      "provinceName": "Long An"
    },
    {
      "id": 40,
      "provinceName": "Nam Định"
    },
    {
      "id": 41,
      "provinceName": "Nghệ An"
    },
    {
      "id": 42,
      "provinceName": "Ninh Bình"
    },
    {
      "id": 43,
      "provinceName": "Ninh Thuận"
    },
    {
      "id": 44,
      "provinceName": "Phú Thọ"
    },
    {
      "id": 45,
      "provinceName": "Quảng Bình"
    },
    {
      "id": 46,
      "provinceName": "Quảng Nam"
    },
    {
      "id": 47,
      "provinceName": "Quảng Ngãi"
    },
    {
      "id": 48,
      "provinceName": "Quảng Ninh"
    },
    {
      "id": 49,
      "provinceName": "Quảng Trị"
    },
    {
      "id": 50,
      "provinceName": "Sóc Trăng"
    },
    {
      "id": 51,
      "provinceName": "Sơn La"
    },
    {
      "id": 52,
      "provinceName": "Tây Ninh"
    },
    {
      "id": 53,
      "provinceName": "Thái Bình"
    },
    {
      "id": 54,
      "provinceName": "Thái Nguyên"
    },
    {
      "id": 55,
      "provinceName": "Thanh Hóa"
    },
    {
      "id": 56,
      "provinceName": "Thừa Thiên Huế"
    },
    {
      "id": 57,
      "provinceName": "Tiền Giang"
    },
    {
      "id": 58,
      "provinceName": "Trà Vinh"
    },
    {
      "id": 59,
      "provinceName": "Tuyên Quang"
    },
    {
      "id": 60,
      "provinceName": "Vĩnh Long"
    },
    {
      "id": 61,
      "provinceName": "Vĩnh Phúc"
    },
    {
      "id": 62,
      "provinceName": "Yên Bái"
    }
  ]

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

      const response2 = await fetch(`http://localhost:8082/license_plate`);
      const data = await response2.json();
      localStorage.setItem("license", JSON.stringify(data));

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
              placeholder="XXXX"
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
            <label htmlFor="licensePlateProvince">Province</label>
            <select
              id="licensePlateProvince"
              className="form-control"
              value={licensePlateProvince}
              onChange={(e) => setLicensePlateProvince(e.target.value)}
            >
              {provinces.map(province => (
                <option key={province.id} value={province.id}>
                  {province.provinceName}
                </option>
              ))}
            </select>
          </div>
          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary">Register</button>
          </div>
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
            <button type="button" className="btn btn-secondary" style={{ marginRight: '20px' }} onClick={closeModal}>
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
      //window.location.reload();
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
            <button type="button" className="btn btn-secondary" style={{ marginRight: '20px' }} onClick={closeModal}>
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
      method: 'POST',
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
            <button type="button" className="btn btn-secondary"  style={{ marginRight: '20px' }} onClick={closeModal}>
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
  const { activeItem, closeModal, currentModal } = useContext(ModalsContext);
  const [username, setUsername] = useState("");
  const [accountType, setAccountType] = useState("");
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("")
  const [error, setError] = useState("");
  const [balance, setBalance] = useState("");
  const [modalKey, setModalKey] = useState(0);

  useEffect(() => {
    setModalKey(Date.now());
    setUsername(activeItem.username);
    setAccountType(activeItem.accountType);
    setFullName(activeItem.fullname);
    setContactNumber(activeItem.contactNumber);
    setAddress(activeItem.address);
    setIdentityNumber(activeItem.identityNumber);
    setEmail(activeItem.email);
    setPassword(activeItem.password);
    setBalance(activeItem.balance);
  }, [currentModal]);

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
        "password": password,
        "accountType": accountType,
        "fullname": fullName,
        "contactNumber": contactNumber,
        "address": address,
        "identityNumber": identityNumber,
        "email": email,
        "balance": balance
      })
    };
    const response = await fetch(`http://localhost:8082/user/${username}`, requestOptions);
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
            <label htmlFor="balance-input">Balance</label>
            <input
              autoFocus
              id="balance-input"
              type="text"
              className="form-control"
              value={balance}
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
            <button type="button" className="btn btn-secondary" style={{ marginRight: '20px' }} onClick={closeModal}>
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

const RechargeModal = () => {
  const { activeItem, closeModal, currentModal } = useContext(ModalsContext);
  const [username, setUsername] = useState("");
  const [accountType, setAccountType] = useState("");
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("")
  const [error, setError] = useState("");
  const [balance, setBalance] = useState("");
  const [modalKey, setModalKey] = useState(0);
  const [money, setMoney] = useState("");

  useEffect(() => {
    setModalKey(Date.now());
    setUsername(activeItem.username);
    setAccountType(activeItem.accountType);
    setFullName(activeItem.fullname);
    setContactNumber(activeItem.contactNumber);
    setAddress(activeItem.address);
    setIdentityNumber(activeItem.identityNumber);
    setEmail(activeItem.email);
    setPassword(activeItem.password);
    setBalance(activeItem.balance);
  }, [currentModal]);

  const handleUpdate = async (e) => {
    let temp = parseInt(money) + parseInt(balance);
    // setBalance(temp);
    if (!money) {
      setError("All fields are necessary.");
      return;
    }
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "username": username,
        "password": password,
        "accountType": accountType,
        "fullname": fullName,
        "contactNumber": contactNumber,
        "address": address,
        "identityNumber": identityNumber,
        "email": email,
        "balance": temp
      })
    };
    const response = await fetch(`http://localhost:8082/user/${username}`, requestOptions);
    const result = await response.json();
    closeModal();
    if (response.ok) {
      alert("Update successful!");
    } else {
      alert("Update failed!");
    }
  };

  return (
    <Modal type={ModalTypes.RECHARGE} title="Recharge balance">
      <div className="modal-body">
        <p>Enter amount to recharge</p>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label htmlFor="username-input">Username</label>
            <input
              id="username-input"
              type="text"
              className="form-control"
              value={username}
              required
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="balance-input">Balance</label>
            <input
              autoFocus
              id="balance-input"
              type="number"
              className="form-control"
              onChange={(e) => setMoney(e.target.value)}
              value={money}
              required
            />
          </div>

          {error && (
            <div className="text-danger">
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" style={{ marginRight: '20px' }} onClick={closeModal}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Recharge
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export { SignUpModal, SessionModal, LicensePlateModal, SignInModal, UpdateModal, ViewModal, RechargeModal };
