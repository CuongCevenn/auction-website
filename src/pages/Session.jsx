import React, { useState, useRef } from 'react';

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
            alert("Tăng giá tối thiểu 100");
            return;
        }

        const newPrice = priceRef.current.value;

        let nowTime = new Date().getTime();
        const bidRequestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "userId": localStorage.getItem("username"),
                "auctionSessionId": auctionId,
                "amount": newPrice,
                "biddingTime": nowTime
            })
        };
        const bidResponse = await fetch('http://localhost:8082/bidding', bidRequestOptions);
        if (bidResponse.ok) {
            alert("Đấu giá thành công!");
            setPrice(newPrice);
            priceRef.current.value = '';
        } else {
            alert("Đấu giá thất bại!");
        }
    }

    function checkPrice() {
        const priceValue = priceRef.current.value;
        if ((priceValue - 100 > startingPrice)) {
            return true;
        } else {
            return false;
        }
    }

    return (
        <div>
            <div>
                <h1>Auction Session</h1>
            </div>

            <div>
                <label>Auction ID: {auctionId}</label>
            </div>
            <div>
                <label>Beginning Time: {beginningTime}</label>
            </div>
            <div>
                <label>Ending Time: {endingTime}</label>
            </div>
            <div>
                <label>Status: {status}</label>
            </div>
            <div>
                <label>Auctioneer: {userId}</label>
            </div>
            <div>
                <label>License Plate Id: {licensePlateId}</label>
            </div>
            <div>
                <label>Starting Price: {startingPrice}</label>
            </div>
            <div>
                <label>Current Price: {price}</label>
                <br />
                <br />
                <br />
                <span>Enter your price for bidding:</span>
                <div>
                    <input type='number' id='price' ref={priceRef} placeholder="Minimum price increase 100" className="form-control" />
                    <button onClick={() => handleSubmit()} className="btn btn-primary me-2">Bid</button>
                </div>
            </div>


        </div>
    );
}

export default Session;