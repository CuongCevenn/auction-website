import React, { createContext, useState, useContext } from 'react';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [globalValue, setGlobalValue] = useState(localStorage.getItem("accountType"));

    const updateGlobalValue = (newValue) => {
        setGlobalValue(newValue);
    };

    return (
        <GlobalContext.Provider value={{ globalValue, updateGlobalValue }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobal = () => useContext(GlobalContext);