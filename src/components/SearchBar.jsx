import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Xử lý thay đổi của input
    const handleChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Xử lý khi nhấn nút tìm kiếm
    const handleSubmit = (event) => {
        event.preventDefault();
        // Gọi hàm tìm kiếm được truyền từ component cha và truyền cho nó giá trị của searchTerm
        onSearch(searchTerm);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Nhập từ khóa tìm kiếm"
                value={searchTerm}
                onChange={handleChange}
            />
            <button type="submit">Tìm kiếm</button>
        </form>
    );
};

export default SearchBar;
