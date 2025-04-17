import { createSlice } from "@reduxjs/toolkit";
import io from "socket.io-client";
import { getUnreadMessagesIds } from "../user/user.thunk";

const initialState = {
  socket: null,
  onlineUsers: null,
  senderId: null,
  notificationIds: [],
};

export const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    initializeSocket: (state, action) => {
      // if (state.socket) return; // Skip if socket already exists

      const socket = io(import.meta.env.VITE_DB_ORIGIN, {
        path: "/socket.io", // 👈 Add this!
        transports: ["websocket"],
        query: {
          userId: action.payload,
        },
      });

      state.socket = socket;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    // notificatonTrue: (state, action) => {
    //   state.senderId = action.payload;
    //   const id = action.payload;

    //   if (!state.notificationIds.includes(id)) {
    //     state.notificationIds = [...state.notificationIds, id];
    //     localStorage.setItem(
    //       "notificationIds",
    //       JSON.stringify(state.notificationIds)
    //     );
    //   }
    // },
    notificatonFalse: (state, action) => {
      const id = action.payload;

      state.notificationIds = state.notificationIds.filter(
        (item) => item.senderId !== id
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUnreadMessagesIds.fulfilled, (state, action) => {
      const senderData = action.payload.responseData.map((item) => ({
        senderId: item.senderId,
        unreadCount: item.unreadCount,
      }));

      state.notificationIds = senderData;
      // state.notificationIds = action.payload?.responseData?.notificationIds;
    });
    builder.addCase(getUnreadMessagesIds.rejected, (state, action) => {
      // state.notificationIds = action.payload?.responseData?.notificationIds;
    });
    // Add any additional reducers if needed
  },
});

export const {
  initializeSocket,
  setOnlineUsers,
  notificatonTrue,
  notificatonFalse,
} = socketSlice.actions;

export default socketSlice.reducer;
