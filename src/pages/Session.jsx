/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import './Session.css';

function Session() {
  const [auctionId, setAuctionId] = useState(localStorage.getItem("auctionId"));
  const [beginningTime, setBeginningTime] = useState(localStorage.getItem("be_time"));
  const [endingTime, setEndingTime] = useState(localStorage.getItem("en_time"));
  const [status, setStatus] = useState(localStorage.getItem("status"));
  const [startingPrice, setStartingPrice] = useState(localStorage.getItem("startingPrice"));
  const [price, setPrice] = useState(localStorage.getItem("price"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [licensePlateId, setLicensePlateId] = useState(localStorage.getItem("licensePlateId"));
  const priceRef = useRef(null);

  const handleSubmit = async () => {
    if (!checkPrice()) {
      alert("Minimum increase is 100");
      return;
    }

    const newPrice = priceRef.current.value;

    const nowTime = new Date().getTime();
    const bidRequestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "userId": localStorage.getItem("username"),
        "auctionSessionId": auctionId,
        "amount": newPrice,
        "biddingTime": nowTime,
      }),
    };

    const bidResponse = await fetch('http://localhost:8082/bidding', bidRequestOptions);
    if (bidResponse.ok) {
      alert("Bid successful!");
      setPrice(newPrice);
      priceRef.current.value = '';
    } else {
      alert("Bid failed!");
    }
  };

  function checkPrice() {
    const priceValue = priceRef.current.value;
    return priceValue - 100 > startingPrice;
  }

  return (
    <div className="session-container">
      <h1 className="session-title">Auction Session</h1>

      <div className="session-info">
        <label className="session-label">Auction ID: {auctionId}</label>
      </div>

      <div className="session-info">
        <label className="session-label">Beginning Time: {beginningTime}</label>
      </div>

      <div className="session-info">
        <label className="session-label">Ending Time: {endingTime}</label>
      </div>

      <div className="session-info">
        <label className="session-label">Status: {status}</label>
      </div>

      <div className="session-info">
        <label className="session-label">Auctioneer: {userId}</label>
      </div>

      <div className="session-info">
        <label className="session-label">License Plate ID: {licensePlateId}</label>
      </div>

      <div className="session-info">
        <label className="session-label">Starting Price: {startingPrice}</label>
      </div>

      <div className="session-info">
        <label className="session-label">Current Price: {price}</label>
      </div>

      <div className="session-bid">
        <span>Enter your price for bidding:</span>
        <input
          type="number"
          id="price"
          ref={priceRef}
          placeholder="Minimum price increase is 100"
          className="form-control"
        />
        <button onClick={handleSubmit} className="btn btn-primary me-2">Bid</button>
      </div>
    </div>
  );
}

export default Session;
