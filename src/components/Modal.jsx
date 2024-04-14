import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import { itemStatus } from "../utils/itemStatus";
import { formatField, formatMoney } from "../utils/formatString";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { ModalsContext } from "../contexts/ModalsProvider";
import { ModalTypes } from "../utils/modalTypes";
import { Status } from "../utils/status";

const Modal = ({ type, title, children }) => {
  const { closeModal, currentModal } = useContext(ModalsContext);

  if (type !== currentModal) return null;

  return ReactDOM.createPortal(
    <div
      className="modal fade show"
      style={{ display: "block" }}
      onClick={closeModal}
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

const ItemModal = () => {
  const { activeItem, openModal, closeModal } = useContext(ModalsContext);
  const [secondaryImageSrc, setSecondaryImageSrc] = useState("");
  const minIncrease = 1;
  const [bid, setBid] = useState();
  const [valid, setValid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState("");
  const [feedback, setFeedback] = useState("");
  const [minBid, setMinBid] = useState("-.--");

  useEffect(() => {
    if (activeItem.secondaryImage === undefined) return;
    import(`../assets/${activeItem.secondaryImage}.png`).then((src) => {
      setSecondaryImageSrc(src.default)
    })
  }, [activeItem.secondaryImage])

  useEffect(() => {
    const status = itemStatus(activeItem);
    setMinBid(formatMoney(activeItem.currency, status.amount + minIncrease));
  }, [activeItem]);

  const delayedClose = () => {
    setTimeout(() => {
      closeModal();
      setFeedback("");
      setValid("");
    }, 1000);
  };

  const handleSubmitBid = () => {
    // Get bid submission time as early as possible
    let nowTime = new Date().getTime();
    // Disable bid submission while we submit the current request
    setIsSubmitting(true);
    // Ensure item has not already ended
    if (activeItem.endTime - nowTime < 0) {
      setFeedback("Sorry, this item has ended!");
      setValid("is-invalid");
      delayedClose();
      setIsSubmitting(false);
      return;
    }
    // Ensure user has provided a username
    if (auth.currentUser.displayName == null) {
      setFeedback("You must provide a username before bidding!");
      setValid("is-invalid");
      setTimeout(() => {
        openModal(ModalTypes.SIGN_UP);
        setIsSubmitting(false);
        setValid("");
      }, 1000)
      return;
    }
    // Ensure input is a monetary value
    if (!/^\d+(\.\d{1,2})?$/.test(bid)) {
      setFeedback("Please enter a valid monetary amount!");
      setValid("is-invalid");
      setIsSubmitting(false);
      return;
    }
    // Get values needed to place bid
    const amount = parseFloat(bid);
    const status = itemStatus(activeItem);
    // Ensure input is large enough
    if (amount < status.amount + minIncrease) {
      setFeedback("You did not bid enough!");
      setValid("is-invalid");
      setIsSubmitting(false);
      return;
    }
    // Finally, place bid
    updateDoc(doc(db, "auction", "items"), {
      [formatField(activeItem.id, status.bids + 1)]: {
        amount,
        uid: auth.currentUser.uid,
      },
    });
    console.debug("handleSubmidBid() write to auction/items");
    setValid("is-valid");
    delayedClose();
  };

  const handleChange = (e) => {
    setBid(e.target.value);
    setIsSubmitting(false);
    setValid("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleSubmitBid();
    }
  };

  return (
    <Modal type={ModalTypes.ITEM} title={activeItem.title}>
      <div className="modal-body">
        <p>{activeItem.detail}</p>
        <img src={secondaryImageSrc} className="img-fluid" alt={activeItem.title} />
      </div>
      <div className="modal-footer justify-content-start">
        <div className="input-group mb-2">
          <span className="input-group-text">{activeItem.currency}</span>
          <input
            className={`form-control ${valid}`}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleSubmitBid}
            disabled={isSubmitting}
          >
            Submit bid
          </button>
          <div className="invalid-feedback">{feedback}</div>
        </div>
        <label className="form-label">Enter {minBid} or more</label>
        <p className="text-muted">(This is just a demo, you&apos;re not bidding real money)</p>
      </div>
    </Modal>
  );
};

const SessionModal = () => {
  const { closeModal } = useContext(ModalsContext);
  const [auctionId, setAuctionId] = useState("1222");
  const [beginningTime, setBeginningTime] = useState("");
  const [endingTime, setEndingTime] = useState("");
  const [status, setStatus] = useState(Status.PENDING);
  const [startingPrice, setStartingPrice] = useState(0);
  const [userId, setUserId] = useState(localStorage.getItem("username"));
  const [licensePlateId, setLicensePlateId] = useState("");

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

  const compareTime = (b, n, e) => {
    if (n < b) {
      return -1;
    }
    if (e < n) {
      return 1;
    }
    return 0;
  }

  const handleSubmitSession = async (e) => {
    e.preventDefault();

    let nowTime = new Date().getTime();
    const compare = compareTime(beginningTime, nowTime.toString(), endingTime);
    if (compare === 0) {
      setStatus(Status.ACTIVE);
    } else if (compare === 1) {
      setStatus(Status.COMPLETE);
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
      // return;
    } else {
      alert("Tạo thất bại!");
      console.log("Tạo thất bại!");
      // return;
    }
  }

  const handleBeginningTime = (e) => {
    const inputDateTime = e.target.value;
    const formattedDateTime = inputDateTime.replace(' ', 'T');
    setBeginningTime(formattedDateTime);
  }

  const handleEndingTime = (e) => {
    const inputDateTime = e.target.value;
    const formattedDateTime = inputDateTime.replace(' ', 'T');
    setEndingTime(formattedDateTime);
  }

  return (
    <Modal type={ModalTypes.SESSION} title="Create Session">
      <div>
        <form onSubmit={handleSubmitSession}>
          <div>
            <label>Nhập biển số xe</label>
            <div>
              <input type="text" placeholder="XX.XXX or XXXX ..." onChange={(e) => setLicensePlateId(e.target.value)} required />
            </div>
          </div>
          <div>
            <label>Nhập thời điểm bắt đầu đấu giá</label>
            <div>
              <input type="text" placeholder="YYYY-MM-DD HH:mm:ss" onChange={(e) => handleBeginningTime(e)} required />
            </div>
          </div>
          <div>
            <label>Nhập thời điểm kết thúc đấu giá</label>
            <div>
              <input type="text" placeholder="YYYY-MM-DD HH:mm:ss" onChange={(e) => handleEndingTime(e)} required />
            </div>
          </div>
          <div>
            <label>Nhập giá trị ban đầu</label>
            <div>
              <input type="number" placeholder="1000..." onChange={(e) => setStartingPrice(e.target.value)} required />
            </div>
          </div>
          <div className="mb-5">
            <input
              type="submit"
              value="KHỞI TẠO"
            />
          </div>
        </form>
      </div>
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
      // return;
    } else {
      alert("Đăng ký thất bại!");
      console.log("Tạo thất bại!");
      // return;
    }
  }

  return (
    <Modal type={ModalTypes.PLATE} title="Register License Plate">
      <div>
        <h2>Đăng ký biển số xe</h2>
      </div>
      <div>
        <form onSubmit={handleSubmitLP}>
          <div>
            <label>Nhập biển số xe</label>
            <div>
              <input type="text" placeholder="XX.XXX or XXXX ..." onChange={(e) => setLicensePlateId(e.target.value)} required />
            </div>
          </div>
          <div>
            <label>Phương tiện</label>
            <div>
              <select name="meanOfTransport" onChange={(e) => setMeanOfTransport(e.target.value)}>
                <option value="motorbike">Motorbike</option>
                <option value="car">Car</option>
              </select>
            </div>
          </div>
          <div>
            <label>Mã Tỉnh</label>
            <div>
              <input type="text" placeholder="YYYY-MM-DD HH:mm:ss" onChange={(e) => setLicensePlateProvince(e.target.value)} required />
            </div>
          </div>
          <div className="mb-5">
            <input
              type="submit"
              value="ĐĂNG KÝ"
            />
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
          <div>
            <label>Username</label>
            <br />
            <input
              autoFocus
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Full Name</label>
            <br />
            <input
              id="fullName-input"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

          </div>
          <div>
            <label>Phone Number</label>
            <br />
            <input
              id="phone-input"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
            />

          </div>
          <div>
            <label>Email Address</label>
            <br />
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>
          <div>
            <label>Password</label>
            <br />
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

          </div>
          <div>
            <label>Confirm Password</label>
            <br />
            <input
              id="confirmPassword-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

          </div>
          <div>
            <label>Address</label>
            <br />
            <input
              id="address-input"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Identity Number</label>
            <br />
            <input
              id="idn-input"
              type="text"
              value={identityNumber}
              onChange={(e) => setIdentityNumber(e.target.value)}
              required
            />
          </div>
          {error && (
            <div>
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

  const handleSignUp = async (e) => {

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
        <form onSubmit={handleSignUp}>
          <div>
            <label>Username</label>
            <br />
            <input
              autoFocus
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Password</label>
            <br />
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

          </div>

          {error && (
            <div>
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
      alert("Đăng ký tài khoản thành công!");
    } else {
      alert("Đăng ký tài khoản thất bại!");
    }

  };

  return (
    <Modal type={ModalTypes.UPDATE} title="User Information">
      <div className="modal-body">
        <p>Update your information here</p>
        <form onSubmit={handleUpdate}>
          <div>
            <label>Username</label>
            <br />
            <input
              autoFocus
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Full Name</label>
            <br />
            <input
              id="fullName-input"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

          </div>
          <div>
            <label>Phone Number</label>
            <br />
            <input
              id="phone-input"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
            />

          </div>
          <div>
            <label>Email Address</label>
            <br />
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>
          <div>
            <label>Address</label>
            <br />
            <input
              id="address-input"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Identity Number</label>
            <br />
            <input
              id="idn-input"
              type="text"
              value={identityNumber}
              onChange={(e) => setIdentityNumber(e.target.value)}
              required
            />
          </div>
          {error && (
            <div>
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

export { ItemModal, SignUpModal, SessionModal, LicensePlateModal, SignInModal, UpdateModal };
