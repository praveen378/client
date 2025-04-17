import React, { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getMessageThunk } from "../store/message/message.thunk";
import SendMessage from "./SendMessage";
import { notificatonFalse } from "../store/socket/socket.slice";
import { clearMessages } from "../store/message/message.slice";
import UserTopHeader from "./UserTopHeader";

const MessageContainer = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const messagesContainerRef = useRef(null);
  const prevScrollHeightRef = useRef(0);

  const { senderId, socket } = useSelector((state) => state.socketReducer);
  const { selectedUser, userProfile } = useSelector(
    (state) => state.userReducer
  );
  const { messages, loading } = useSelector((state) => state.messageReducer);

  const isUserNearBottom = () => {
    const container = messagesContainerRef.current;
    const threshold = 150;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    );
  };

  useEffect(() => {
    if (!selectedUser?._id) return;
    dispatch(clearMessages());
    setPage(1);
    dispatch(
      getMessageThunk({ otherParticipantId: selectedUser._id, page: 1 })
    );
    dispatch(notificatonFalse(selectedUser._id));
  }, [selectedUser]);

  useEffect(() => {
    if (!socket || !selectedUser?._id || !userProfile?.profile?._id) return;
    const unreadMessages = messages.some(
      (msg) => msg.senderId === selectedUser._id && msg.status !== "read"
    );
    if (unreadMessages) {
      socket.emit("messageSeen", {
        senderId: selectedUser._id,
        receiverId: userProfile.profile._id,
      });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedUser?._id === senderId) {
      dispatch(notificatonFalse(selectedUser._id));
    }
  }, [selectedUser, messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || messages.length === 0) return;

    const isSender =
      messages[messages.length - 1]?.senderId === userProfile?.profile?._id;

    if (isSender || isUserNearBottom()) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container.scrollTop === 0 && !loading) {
      prevScrollHeightRef.current = container.scrollHeight;
      const nextPage = page + 1;
      dispatch(
        getMessageThunk({
          otherParticipantId: selectedUser._id,
          page: nextPage,
        })
      )
        .unwrap()
        .then(() => {
          setPage(nextPage);
          setTimeout(() => {
            const scrollDiff =
              messagesContainerRef.current.scrollHeight -
              prevScrollHeightRef.current;
            messagesContainerRef.current.scrollTop = scrollDiff;
          }, 50);
        });
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [selectedUser, page, loading]);

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full text-lg text-gray-500">
        Please select a user to chat
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="border-b border-b-[#484848] px-2">
        <UserTopHeader userDetails={selectedUser} />
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto flex flex-col p-2"
      >
        <motion.div
          className="flex flex-col gap-1"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.05 },
            },
          }}
        >
          {messages.map((messageDetails) => (
            <motion.div
              key={messageDetails._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Message messageDetails={messageDetails} />
            </motion.div>
          ))}
        </motion.div>

        {loading && (
          <div className="text-center text-sm text-gray-400 py-2">
            Loading...
          </div>
        )}
      </div>

      <SendMessage />
    </div>
  );
};

export default MessageContainer;
