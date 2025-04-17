class PeerService {
  constructor() {
    this.createPeer();
  }

  createPeer() {
    this.peer = new RTCPeerConnection({
      // iceServers: [
      //   {
      //     urls: ["stun:global.stun.twilio.com:3478"],
      //   },
      //   {
      //     urls: [
      //       "turn:global.turn.twilio.com:3478?transport=udp",
      //       "turn:global.turn.twilio.com:3478?transport=tcp",
      //     ],
      //     // username: "ACa47179835e8bbgth7a4tght742d80ab4faa30302",
      //     // credential: "8f327f4d981f3bthth60thgt3b5f69cbefd3d83a",
      //   },
      // ],
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
        {
          urls: "stun:stun1.l.google.com:19302",
        },
        {
          urls: "stun:stun2.l.google.com:19302",
        },
        {
          urls: "stun:stun3.l.google.com:19302",
        },
        {
          urls: "stun:stun4.l.google.com:19302",
        },
      ],
    });
  }

  // 👇 Call this to reset the peer connection
  initPeer() {
    if (this.peer) {
      try {
        this.peer.close();
      } catch (e) {
        console.warn("Peer close failed:", e);
      }
    }
    this.createPeer();
  }

  async getAnswer(offer) {
    if (this.peer) {
      try {
        const currentState = this.peer.signalingState;
        console.log("📡 Current signaling state before answer:", currentState);

        await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("✅ Remote description set for answer");

        if (this.peer.signalingState !== "have-remote-offer") {
          throw new Error(
            `❌ Not in 'have-remote-offer' state. Current state: ${this.peer.signalingState}`
          );
        }

        const answer = await this.peer.createAnswer();
        await this.peer.setLocalDescription(answer);
        console.log("📄 Answer created and local description set");
        return answer;
      } catch (err) {
        console.error("❌ getAnswer failed:", err);
        throw err;
      }
    }
  }

  async setLocalDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }
}

export default new PeerService();
