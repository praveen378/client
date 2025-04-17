import React, { useEffect, useState } from "react";
import { setSelectedUser } from "../store/user/user.slice";
import { useDispatch, useSelector } from "react-redux";
import { BiNotification } from "react-icons/bi";

const User = ({ userDetails }) => {
  const { onlineUsers, notificationIds, senderId } = useSelector(
    (state) => state.socketReducer
  );

  const { selectedUser } = useSelector((state) => state.userReducer);

  const dispatch = useDispatch();

  const handleUserClick = () => {
    dispatch(setSelectedUser(userDetails));
  };

  return (
    <div
      onClick={handleUserClick}
      className={`flex  justify-between gap-3 p-2 m-3 hover:bg-gray-600 cursor-pointer rounded-sm  ${
        userDetails?._id === selectedUser?._id && "bg-gray-600"
      } `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`avatar ${
            onlineUsers?.includes(userDetails?._id) ? "avatar-online" : ""
          }  `}
        >
          <div className="w-12 rounded-full">
            <img src={userDetails?.avatar} />
          </div>
        </div>

        <div>
          <h1 className="text-md line-clamp-1">{userDetails?.username}</h1>
          <p className="text-gray-500 line-clamp-1">{userDetails?.fullName} </p>
        </div>
      </div>
      <span className="self-end text-2xl">
        {(() => {
          const notification = notificationIds.find(
            (item) => item.senderId === userDetails?._id
          );

          return notification ? (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <BiNotification />
              <span className="text-green-400 text-1xl">{notification.unreadCount}</span>
            </div>
          ) : null;
        })()}
      </span>
    </div>
  );
};

export default User;
