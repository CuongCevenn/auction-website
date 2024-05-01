import React, { useState, useEffect } from "react";
import './CompletedPage.css';

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
        <div className="completed-container">
            {/* Phần tiêu đề */}
            <div className="header">
                <span className="custom-span-1">Completed Auctions</span>
            </div>

            {/* Bố cục hai cột */}
            <div className="custom-two-columns">
                {/* Cột Giao dịch thành công */}
                <div className="custom-column">
                    <div className="custom-column-title">Successful Transactions</div> {/* Tiêu đề của cột */}
                    {sessions
                        .filter((item) => item.status === "COMPLETE")
                        .filter((item) => transactions.some((t) => t.auctionId === item.auctionId))
                        .map((item) => (
                            <div key={item.id} className="custom-div-button-1 mb-4">
                                <div className="custom-div-div-1">
                                    <p className="custom-p-1">Auction ID: {item.auctionId}</p>
                                    <p className="custom-p-1">Winner: {getWinner(item)}</p>
                                    <p className="custom-p-1">License plate: {item.licensePlateId}</p>
                                    <p className="custom-p-1">Amount: {getAmount(item)}</p>
                                    <p className="custom-p-1">Date: {getDate(item)}</p>
                                </div>
                            </div>
                        ))}
                </div>

                {/* Cột Đấu giá thất bại */}
                <div className="custom-column">
                    <div className="custom-column-title">Failed Transactions</div> {/* Tiêu đề của cột */}
                    {sessions
                        .filter((item) => item.status === "COMPLETE")
                        .filter((item) => !transactions.some((t) => t.auctionId === item.auctionId))
                        .map((item) => (
                            <div key={item.id} className="custom-div-button-1 mb-4">
                                <div className="custom-div-div-1">
                                    <p className="custom-p-1">Auction ID: {item.auctionId}</p>
                                    <p className="custom-p-1">License plate: {item.licensePlateId}</p>
                                    <p className="custom-p-1">Date: {item.endingTime}</p>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

export default CompletedPage;
