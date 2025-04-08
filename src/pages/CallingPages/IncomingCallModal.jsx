 // IncomingCallModal.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCallAccepted } from "../store/socket/call.slice";
import { useNavigate } from "react-router-dom";

const IncomingCallModal = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector((state) => state.socketReducer);
  const incomingCall = useSelector((state) => state.callReducer?.incomingCall);
  const navigate = useNavigate();

  if (!incomingCall) return null;

  const handleAccept = () => {
    dispatch(setCallAccepted(true));
    navigate("/call", { replace: true });
  };

  const handleReject = () => {
    socket.emit("rejectCall", { to: incomingCall.from });
    dispatch(setCallAccepted(false));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl text-center">
        <h2 className="text-2xl font-semibold mb-4">
          {incomingCall.name} is calling you 📞
        </h2>
        <div className="flex justify-center gap-6">
          <button
            onClick={handleAccept}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Accept
          </button>
          <button
            onClick={handleReject}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
