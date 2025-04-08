import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { useSelector } from "react-redux";

const VideoCallPage = () => {
  const myVideo = useRef();
  const userVideo = useRef();
  const peerRef = useRef();
  const socket = useSelector((state) => state.socketReducer.socket);
  const incomingCall = useSelector((state) => state.callReducer.incomingCall);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }

      if (incomingCall) {
        const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });

        peer.on("signal", (data) => {
          socket.emit("acceptCall", { to: incomingCall.from, signal: data });
        });

        peer.on("stream", (remoteStream) => {
          if (userVideo.current) {
            userVideo.current.srcObject = remoteStream;
          }
        });

        peer.signal(incomingCall.signal);
        peerRef.current = peer;
      }
    });

    socket.on("callAccepted", (signal) => {
      if (peerRef.current) {
        peerRef.current.signal(signal);
      }
    });

    return () => {
      socket.off("callAccepted");
    };
  }, [incomingCall]);

  return (
    <div className="flex justify-center gap-6 p-6">
      <video ref={myVideo} autoPlay muted className="w-1/2 rounded-xl shadow-lg" />
      <video ref={userVideo} autoPlay className="w-1/2 rounded-xl shadow-lg" />
    </div>
  );
};

export default VideoCallPage;
