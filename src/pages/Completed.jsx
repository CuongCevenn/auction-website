import React from 'react';
import { useState, useEffect, useContext } from "react";
import './Dashboard.css';

function CompletedPage() {
    const [sessions, setSessions] = useState([]);
    const [transactions, setTransactions] = useState([]);

    function com(item) {
        return item.status === "COMPLETE";
    }

    function success(item) {
        for (let i = 0; i < transactions.length; i++) {
            if (transactions[i].auctionId === item.auctionId) {
                return true;
            }
        }
        return false;
    }

    function getWinner(item) {
        for (let i = 0; i < transactions.length; i++) {
            if (transactions[i].auctionId === item.auctionId) {
                return transactions[i].winerId;
            }
        }

        return -1;
    }

    function getAmount(item) {
        for (let i = 0; i < transactions.length; i++) {
            if (transactions[i].auctionId === item.auctionId) {
                return transactions[i].amount;
            }
        }


        return -1;
    }

    function getDate(item) {
        for (let i = 0; i < transactions.length; i++) {
            if (transactions[i].auctionId === item.auctionId) {
                return transactions[i].date;
            }
        }


        return -1;
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("http://localhost:8082/auction_session");
                const data = await response.json();
                setSessions(data);

                const transRes = await fetch("http://localhost:8082/transaction");
                const transData = await transRes.json();
                setTransactions(transData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="App">
            <span className="custom-span-1">Completed Auction</span>
            <br />
            <div className="custom-div-1">
                <div>Giao dịch thành công</div>
                {sessions.map((item) => (
                    <div>
                        {(com(item) && success(item)) && (
                            <div key={item.id} className="custom-div-button-1 mb-4">
                                <div className="custom-div-div-1">
                                    <p className="custom-p-1">Auction ID: {item.auctionId}</p>
                                    <p className="custom-p-1">Winner: {getWinner(item)}</p>
                                    <p className="custom-p-1">License plate: {item.licensePlateId}</p>
                                    <p className="custom-p-1">Amount: {getAmount(item)}</p>
                                    <p className="custom-p-1">Date: {getDate(item)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div>Đấu giá thất bại</div>{sessions.map((item) => (
                    <div>
                        {(com(item) && !success(item)) && (
                            <div key={item.id} className="custom-div-button-1 mb-4">
                                <div className="custom-div-div-1">
                                    <p className="custom-p-1">Auction ID: {item.auctionId}</p>
                                    <p className="custom-p-1">Winner: None</p>
                                    <p className="custom-p-1">License plate: {item.licensePlateId}</p>
                                    <p className="custom-p-1">Date: {item.endingTime}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CompletedPage;