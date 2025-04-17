import React, { useEffect, useRef, useState } from "react";
import MessageConatainer from "./MessageConatiner";
import Sidebar from "./Siedbar";
import Peer from "peerjs";
import { usePeer } from "../../context/PeerContext";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeSocket,
  notificatonTrue,
  setOnlineUsers,
} from "../store/socket/socket.slice";
import { setNewMessage } from "../store/message/message.slice";
import { getUnreadMessagesIds } from "../store/user/user.thunk";
import IncomingCallModal from "../CallingPages/IncomingCallModal";
import VideoCallScreen from "../CallingPages/VideoCallScreen";
import { setIncomingCall } from "../store/socket/call.slice";
import { MdHomeFilled } from "react-icons/md";
import { setSelectedUser } from "../store/user/user.slice";
import { getMessageThunk } from "../store/message/message.thunk";
const Home = () => {
  const dispatch = useDispatch();
  const { receivingCall, callAccepted, calling } = useSelector(
    (state) => state.callReducer
  );
  const { peer, setPeer } = usePeer();
  const { isAuthenticated, userProfile } = useSelector(
    (state) => state.userReducer
  );
  const { socket } = useSelector((state) => state.socketReducer);
  const { selectedUser } = useSelector((state) => state.userReducer);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(initializeSocket(userProfile?.profile?._id));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket) return;

    socket.on("onlineUsers", (onlineUsers) => {
      dispatch(getUnreadMessagesIds({ myId: userProfile?.profile?._id }));
      dispatch(setOnlineUsers(onlineUsers));
    });

    socket.on("newMessage", (newMessage) => {
      dispatch(setNewMessage(newMessage));
    });
    socket.on("newMessage", () => {
      dispatch(getUnreadMessagesIds({ myId: userProfile?.profile?._id }));
    });
    socket.on("messagesReadByReceiver", ({ receiverId, count }) => {
      dispatch(getMessageThunk({ otherParticipantId: receiverId }));
    });

    return () => {};
  }, [socket]);

  useEffect(() => {
    const newPeer = new Peer(undefined, {
      host: "peerjs-production-1284.up.railway.app",
      port: 443, // 👈 Make sure you're using 443 if it's HTTPS
      path: "/peerjs",
      secure: true, // 👈 Important for SSL
    });

    setPeer(newPeer);

    return () => {
      newPeer.destroy();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("incomingCall", async ({ from, offer, name }) => {
      dispatch(setIncomingCall({ from, offer, name }));
    });
    return () => {
      socket.off("incomingCall");
    };
  }, [socket, peer]);

  const backHome = () => {
    dispatch(setSelectedUser(null));
  };

  return (
    <div className="flex flex-col h-screen  w-screen ">
      <div className="flex  w-screen overflow-hidden relative h-[92vh] lg:h-screen ">
        {/* Sidebar */}
        <div
          className={`lg:block ${
            selectedUser ? "hidden" : "block"
          } w-full lg:w-[25rem]`}
        >
          <Sidebar />
        </div>

        {/* Message area */}
        <div
          className={`flex-1 ${
            selectedUser ? "block" : "hidden"
          } lg:block w-full`}
        >
          <MessageConatainer />
        </div>

        {receivingCall && !callAccepted && <IncomingCallModal />}
        {(calling || callAccepted) && <VideoCallScreen />}
      </div>
      <div className="fixed bottom-0 flex justify-center h-7 bg-gray-700 w-full  lg:hidden z-50">
        <button onClick={backHome}>
          <MdHomeFilled className="text-gray-400 text-3xl" />
        </button>
      </div>
    </div>
  );
};

export default Home;
