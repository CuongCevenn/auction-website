import { Button } from "react-bootstrap";
import React from 'react';
import { useNavigate } from "react-router";
import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { ModalsContext } from "../contexts/ModalsProvider";
import { ModalTypes } from "../utils/modalTypes";
import './Dashboard.css';
import { useGlobal } from "../contexts/GlobalContext";
import SearchBar from "../components/SearchBar"

function Dashboard() {
    const { globalValue } = useGlobal();
    const [items, setItems] = useState([]);
    const [searchItem, setSearchItem] = useState("");
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

    function search(searchItem, LPId) {
        if (searchItem !== "") {
            return searchItem === LPId;
        }
        return true;
    }

    const handleViewClick = async (auctionId) => {
        localStorage.setItem("auctionId", auctionId);
        try {
            const response = await fetch(`http://localhost:8082/auction_session/${auctionId}`);
            const data = await response.json();
            let price = data.startingPrice;
            try {
                const response2 = await fetch(`http://localhost:8082/bidding/${auctionId}/latest`);
                const data2 = await response2.json();
                price = data2.amount;
            } catch (e2) {
                console.log(price);
            }
            localStorage.setItem("be_time", data.beginningTime);
            localStorage.setItem("en_time", data.endingTime);
            localStorage.setItem("status", data.status);
            localStorage.setItem("startingPrice", data.startingPrice);
            localStorage.setItem("price", price);
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("licensePlateId", data.licensePlateId);
            handleOpen();
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

    const handleSearch = (searchTerm) => {
        console.log("search", searchTerm);
        setSearchItem(searchTerm);
    }

    const handleOpen = () => {
        navigate(import.meta.env.BASE_URL + "session");
    }

    const handleSession = () => {
        openModal(ModalTypes.SESSION);
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

    return (
        <div className="App">
            <SearchBar onSearch={handleSearch} />
            <span className="custom-span-1">Auction Session</span>
            <br />
            {signIn() && (
                <button onClick={handleSession} className="btn btn-primary me-2" >Create Session</button>
            )}
            <div className="custom-div-1">
                {items.map((item) => (
                    <div>
                        {(search(searchItem, item.licensePlateId) && (act(item) || item.userId === localStorage.getItem("username"))) && (
                            <div key={item.id} className="custom-div-button-1 mb-4">
                                <div className="custom-div-div-1">
                                    <p className="custom-p-1">Auction ID: {item.auctionId}</p>
                                    <p className="custom-p-1">beginningTime: {item.beginningTime}</p>
                                    <p className="custom-p-1">License plate: {item.licensePlateId}</p>
                                    <p className="custom-p-1">Status: {item.status}</p>
                                </div>
                                {signIn() && (
                                    <Button
                                        variant="outline-secondary"
                                        className="custom-button"
                                        onClick={() => handleViewClick(item.auctionId)}
                                        disabled={pen(item)}
                                    >View</Button>
                                )}

                                {checkUser(item.userId) && (
                                    <Button
                                        variant="danger"
                                        className="custom-button"
                                        onClick={() => handleDelete(item)}
                                    >Delete</Button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;