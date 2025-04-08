 import React from "react";
import SimplePeer from "simple-peer/simplepeer.min.js";
import { useDispatch, useSelector } from "react-redux";
import { setCallAccepted, setIncomingCall } from "../store/socket/call.slice";
import { usePeer } from "../../context/PeerContext";

const IncomingCallModal = ({ socket, remoteVideoRef, localVideoRef }) => {
  const dispatch = useDispatch();
  const { incomingCall } = useSelector((state) => state.callReducer);
  const { setPeer } = usePeer();

  const handleAccept = async () => {
    try {
      console.log("📞 Accepting call...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const newPeer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
          ],
        },
      });

      newPeer.on("signal", (signal) => {
        console.log("📡 Sending answer signal...");
        socket.emit("acceptCall", {
          to: incomingCall.from,
          signal,
        });
      });

      newPeer.on("stream", (remoteStream) => {
        console.log("📺 Remote stream received");
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      if (incomingCall?.signal) {
        newPeer.signal(incomingCall.signal);
      }

      setPeer(newPeer); // ✅ Save peer globally
      dispatch(setCallAccepted(true));
      dispatch(setIncomingCall(null));
    } catch (error) {
      console.error("❌ Error getting user media:", error);
      alert("Failed to access camera/mic. Please check permissions.");
    }
  };

  return (
    // your modal JSX
    <div>
      <button onClick={handleAccept}>Accept</button>
    </div>
  );
};

export default IncomingCallModal;
