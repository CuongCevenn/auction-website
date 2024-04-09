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
  const [userId, setUserId] = useState("admin");
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
    if (n > e) {
      return 1;
    }
    return 0;
  }

  const handleSubmitSession = async (e) => {
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
    // closeModal();
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
        <h2>Create Modal</h2>
      </div>
      <div>
        <form onSubmit={handleSubmitSession}>
          <div>
            <label>Nhập biển số xe</label>
            <div>
              <input type="text" placeholder="XX.XXX or XXXX ..." onChange={(e) => setLicensePlateId(e.target.value)} />
            </div>
          </div>
          <div>
            <label>Nhập thời điểm bắt đầu đấu giá</label>
            <div>
              <input type="text" placeholder="YYYY-MM-DD HH:mm:ss" onChange={(e) => handleBeginningTime(e)} />
            </div>
          </div>
          <div>
            <label>Nhập thời điểm kết thúc đấu giá</label>
            <div>
              <input type="text" placeholder="YYYY-MM-DD HH:mm:ss" onChange={(e) => handleEndingTime(e)} />
            </div>
          </div>
          <div>
            <label>Nhập giá trị ban đầu</label>
            <div>
              <input type="number" placeholder="1000..." onChange={(e) => setStartingPrice(e.target.value)} />
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

const SignUpModal = () => {
  const { closeModal } = useContext(ModalsContext);
  const [fullName, setFullName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [citizenId, setCitizenId] = useState("");
  const [valid, setValid] = useState("");

  const handleSignUp = () => {
    // Perform signup logic here
    // For brevity, I'm omitting the actual signup logic
    console.debug("Perform signup logic here");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSignUp();
    }
  };

  return (
    <Modal type={ModalTypes.SIGN_UP} title="Sign up for Auction">
      <div className="modal-body">
        <p>Please fill in the following information to sign up:</p>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-floating mb-3">
            <input
              autoFocus
              id="fullName-input"
              type="text"
              className={`form-control ${valid}`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <label htmlFor="fullName-input">Full Name</label>
          </div>
          <div className="form-floating mb-3">
            <input
              id="birthdate-input"
              type="date"
              className={`form-control ${valid}`}
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
            <label htmlFor="birthdate-input">Date of Birth</label>
          </div>
          <div className="form-floating mb-3">
            <input
              id="phone-input"
              type="tel"
              className={`form-control ${valid}`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <label htmlFor="phone-input">Phone Number</label>
          </div>
          <div className="form-floating mb-3">
            <input
              id="email-input"
              type="email"
              className={`form-control ${valid}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="email-input">Email Address</label>
          </div>
          <div className="form-floating mb-3">
            <input
              id="password-input"
              type="password"
              className={`form-control ${valid}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="password-input">Password</label>
          </div>
          <div className="form-floating mb-3">
            <input
              id="confirmPassword-input"
              type="password"
              className={`form-control ${valid}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label htmlFor="confirmPassword-input">Confirm Password</label>
          </div>
          <div className="form-floating mb-3">
            <input
              id="citizenId-input"
              type="text"
              className={`form-control ${valid}`}
              value={citizenId}
              onChange={(e) => setCitizenId(e.target.value)}
            />
            <label htmlFor="citizenId-input">Citizen ID</label>
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={closeModal}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          onClick={handleSignUp}
        >
          Sign up
        </button>
      </div>
    </Modal>
  );
};

export { ItemModal, SignUpModal, SessionModal };
