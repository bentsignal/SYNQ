import React, { createContext, useContext, useState } from 'react'

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [homeState, setHomeState] = useState(0);
  return (
    <GlobalContext.Provider
      value={{
        homeState,
        setHomeState
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider