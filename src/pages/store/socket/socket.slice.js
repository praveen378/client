import { createSlice } from "@reduxjs/toolkit";
import io from "socket.io-client";

const initialState = {
  socket: null,
  onlineUsers: null,
  senderId: null,
  notificationIds:
    JSON.parse(localStorage.getItem("notificationIds") || "[]") || [],
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
    notificatonTrue: (state, action) => {
      state.senderId = action.payload;

      // Save to local storage
      const id = action.payload;

      // Only add the ID if it's not already present
      if (!state.notificationIds.includes(id)) {
        state.notificationIds = [...state.notificationIds, id];

        localStorage.setItem(
          "notificationIds",
          JSON.stringify(state.notificationIds)
        );
      }
    },
    notificatonFalse: (state, action) => {
      const id = action.payload;

      if (state.notificationIds.includes(id)) {
        // Remove the ID from the array
        state.notificationIds = state.notificationIds.filter(
          (item) => item !== id
        );
      }

      // Update localStorage with the new array
      localStorage.setItem(
        "notificationIds",
        JSON.stringify(state.notificationIds)
      );
    },
  },
});

export const {
  initializeSocket,
  setOnlineUsers,
  notificatonTrue,
  notificatonFalse,
} = socketSlice.actions;

export default socketSlice.reducer;
