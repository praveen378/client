import React, { useEffect, useRef, useState } from "react";
import MessageConatainer from "./MessageConatiner";
import Sidebar from "./Siedbar";
import Peer from "peerjs";
import SimplePeer from "simple-peer";

import { usePeer } from "../../context/PeerContext";
import { useDispatch, useSelector } from "react-redux";

import {
  initializeSocket,
  notificatonTrue,
  setOnlineUsers,
} from "../store/socket/socket.slice";
import { setNewMessage } from "../store/message/message.slice";
import { getMessageThunk } from "../store/message/message.thunk";
import IncomingCallModal from "../CallingPages/IncomingCallModal";
import VideoCallScreen from "../CallingPages/VideoCallScreen";
import { setIncomingCall } from "../store/socket/call.slice";

const Home = () => {
  const { receivingCall, callAccepted, calling } = useSelector(
    (state) => state.callReducer
  ); // ⬅️ assuming these are in your call slice

  const { peer, setPeer } = usePeer(); // ✅ get peer from context
  const dispatch = useDispatch();
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

  const { isAuthenticated, userProfile } = useSelector(
    (state) => state.userReducer
  );
  const { socket } = useSelector((state) => state.socketReducer);

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(initializeSocket(userProfile?.profile?._id));
  }, [isAuthenticated]);

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    socket.on("onlineUsers", (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    socket.on("newMessage", (newMessage) => {
      dispatch(setNewMessage(newMessage));
      dispatch(notificatonTrue(newMessage.senderId));
    });

    socket.on("messagesReadByReceiver", ({ receiverId, count }) => {
      dispatch(getMessageThunk({ otherParticipantId: receiverId }));
      console.log(`✅ ${count} messages read by user ${receiverId}`);
    });

    return () => {
      socket.close();
    };
  }, [socket]);

  // Setup PeerJS
  useEffect(() => {
    const newPeer = new Peer(undefined, {
      host: "backend-production-74c6.up.railway.app",
      port: 443,
      path: "/",
      secure: true,
    });

    setPeer(newPeer); // ✅ Set in context

    return () => {
      newPeer.destroy(); // ✅ Cleanup
    };
  }, []);

  // Handle incoming call
  useEffect(() => {
    if (!socket) return;

    socket.on("incomingCall", async ({ from, signal, name }) => {
      dispatch(setIncomingCall({ from, signal, name }));

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);

        const peerInstance = new SimplePeer({
          initiator: false,
          trickle: false,
          stream,
        });

        peerInstance.signal(signal);

        peerInstance.on("signal", (signalData) => {
          socket.emit("answerCall", {
            to: from,
            signal: signalData,
          });
        });

        peerInstance.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        setPeer(peerInstance);
      } catch (err) {
        console.error("Error getting user media", err);
      }
    });

    return () => {
      socket.off("incomingCall");
    };
  }, [socket, peer]);

  return (
    <div className="flex flex-row">
      <Sidebar />
      <MessageConatainer />

      {/* Show incoming call modal only when receiving a call and not accepted yet */}
      {receivingCall && !callAccepted && <IncomingCallModal />}

      {/* Show video call screen only when in call */}
      {(calling || callAccepted) && <VideoCallScreen />}
    </div>
  );
};

export default Home;
