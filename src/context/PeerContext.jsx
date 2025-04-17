import React, { createContext, useContext, useEffect, useState } from "react";
import SimplePeer from "simple-peer";

const PeerContext = createContext();

export const PeerProvider = ({ children }) => {
  const [peer, setPeer] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const cleanup = () => {
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  return (
    <PeerContext.Provider value={{ 
      peer, 
      setPeer, 
      localStream, 
      setLocalStream, 
      remoteStream, 
      setRemoteStream,
      cleanup
    }}>
      {children}
    </PeerContext.Provider>
  );
};

export const usePeer = () => useContext(PeerContext);