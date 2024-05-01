import React, { useState, useEffect, useContext } from 'react';
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { ModalsContext } from "../contexts/ModalsProvider";
import { ModalTypes } from "../utils/modalTypes";
import './Dashboard.css';
import { useGlobal } from "../contexts/GlobalContext";
import SearchBar from "../components/SearchBar";

function Dashboard() {
    const { globalValue } = useGlobal();
    const [items, setItems] = useState([]);
    const [searchItem, setSearchItem] = useState("");
    const navigate = useNavigate();
    const openModal = useContext(ModalsContext).openModal;

    // Một số hàm để kiểm tra và tìm kiếm
    function checkUser(userId) {
        const username = localStorage.getItem("username");
        return username === userId;
    }

    function signIn() {
        return !!localStorage.getItem("username");
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

    function search(searchItem, LPId) {
        if (searchItem !== "") {
            return LPId.includes(searchItem);
        }
        return true;
    }

    function ready(timeString) {
        const inputTime = new Date(timeString);
        const currentTime = Date.now();

        if (inputTime.getTime() > currentTime) {
            return true;
        } else {
            return false;
        }
    }

    // Hàm xử lý khi người dùng nhấn vào nút "View"
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
            } catch (e) {
                console.error('Error fetching latest bidding:', e);
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
            console.error('Error fetching auction data:', error);
        }
    };

    // Hàm xử lý khi người dùng nhấn vào nút "Delete"
    const handleDelete = async (item) => {
        try {
            const response = await fetch(`http://localhost:8082/auction_session/${item.auctionId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                alert("Xóa phiên đấu giá thành công");
                window.location.reload();
            } else {
                alert("Xóa phiên đấu giá thất bại!");
            }
        } catch (error) {
            console.error('Error deleting auction:', error);
        }
    };

    // Hàm mở phiên đấu giá
    const handleOpen = () => {
        navigate(import.meta.env.BASE_URL + "session");
    };

    // Hàm mở modal tạo phiên đấu giá
    const handleSession = () => {
        openModal(ModalTypes.SESSION);
    };

    // Hàm xử lý tìm kiếm
    const handleSearch = (searchTerm) => {
        setSearchItem(searchTerm);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:8082/auction_session");
                const data = await response.json();
                console.log(data);
                setItems(data);
            } catch (error) {
                console.error('Error fetching auction sessions:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="dashboard-container">
            <div className="header">
                <span className="custom-span-1">Auction Session</span>
            </div>
            <div className="searchbar-wrapper">
                <SearchBar onSearch={handleSearch} />
            </div>

            {localStorage.getItem("username") && (
                <Button
                    className="create-session-button"
                    onClick={handleSession}
                >
                    Create Session
                </Button>
            )}

            <div className="custom-div-1">
                {items.map((item) => (
                    <div>
                        {((act(item) || checkUser(item.userId)) && !com(item) && search(searchItem, item.licensePlateId)) && (
                            <div key={item.id} className="custom-div-button-1">
                                <div className="custom-div-div-1">
                                    <p className="custom-p-1">Auction ID: {item.auctionId}</p>
                                    <p className="custom-p-1">Beginning Time: {item.beginningTime}</p>
                                    <p className="custom-p-1">License plate: {item.licensePlateId}</p>
                                    <p className="custom-p-1">Status: {item.status}</p>
                                </div>

                                {signIn() && (
                                    <div>
                                        <Button
                                            variant="outline-secondary"
                                            className="custom-button"
                                            onClick={() => handleViewClick(item.auctionId)}
                                            disabled={!act(item) || ready(item.beginningTime)}
                                        >
                                            View
                                        </Button>

                                        {checkUser(item.userId) && (
                                            <Button
                                                variant="danger"
                                                className="custom-button-delete"
                                                onClick={() => handleDelete(item)}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </div>
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
