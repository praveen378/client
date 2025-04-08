 import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCallAccepted,
  setIncomingCall,
  setCalling,
  isCallerSelector,
} from "../store/socket/call.slice";
import { usePeer } from "../../context/PeerContext";
import { useNavigate } from "react-router-dom";
import SimplePeer from "simple-peer/simplepeer.min.js";

const VideoCallScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { peer, setPeer } = usePeer();

  const [remoteStream, setRemoteStream] = useState(null);

  const { socket } = useSelector((state) => state.socketReducer);
  const incomingCall = useSelector((state) => state.callReducer.incomingCall);
  const isCaller = useSelector(isCallerSelector);

  const myVideo = useRef(null);
  const userVideo = useRef(null);

  // 🧠 Attach and play remote video
  useEffect(() => {
    if (userVideo.current && remoteStream) {
      console.log("🎥 Attaching remote stream...");
      userVideo.current.srcObject = remoteStream;

      setTimeout(() => {
        userVideo.current
          .play()
          .then(() => console.log("✅ Remote video playing"))
          .catch((err) =>
            console.error("❌ Error playing remote video:", err)
          );
      }, 300); // delay helps with DOM readiness
    }
  }, [remoteStream]);

  useEffect(() => {
    if (typeof isCaller !== "boolean") return;

    let currentPeer;
    let localStream;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream = stream;

        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }

        const newPeer = new SimplePeer({
          initiator: isCaller,
          trickle: false,
          stream,
          config: {
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          },
        });

        newPeer.on("signal", (data) => {
          if (isCaller) {
            console.log("📤 Calling user with signal:", data);
            socket.emit("callUser", {
              signalData: data,
              toUserId: incomingCall?.from,
              fromUserId: socket.id,
              name: "Caller",
            });
          } else {
            console.log("📤 Answering call with signal:", data);
            socket.emit("acceptCall", {
              signal: data,
              to: incomingCall.from,
            });
          }
        });

        newPeer.on("stream", (remoteStream) => {
          console.log("📺 Remote stream received:", remoteStream);
          setRemoteStream(remoteStream);
        });

        newPeer.on("close", () => {
          dispatch(setCallAccepted(false));
          dispatch(setIncomingCall(null));
          setPeer(null);
        });

        // Receiver handles incoming signal
        if (!isCaller && incomingCall?.signal) {
          console.log("📩 Signaling back to caller");
          newPeer.signal(incomingCall.signal);
        }

        // Caller handles accepted signal
        if (isCaller) {
          socket.on("callAccepted", (signal) => {
            console.log("✅ Call accepted signal received");
            newPeer.signal(signal);
          });
        }

        currentPeer = newPeer;
        setPeer(newPeer);
      })
      .catch((err) => {
        console.error("❌ Error accessing camera/mic:", err);
      });

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
      currentPeer?.destroy();
      dispatch(setCallAccepted(false));
      setPeer(null);
    };
  }, [isCaller]);

  const handleEndCall = () => {
    if (peer) {
      peer.destroy();
    }
    dispatch(setCallAccepted(false));
    dispatch(setCalling(false));
    setPeer(null);
    navigate("/", { replace: true });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      <div className="flex-grow relative">
        <video
          ref={userVideo}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover bg-black"
        />
        <video
          ref={myVideo}
          autoPlay
          muted
          playsInline
          className="absolute bottom-6 right-6 w-40 h-40 rounded-lg border-2 border-white shadow-lg z-10 bg-black"
        />
      </div>
      <div className="p-4 flex justify-center gap-6 bg-gray-800">
        <button
          onClick={handleEndCall}
          className="px-6 py-3 text-white bg-red-600 hover:bg-red-700 rounded-full shadow-xl"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCallScreen;
