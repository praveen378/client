 import React, { use, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../store/user/user.slice";
import { setCalleeId, setCalling } from "../store/socket/call.slice";
import { usePeer } from "../../context/PeerContext";
import SimplePeer from "simple-peer/simplepeer.min.js"; // ✅ Add this line
const UserTopHeader = ({ userDetails }) => {
  const dispatch = useDispatch();
  const { selectedUser, userProfile } = useSelector(
    (state) => state.userReducer
  );
  const { peer, setPeer } = usePeer();
  const { onlineUsers, socket } = useSelector((state) => state.socketReducer);

  const isActive = selectedUser?._id === userDetails?._id;

  const handleUserClick = () => {
    dispatch(setSelectedUser(userDetails));
  };

  const handleCallUser = async () => {
    dispatch(setCalleeId(userDetails._id)); // Make sure `from` is the correct ID
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      console.log("📹 Got media stream:", stream);

      dispatch(setCalling(true)); // Update global call state

      const newPeer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            {
              urls: "turn:relay.example.com:3478",
              username: "user",
              credential: "pass",
            },

            // You can add TURN servers here later for NAT traversal
          ],
        },
      });

      newPeer.on("signal", (data) => {
        console.log("📡 Emitting callUser with signal data...");
        socket.emit("callUser", {
          toUserId: userDetails._id,
          signalData: data,
          fromUserId: userProfile.profile._id,
          name: userProfile.profile.fullName,
        });
      });

      newPeer.on("stream", (remoteStream) => {
        console.log("🎥 Received remote stream");
        const remoteVideo = document.getElementById("remote-video");
        if (remoteVideo) {
          remoteVideo.srcObject = remoteStream;
        }
      });

      newPeer.on("error", (err) => {
        console.error("❌ Peer error:", err);
      });

      setPeer(newPeer);
    } catch (error) {
      console.error("⚠️ Call error:", error);
      alert("Please allow camera and microphone permissions.");
    }
  };

  // Optional: handle socket response to accepted call
  useEffect(() => {
    if (!socket) return;

    socket.on("callAccepted", ({ signal }) => {
      console.log("✅ Call accepted signal received");
      // If needed, this can trigger additional peer signaling
    });

    return () => {
      socket.off("callAccepted");
    };
  }, [socket]);

  return (
    <div
      onClick={handleUserClick}
      className={`flex justify-between items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer transition-colors duration-200 ${
        isActive ? "bg-gray-700" : "hover:bg-gray-600"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={userDetails?.avatar}
            alt="avatar"
            className="w-12 h-12 rounded-full object-cover"
          />
          {onlineUsers?.includes(userDetails?._id) && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-white font-semibold truncate w-40">
            {userDetails?.username}
          </span>
          <span className="text-sm text-gray-400 truncate w-40">
            {userDetails?.fullName}
          </span>
        </div>
      </div>

      <button
        onClick={handleCallUser}
        className="text-white bg-green-500 px-3 py-1 rounded hover:bg-green-600"
      >
        📞
      </button>
    </div>
  );
};

export default UserTopHeader;
