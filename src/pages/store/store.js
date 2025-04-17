import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/user.slice"; // ✅ Ensure correct path
import messageReducer from "./message/message.slice";
import socketReducer from "./socket/socket.slice";
import callReducer from "./socket/call.slice"; // ✅ Ensure correct path
export const store = configureStore({
  reducer: {
    userReducer, // ✅ Correctly registered reducer
    messageReducer,
    socketReducer,
    callReducer, // ✅ Add it to the store
  },

  middleware: (getDefaultMiddlware) =>
    getDefaultMiddlware({
      serializableCheck: {
        ignoredPaths: ["socketReducer.socket"],
        ignoredActions: ['callSlice/setPeer'],
        
      },
    }),
});
