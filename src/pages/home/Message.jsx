import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment/moment";

const Message = ({ messageDetails }) => {
  const { userProfile } = useSelector((state) => state.userReducer);

  return (
    <div className="p-3">
      <div
        className={`chat  ${
          userProfile?.profile?._id === messageDetails?.senderId
            ? "chat-end"
            : "chat-start"
        }`}
      >
        {" "}
        <div className="chat-header">
          <time className="text-xs opacity-50">
            {moment(messageDetails.createdAt).calendar()}
          </time>
        </div>
        <div className="chat-bubble">{messageDetails.message} </div>
        <div
          className={`chat-footer opacity-50 ${
            messageDetails.status == "read" ? " text-green-500" : "text-red-400"
          } `}
        >
          {userProfile?.profile?._id === messageDetails?.senderId
            ? messageDetails.status
            : ""}
        </div>
      </div>
    </div>
  );
};

export default Message;
