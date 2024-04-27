import React, { useState, useEffect, useContext } from 'react';
import { Button } from "react-bootstrap";
import { ModalsContext } from "../contexts/ModalsProvider";
import { ModalTypes } from "../utils/modalTypes";
import './UserManage.css';

function UserManage() {
    const [items, setItems] = useState([]);
    const openModal = useContext(ModalsContext).openModal;

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("http://localhost:8082/user");
                const data = await response.json();
                setItems(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="user-manage-container">
            <span className="custom-span-1">User Management</span>
            <br />
            <div className="custom-div-1">
                {items.map((item) => (
                    <div key={item.username} className="custom-div-button-1">
                        <div className="custom-div-div-1">
                            <p className="custom-p-1">Username: {item.username}</p>
                            <p className="custom-p-1">Full Name: {item.fullname}</p>
                            <p className="custom-p-1">Contact: {item.contactNumber}</p>
                        </div>
                        <Button
                            variant="outline-secondary"
                            className="custom-button"
                            onClick={() => openModal(ModalTypes.VIEW_USER)}
                        >View</Button>
                        <Button
                            variant="outline-secondary"
                            className="custom-button"
                            onClick={() => handlePassword(item)}
                        >Reset</Button>
                        <Button
                            variant="danger"
                            className="custom-button"
                            onClick={() => handleDelete(item)}
                        >Delete</Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserManage;
