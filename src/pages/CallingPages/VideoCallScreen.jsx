import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCallAccepted,
  setCalling,
  isCallerSelector,
} from "../store/socket/call.slice";
import { useNavigate } from "react-router-dom";
import peer from "../../service/peer";
import { off } from "process";
import toast from "react-hot-toast";

const VideoCallScreen = () => {
  const { selectedUser, userProfile } = useSelector(
    (state) => state.userReducer
  );
  const { socket } = useSelector((state) => state.socketReducer);
  const incomingCall = useSelector((state) => state.callReducer.incomingCall);
  const callAccepted = useSelector((state) => state.callReducer.callAccepted);
  const calling = useSelector((state) => state.callReducer.calling);
  const calleeId = useSelector((state) => state.callReducer.calleeId);
  const isCaller = useSelector(isCallerSelector);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [connectionStatus, setStatus] = useState("connecting");

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pendingCandidates = useRef([]);

  useEffect(() => {
    const iceHandler = (event) => {
      if (event.candidate) {
        if (remoteSocketId) {
          console.log(
            "i emitting ice candidste from socket and remotesocketid"
          );
          socket.emit("iceCandidate", {
            to: remoteSocketId,
            candidate: event.candidate,
          });
        } else {
          console.warn("⚠️ ICE candidate generated before remoteSocketId set");
          pendingCandidates.current.push(event.candidate);
        }
      }
    };

    peer.peer.addEventListener("icecandidate", iceHandler);

    return () => {
      peer.peer.removeEventListener("icecandidate", iceHandler);
    };
  }, [socket, remoteSocketId]);

  // Flush pending candidates after remoteSocketId is set
  useEffect(() => {
    if (remoteSocketId && pendingCandidates.current.length) {
      console.log("i am from socket");
      pendingCandidates.current.forEach((candidate) => {
        socket.emit("iceCandidate", {
          to: remoteSocketId,
          candidate,
        });
      });
      pendingCandidates.current = [];
    }
  }, [remoteSocketId]);

  // Step 2: Handle Incoming ICE Candidates
  useEffect(() => {
    socket.on("iceCandidate", ({ candidate }) => {
      console.log("📩 Received ICE candidate from remote:", candidate);
      peer.peer.addIceCandidate(new RTCIceCandidate(candidate)).catch((err) => {
        console.error("❌ Error adding ICE candidate:", err);
      });
    });

    return () => {
      socket.off("iceCandidate");
    };
  }, [socket]);

  // Step 1: Caller initiates call
  useEffect(() => {
    if (!calling || callAccepted) return;

    const startCall = async () => {
      // console.log("📞 Caller: Starting call...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      console.log("📷 Caller: Got local media stream", stream);

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
      }

      const offer = await peer.getOffer();
      // console.log("📨 Sending offer to callee:", offer);

      socket.emit("callUser", {
        toUserId: calleeId,
        fromUserId: userProfile?.profile?._id,
        name: userProfile?.profile?.fullName,
        offer,
      });
    };

    startCall();
  }, [calling, callAccepted]);

  const sendStreams = useCallback(() => {
    const stream = myVideoRef.current?.srcObject;
    if (!stream) {
      console.error("❌ Local stream not found when sending tracks");
      return;
    }
    stream.getTracks().forEach((track) => {
      peer.peer.addTrack(track, stream);
    });
  }, []);

  const handleNegoNeeded = useCallback(
    async (from) => {
      // console.log("🛠️ Negotiation needed");
      const offer = await peer.getOffer();
      socket.emit("negotiate", { to: from, offer });
    },
    [socket]
  );

  // Step 2: Handle call acceptance
  useEffect(() => {
    const handleAcceptedCall = async ({ from, ans }) => {
      sendStreams();
      await peer.setLocalDescription(ans);
      setRemoteSocketId(from);
      setStatus("connected");
      peer.peer.addEventListener("negotiationneeded", () => {
        handleNegoNeeded(from);
      });
    };

    socket.on("callAccepted", handleAcceptedCall);
    return () => {
      socket.off("callAccepted", handleAcceptedCall);
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [sendStreams, handleNegoNeeded]);

  // Step 2: Receiver accepts call
  useEffect(() => {
    if (!callAccepted || !incomingCall?.offer) return;
    const acceptCall = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => {
        peer.peer.addTrack(track, stream);
      });
      console.log("📞 sending ice candidat from my side ", incomingCall.from);
      setRemoteSocketId(incomingCall.from);

      const ans = await peer.getAnswer(incomingCall.offer);
      socket.emit("callAccepted", {
        to: incomingCall.from,
        ans,
      });
    };
    acceptCall();
  }, [callAccepted, incomingCall]);

  // Step 3: Handle incoming tracks (remote video)
  useEffect(() => {
    peer.peer.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) setRemoteStream(stream);
    };
  }, []);

  // Step 4: Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      // console.log("📺 Binding remote stream to <video>");
      const remoteVideo = remoteVideoRef.current;
      remoteVideo.srcObject = remoteStream;

      const handleLoaded = () => {
        remoteVideo
          .play()

          .catch((err) => {
            console.warn("❌ Auto-play blocked for remote video:", err);
          });
      };

      remoteVideo.addEventListener("loadedmetadata", handleLoaded);

      // Fallback in case loadedmetadata doesn't fire
      const fallback = setTimeout(() => {}, 1500);

      return () => {
        remoteVideo.removeEventListener("loadedmetadata", handleLoaded);
        clearTimeout(fallback);
      };
    }
  }, [remoteStream]);

  // Step 5: Handle negotiation
  const handleNegoIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);

      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    socket.on("callNegotiation", handleNegoIncoming);
    socket.on("call:nego:final", handleNegoFinal);

    return () => {
      socket.off("callNegotiation", handleNegoIncoming);
      socket.off("call:nego:final", handleNegoFinal);
    };
  }, [socket, handleNegoIncoming, handleNegoFinal]);

  // Step 6: Handle call cancellation
  const handleEndCall = () => {
    console.log("📴 Ending call");

    // Inform the other peer
    if (remoteSocketId) {
      socket.emit("callCanceled", { to: remoteSocketId });
    }

    // Close current peer connection
    if (peer.peer) {
      peer.peer.getSenders().forEach((sender) => {
        peer.peer.removeTrack(sender);
      });

      peer.peer.ontrack = null;
      peer.peer.onicecandidate = null;

      peer.peer.close();
    }

    // Re-initialize the peer connection for next call
    peer.initPeer(); // make sure your PeerService has this method to re-create peer.peer = new RTCPeerConnection()

    // Reset Redux state and navigate away
    dispatch(setCallAccepted(false));
    dispatch(setCalling(false));
    navigate("/", { replace: true });
  };

  // Step 7: Handle call cancellation from the other peer
  useEffect(() => {
    const handleCallCanceled = () => {
      console.log("❌ Call was canceled by remote");

      // Close current peer connection
      if (peer.peer) {
        peer.peer.getSenders().forEach((sender) => {
          peer.peer.removeTrack(sender);
        });

        peer.peer.ontrack = null;
        peer.peer.onicecandidate = null;

        peer.peer.close();
      }

      // Re-initialize the peer connection for next call
      peer.initPeer(); // make sure your PeerService has this method to re-create peer.peer = new RTCPeerConnection()
      toast.error("Call Ended"); // ✅ Show toast notification
      dispatch(setCallAccepted(false));
      dispatch(setCalling(false));
      navigate("/", { replace: true });
    };
    const callRejected = () => {
      console.log("❌ Call was rejected by remote");
      toast.error(`Call Rjected! by ${selectedUser?.fullName}`, {
        icon: "🥹",
      }); // ✅ Show toast notification
      dispatch(setCallAccepted(false));
      dispatch(setCalling(false));
      navigate("/", { replace: true });
    };

    socket.on("callEnded", handleCallCanceled);
    socket.on("callRejectedStatus", callRejected);
    return () => {
      socket.off("callEnded", handleCallCanceled);
      socket.off("callRejectedStatus", callRejected);
    };
  }, [socket]);

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      <div className="flex-grow relative">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false} // only local video should be muted
            className="   h-full object-cover "
          />
        </div>

        <video
          ref={myVideoRef}
          autoPlay
          muted
          playsInline
          className="absolute bottom-6 right-6 w-40 h-40 rounded-lg border-2 border-white shadow-lg z-5"
        />

        {/* Debug Info */}
        <div className="absolute bottom-4 left-4 text-white text-sm z-50 bg-black/70 p-2 rounded">
          <p>📡 isCaller: {String(isCaller)}</p>
          <p>🎥 Remote stream: {remoteStream ? "Yes" : "No"}</p>
          <p>🎬 Tracks: {remoteStream?.getTracks()?.length ?? 0}</p>
        </div>
        <div className="absolute top-4 left-4 text-white text-sm z-50 bg-black/70 p-2 rounded">
          Status: {connectionStatus}
        </div>
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
