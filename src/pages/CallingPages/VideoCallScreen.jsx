import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCallAccepted, setIncomingCall } from "../store/socket/call.slice";
import { usePeer } from "../../context/PeerContext";
import { useNavigate } from "react-router-dom";

// ✅ Use browser-compatible build of SimplePeer
import SimplePeer from "simple-peer/simplepeer.min.js";

const VideoCallScreen = () => {
  const navigate = useNavigate();
  const { peer, setPeer } = usePeer();
  const dispatch = useDispatch();

  const { socket } = useSelector((state) => state.socketReducer);
  const myVideo = useRef(null);
  const userVideo = useRef(null);

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

        // ✅ Create new SimplePeer instance if not exists
        if (!peer) {
          const newPeer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: stream,
          });

          newPeer.on("signal", (data) => {
            socket.emit("callUser", { signalData: data });
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
          setPeer(newPeer); // save to context
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
  }, []);

  const handleEndCall = () => {
    if (peer) {
      peer.destroy();
    }
console.log("End call button clicked");
    dispatch(setCallAccepted(false));
    setPeer(null); // ✅ this is from context, don't dispatch it
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
