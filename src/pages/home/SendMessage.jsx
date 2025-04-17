import React, { useState } from "react";
import { LuSendHorizontal } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import {
  getMessageThunk,
  sendMessageThunk,
} from "../store/message/message.thunk";

const SendMessage = () => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const { selectedUser } = useSelector((state) => state.userReducer);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    await dispatch(
      sendMessageThunk({
        recieverId: selectedUser?._id,
        message: message,
      })
    );

    setMessage(""); // clear input
    dispatch(getMessageThunk({ otherParticipantId: selectedUser?._id }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-3 bg-gray-800 w-full border-t border-gray-700">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSendMessage}
          className="flex items-center gap-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all"
        >
          <LuSendHorizontal size={18} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
};

export default SendMessage;
