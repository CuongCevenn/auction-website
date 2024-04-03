import { Container, Row, Col, Button } from "react-bootstrap";
import React, { useEffect, useState } from 'react';
// import firebase from 'firebase/app';
import { db } from '../firebase/config'
import { collection, getDocs } from 'firebase/firestore';
import './Dashboard.css';

async function fetchDataFromFirestore() {
    const querySnapshot = await getDocs(collection(db, "auction-session"));

    const data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
    });
    return data;
}

async function fetchDataTransactionFromFirestore() {
    const querySnapshot = await getDocs(collection(db, "transaction"));

    const data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
    });
    return data;
}

function Dashboard() {
    // const { admin } = AutoSignIn();

    const [items, setItems] = useState([]);
    const [trans, setTrans] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const data = await fetchDataFromFirestore();
            const tran = await fetchDataTransactionFromFirestore();
            setItems(data);
            setTrans(tran);
        }
        fetchData();
    }, []);

    return (
        <Container fluid className="App">
            {/* <Navbar admin={admin} /> */}
            <Row className="custom-row">
                <Col className="custom-col-1">
                    <span className="custom-span-1">Auction Session</span>
                    <br />
                    <div className="custom-div-1">
                        {items.map((item) => (
                            <div key={item.id} className="custom-div-button-1 mb-4">
                                <div className="custom-div-div-1">
                                    <p className="custom-p-1">Auction ID: {item.auction_id}</p>
                                    <p className="custom-p-1">Owner: {item.owner}</p>
                                    <p className="custom-p-1">License plate: {item.license_plate_id}</p>
                                    <p className="custom-p-1">Status: {item.status}</p>
                                </div>
                                <Button variant="outline-secondary" className="custom-button">View</Button>
                                {/* onClick={() => setModalOpen(true)} */}
                            </div>
                        ))}
                    </div>
                </Col>
                <Col className="custom-col-2" xs={5}>
                    <span className="custom-span-1">Transaction</span>
                    <br />
                    <div className="custom-div-1">
                        {trans.map((item) => (
                            <div key={item.id} className="custom-div-button-2 mb-4">
                                <div className="custom-div-div-1">
                                    <p className="custom-p-1">Auction ID: {item.auction_id}</p>
                                    <p className="custom-p-1">Seller: {item.seller}</p>
                                    <p className="custom-p-1">Winning bidder: {item.winning_bidder}</p>
                                    <p className="custom-p-1">Amount: ${item.amount}</p>
                                </div>
                                <Button variant="primary" className="custom-button">View</Button>
                                {/* onClick={() => setModalOpen(true)} */}
                            </div>
                        ))}
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default Dashboard;