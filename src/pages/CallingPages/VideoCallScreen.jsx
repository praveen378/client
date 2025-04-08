  // VideoCallScreen.jsx
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCallAccepted,
  setIncomingCall,
  setCalling,
} from "../store/socket/call.slice";
import { usePeer } from "../../context/PeerContext";
import { useNavigate } from "react-router-dom";
import SimplePeer from "simple-peer/simplepeer.min.js";
import { isCallerSelector } from "../store/socket/call.slice";

const VideoCallScreen = () => {
  const navigate = useNavigate();
  const { peer, setPeer } = usePeer();
  const dispatch = useDispatch();

  const { socket } = useSelector((state) => state.socketReducer);
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const isCaller = useSelector(isCallerSelector); // 🟢 Selector here

  useEffect(() => {
    let currentPeer;
    let streamRef;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef = stream;
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }

        if (!peer) {
          const newPeer = new SimplePeer({
            initiator: isCaller, // 🟢 Dynamically set initiator
            trickle: false,
            stream: stream,
          });

          newPeer.on("signal", (data) => {
            if (isCaller) {
              socket.emit("callUser", { signalData: data });
            } else {
              socket.emit("acceptCall", { signal: data });
            }
          });

          newPeer.on("stream", (remoteStream) => {
            if (userVideo.current) {
              userVideo.current.srcObject = remoteStream;
            }
          });

          newPeer.on("close", () => {
            dispatch(setCallAccepted(false));
            dispatch(setPeer(null));
            dispatch(setIncomingCall(null));
          });

          currentPeer = newPeer;
          setPeer(newPeer);
        }
      })
      .catch((err) => {
        console.error("Error accessing media devices", err);
      });

    return () => {
      streamRef?.getTracks().forEach((track) => track.stop());
      currentPeer?.destroy();
      dispatch(setCallAccepted(false));
      dispatch(setPeer(null));
    };
  }, [isCaller]); // 🟢 add isCaller as a dependency

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
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 text-white">
      <h1 className="text-2xl mb-4">Live Call</h1>
      <div className="flex gap-6">
        <video
          ref={myVideo}
          autoPlay
          muted
          playsInline
          className="w-64 rounded-lg shadow"
        />
        <video
          ref={userVideo}
          autoPlay
          playsInline
          className="w-64 rounded-lg shadow"
        />
      </div>
      <button
        onClick={handleEndCall}
        className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
      >
        End Call
      </button>
    </div>
  );
};

export default VideoCallScreen;
