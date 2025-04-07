import React, { useEffect, useState } from "react";
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
    if (message.trim() === "") return; // Prevent sending empty messages

    await dispatch(
      sendMessageThunk({
        recieverId: selectedUser?._id, // Ensure the key name matches your API expectation
        message: message,
      })
    );
    setMessage(""); // Clear input field

    // Fetch messages again to update the chat
    dispatch(getMessageThunk({ otherParticipantId: selectedUser?._id }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // useEffect(() => {
  //   dispatch(getMessageThunk({ otherParticipantId: selectedUser?._id }));
  // }, [handleSendMessage]);
  return (
    <>
      {" "}
      <div className="p-3 flex flex-row gap-3">
        <input
          type="text"
          placeholder="Primary"
          className="input input-primary w-full"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown} // Handle Enter key press
        />
        <button
          className="btn btn-soft btn-primary"
          onClick={handleSendMessage}
        >
          <LuSendHorizontal />
          Send
        </button>
      </div>
    </>
  );
};

export default SendMessage;
