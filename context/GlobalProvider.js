import React, { createContext, useContext, useState } from 'react'

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [homeState, setHomeState] = useState(0);
  const [fileResults, setFileResults] = useState([]);
  const [importDisabled, setImportDisabled] = useState(true);
  return (
    <GlobalContext.Provider
      value={{
        homeState,
        setHomeState,
        fileResults,
        setFileResults,
        importDisabled,
        setImportDisabled
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider