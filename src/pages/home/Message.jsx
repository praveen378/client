import React from "react";
import { useSelector } from "react-redux";
import moment from "moment";

const Message = ({ messageDetails }) => {
  const { userProfile } = useSelector((state) => state.userReducer);
  const isSender = userProfile?.profile?._id === messageDetails?.senderId;

  return (
    <div
      className={`px-4 py-2 flex ${isSender ? "justify-end" : "justify-start"}`}
    >
      <div className="max-w-xs sm:max-w-md">
        <div
          className={`flex flex-col ${isSender ? "items-end" : "items-start"}`}
        >
          <div className="text-xs text-gray-400 mb-1">
            {moment(messageDetails.createdAt).calendar()}
          </div>
          <div
            className={`px-4 py-2 rounded-2xl text-white break-words ${
              isSender ? "bg-green-600" : "bg-gray-700"
            }`}
          >
            {messageDetails.message}
          </div>
          {isSender && (
            <div
              className={`text-xs mt-1 ${
                messageDetails.status === "read"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {messageDetails.status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
