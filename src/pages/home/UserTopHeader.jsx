import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../store/user/user.slice";
import {
  isCallerSelector,
  setCalleeId,
  setCalling,
} from "../store/socket/call.slice";
import { usePeer } from "../../context/PeerContext";

const UserTopHeader = ({ userDetails }) => {
  const dispatch = useDispatch();
  const isCaller = useSelector(isCallerSelector);
  const { selectedUser } = useSelector((state) => state.userReducer);
  const { peer, setPeer } = usePeer();
  const { onlineUsers } = useSelector((state) => state.socketReducer);

  const isActive = selectedUser?._id === userDetails?._id;

  const handleUserClick = () => {
    dispatch(setSelectedUser(userDetails));
  };

  const handleCallUser = async () => {
    dispatch(setCalleeId(userDetails._id));
    dispatch(setCalling(true));
  };

  return (
    <div
      onClick={handleUserClick}
      className={`flex flex-col sm:flex-row justify-between items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer transition-colors duration-200 ${
        isActive ? "bg-gray-700" : "hover:bg-gray-600"
      }`}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative shrink-0">
          <img
            src={userDetails?.avatar}
            alt="avatar"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
          />
          {onlineUsers?.includes(userDetails?._id) && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
          )}
        </div>

        <div className="flex flex-col overflow-hidden w-full">
          <span className="text-white font-semibold truncate">
            {userDetails?.username}
          </span>
          <span className="text-sm text-gray-400 truncate">
            {userDetails?.fullName}
          </span>
        </div>
      </div>

      <button
        onClick={handleCallUser}
        className="text-white bg-green-500 px-4 py-1.5 rounded hover:bg-green-600 w-full sm:w-auto"
      >
        📞 Call
      </button>
    </div>
  );
};

export default UserTopHeader;
