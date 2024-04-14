import { Container, Row, Col, Button } from "react-bootstrap";
import React, { useEffect, useState } from 'react';

import './Dashboard.css';

function Dashboard() {

    const [items, setItems] = useState([]);
    const [trans, setTrans] = useState([]);

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
            {/* <Navbar admin={admin} /> */}
            <span className="custom-span-1">Auction Session</span>
            <br />
            <div className="custom-div-1">
                {items.map((item) => (
                    <div key={item.id} className="custom-div-button-1 mb-4">
                        <div className="custom-div-div-1">
                            <p className="custom-p-1">Auction ID: {item.auctionId}</p>
                            <p className="custom-p-1">beginningTime: {item.beginningTime}</p>
                            <p className="custom-p-1">License plate: {item.licensePlateId}</p>
                            <p className="custom-p-1">Status: {item.status}</p>
                        </div>
                        <Button variant="outline-secondary" className="custom-button">View</Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;