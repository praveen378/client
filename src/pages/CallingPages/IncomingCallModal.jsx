 import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCallAccepted, setIncomingCall } from "../store/socket/call.slice";
import Peer from "simple-peer";
import { usePeer } from "../../context/PeerContext";
// ✅ Correct way
import SimplePeer from "simple-peer/simplepeer.min.js";

const IncomingCallModal = () => {
  const { peer, setPeer } = usePeer(); // ✅ get peer from context
  const dispatch = useDispatch();
  const { socket } = useSelector((state) => state.socketReducer);
  const incomingCall = useSelector((state) => state.callReducer?.incomingCall);

  // const { userProfile } = useSelector((state) => state.authReducer);

  console.log("Incoming call:", incomingCall);
  if (!incomingCall) return null;

  const handleAccept = async () => {
    console.log("📞 Accepting call...");
    console.log("incomingCall", incomingCall);
    console.log("navigator.mediaDevices", navigator.mediaDevices);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("🎤 Got stream:", stream);
      console.log("🎥 Tracks:", stream.getTracks());

      console.log("📡 Creating SimplePeer...");
      const newPeer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream,
        config: {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        },
      });

      newPeer.on("signal", (signal) => {
        socket.emit("acceptCall", {
          to: incomingCall.from,
          signal,
        });
      });

      newPeer.on("stream", (remoteStream) => {
        console.log("📺 Remote stream received");
        // Optionally store or render this stream
      });

      if (incomingCall?.signal) {
        newPeer.signal(incomingCall.signal);
      }

      setPeer(newPeer); // ✅ context setter
      dispatch(setCallAccepted(true));
      dispatch(setIncomingCall(null));
    } catch (error) {
      console.error("❌ Error getting user media:", error);
      alert("Failed to access camera/mic. Please check permissions.");
    }
    console.log("✅ newPeer created:", newPeer);
  };

 
  const handleReject = () => {
    socket.emit("rejectCall", { to: incomingCall.from });
    dispatch(setIncomingCall(null));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg text-center">
        <h2 className="text-xl font-semibold mb-2">
          {incomingCall.name} is calling you 📞
        </h2>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Accept
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
