import React, { useState, useEffect, useContext } from 'react';
import { Button } from "react-bootstrap";
import { ModalsContext } from "../contexts/ModalsProvider";
import { ModalTypes } from "../utils/modalTypes";
import './Dashboard.css';

function UserManage() {
    const [items, setItems] = useState([]);
    const openModal = useContext(ModalsContext).openModal;

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("http://localhost:8082/user");
                const data = await response.json();
                console.log(data);
                setItems(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, []);

    const handleViewButton = async (item) => {
        localStorage.setItem("tempUsername", item.username);
        localStorage.setItem("tempAccountType", item.accountType);
        localStorage.setItem("tempFullName", item.fullname);
        localStorage.setItem("tempContactNumber", item.contactNumber);
        localStorage.setItem("tempAddress", item.address);
        localStorage.setItem("tempIdentityNumber", item.identityNumber);
        localStorage.setItem("tempEmail", item.email);
        localStorage.setItem("tempPassword", item.password);

        openModal(ModalTypes.VIEW_USER);
    }

    const handlePassword = async (item) => {
        try {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "username": item.username,
                    "password": 12345,
                    "accountType": item.accountType,
                    "fullname": item.fullname,
                    "contactNumber": item.contactNumber,
                    "address": item.address,
                    "identityNumber": item.identityNumber,
                    "email": item.email
                })
            };

            const response = await fetch(`http://localhost:8082/user/${item.username}`, requestOptions);
            if (response.ok) {
                alert("Đặt lại mật khẩu thành công!");
            } else {
                alert("Đặt lại mật khẩu thất bại!");
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const handleDelete = async (item) => {
        try {
            const requestOptions = {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "username": item.username,
                    "password": 12345,
                    "accountType": item.accountType,
                    "fullname": item.fullname,
                    "contactNumber": item.contactNumber,
                    "address": item.address,
                    "identityNumber": item.identityNumber,
                    "email": item.email
                })
            };

            const response = await fetch(`http://localhost:8082/user/${item.username}`, requestOptions);
            if (response.ok) {
                alert("Xóa tài khoản thành công!");
            } else {
                alert("Xóa tài khoản thất bại!");
            }
            window.location.reload();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    return (
        <div>
            <div className="App">
                <span className="custom-span-1">User Management</span>
                <br />
                <div className="custom-div-1">
                    {items.map((item) => (
                        <div>
                            {(item.accountType === "user") && (
                                <div key={item.id} className="custom-div-button-1 mb-4">
                                    <div className="custom-div-div-1">
                                        <p className="custom-p-1">Username: {item.username}</p>
                                        <p className="custom-p-1">Full Name: {item.fullname}</p>
                                        <p className="custom-p-1">Contact: {item.contactNumber}</p>
                                    </div>

                                    <Button
                                        variant="outline-secondary"
                                        className="custom-button"
                                        onClick={() => handleViewButton(item)}
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
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UserManage;