import React, { useState } from 'react';
import './SearchBar.css'; // Đảm bảo rằng bạn đã nhập CSS mới

const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Xử lý thay đổi của input
    const handleChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Xử lý khi nhấn nút tìm kiếm
    const handleSubmit = (event) => {
        event.preventDefault();
        onSearch(searchTerm); // Gọi hàm tìm kiếm với giá trị của searchTerm
    };

    return (
        <form onSubmit={handleSubmit} className="searchbar-form">
            <input
                type="text"
                className="searchbar-input"
                placeholder="Nhập từ khóa tìm kiếm..."
                value={searchTerm}
                onChange={handleChange}
            />
            <button type="submit" className="searchbar-button">Tìm kiếm</button>
        </form>
    );
};

export default SearchBar;
