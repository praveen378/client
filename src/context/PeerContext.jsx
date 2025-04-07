import React, { createContext, useContext, useState } from "react";

const PeerContext = createContext();

export const PeerProvider = ({ children }) => {
  const [peer, setPeer] = useState(null);

  return (
    <PeerContext.Provider value={{ peer, setPeer }}>
      {children}
    </PeerContext.Provider>
  );
};

export const usePeer = () => useContext(PeerContext);
