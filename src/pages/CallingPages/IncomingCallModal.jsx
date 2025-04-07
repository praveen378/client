import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCallAccepted, setIncomingCall } from "../store/socket/call.slice";
import Peer from "simple-peer";
import { usePeer } from "../../context/PeerContext";
const IncomingCallModal = () => {
  const { peer, setPeer } = usePeer(); // ✅ get peer from context
  const dispatch = useDispatch();
  const { socket } = useSelector((state) => state.socketReducer);
  const { incomingCall } = useSelector((state) => state.callSlice);
  const { userProfile } = useSelector((state) => state.authReducer);

  if (!incomingCall) return null;

  const handleAccept = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        const newPeer = new Peer({
          initiator: false,
          trickle: false,
          stream: stream,
        });

        newPeer.on("signal", (signal) => {
          socket.emit("acceptCall", {
            to: incomingCall.from,
            signal,
          });
        });

        newPeer.on("stream", (remoteStream) => {
          // ✅ Send remoteStream to video component (set it in context or global state)
        });

        newPeer.signal(incomingCall.signal);
        dispatch(setPeer(newPeer));
        dispatch(setCallAccepted(true));
        dispatch(setIncomingCall(null));
      });
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
