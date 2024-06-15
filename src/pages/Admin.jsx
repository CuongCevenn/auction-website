import { Button } from "react-bootstrap";
import React from 'react';
import { useNavigate } from "react-router";
import { useState, useEffect, useContext } from "react";
import { ModalsContext } from "../contexts/ModalsProvider";
import { ModalTypes } from "../utils/modalTypes";
import './Dashboard.css';

function AdminPage() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const openModal = useContext(ModalsContext).openModal;

  function checkUser(userId) {
    const username = localStorage.getItem("username");
    return username === userId;
  }

  function signIn() {
    if (localStorage.getItem("username")) {
      return true;
    } else {
      return false;
    }
  }

  function pen(item) {
    return item.status === "PENDING";
  }

  function act(item) {
    return item.status === "ACTIVE";
  }

  function com(item) {
    return item.status === "COMPLETE";
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:8082/auction_session");
        const data = await response.json();
        console.log(data);
        setItems(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  const handleSetStatus = async (item) => {
    try {
      let auctionId = item.auctionId;
      let beginningTime = item.beginningTime;
      let endingTime = item.endingTime;
      let status = item.status;
      let startingPrice = item.startingPrice;
      let userId = item.userId;
      let licensePlateId = item.licensePlateId;

      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "auctionId": auctionId,
          "beginningTime": beginningTime,
          "endingTime": endingTime,
          "status": "ACTIVE",
          "startingPrice": startingPrice,
          "userId": userId,
          "licensePlateId": licensePlateId
        })
      };
      const response = await fetch(`http://localhost:8082/auction_session/${auctionId}`, requestOptions);

      if (response.ok) {
        alert("Xác nhận thành công");
        window.location.reload();
      } else {
        alert("Xác nhận thất bại!");
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const handleDenyStatus = async (item) => {
    try {
      let auctionId = item.auctionId;
      let beginningTime = item.beginningTime;
      let endingTime = item.endingTime;
      let status = item.status;
      let startingPrice = item.startingPrice;
      let userId = item.userId;
      let licensePlateId = item.licensePlateId;

      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "auctionId": auctionId,
          "beginningTime": beginningTime,
          "endingTime": endingTime,
          "status": "PENDING",
          "startingPrice": startingPrice,
          "userId": userId,
          "licensePlateId": licensePlateId
        })
      };
      const response = await fetch(`http://localhost:8082/auction_session/${auctionId}`, requestOptions);

      if (response.ok) {
        alert("Hủy xác nhận thành công");
        window.location.reload();
      } else {
        alert("Hủy xác nhận thất bại!");
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const handleDelete = async (item) => {
    try {
      let auctionId = item.auctionId;

      const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      };
      const response = await fetch(`http://localhost:8082/auction_session/${auctionId}`, requestOptions);

      if (response.ok) {
        alert("Xóa phiên đấu giá thành công");
        window.location.reload();
      } else {
        alert("Xóa phiên đấu giá thất bại!");
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const handleSession = () => {
    openModal(ModalTypes.SESSION);
  }

  const handleCompleted = () => {
    navigate(import.meta.env.BASE_URL + "completed");
  }

  return (
    <div className="dashboard-container">
      <span className="custom-span-1">Auction Session</span>
      <br />
      {signIn() && (
        <div>
          <Button
            className="create-session-button"
            style={{ marginRight: '20px' }}
            onClick={handleSession}
          >
            Create Session
          </Button>
          <Button
            className="create-session-button"
            onClick={handleCompleted}
          >
            Completed Session
          </Button>
        </div>

      )}
      <div className="custom-div-1">
        {items.map((item) => (
          // eslint-disable-next-line react/jsx-key
          <div>
            {!com(item) && (
              <div key={item.id} className="custom-div-button-1">
                <div className="custom-div-div-1">
                  <p className="custom-p-1">Auction ID: {item.auctionId}</p>
                  <p className="custom-p-1">Beginning Time: {item.beginningTime}</p>
                  <p className="custom-p-1">License plate: {item.licensePlateId}</p>
                  <p className="custom-p-1">Status: {item.status}</p>
                </div>

                <div>
                  <Button
                    variant="primary"
                    className="custom-button-normal"
                    onClick={() => handleSetStatus(item)}
                    disabled={!pen(item)}
                  >Accept</Button>
                  <Button
                    variant="secondary"
                    className="custom-button-delete"
                    onClick={() => handleDenyStatus(item)}
                    disabled={!act(item)}
                  >Deny</Button>
                </div>

                <Button
                  variant="danger"
                  className="custom-button-delete"
                  onClick={() => handleDelete(item)}
                >Delete</Button>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPage;
