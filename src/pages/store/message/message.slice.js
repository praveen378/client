import { createSlice } from "@reduxjs/toolkit";
import { getMessageThunk, sendMessageThunk } from "./message.thunk";

const initialState = {
  messages: [],
  buttonLoading: false,
  screenLoading: true,
  loading: false,
};

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setNewMessage: (state, action) => {
      const selectedUser = localStorage.getItem("selectedUser");

      if (action.payload?.senderId == JSON.parse(selectedUser)._id) {
        state.messages = [...state.messages, action.payload];
      }
    },
    clearMessages: (state) => {
      state.messages = []; // ✅ Clear messages when switching users
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    // Send Message
    builder.addCase(sendMessageThunk.pending, (state) => {
      state.buttonLoading = true;
    });
    builder.addCase(sendMessageThunk.fulfilled, (state) => {
      state.buttonLoading = false;
    });
    builder.addCase(sendMessageThunk.rejected, (state) => {
      state.buttonLoading = false;
    });

    // Get Messages
    builder.addCase(getMessageThunk.pending, (state) => {
      state.screenLoading = true;
      state.loading = true;
    });

    builder.addCase(getMessageThunk.fulfilled, (state, action) => {
      state.loading = false;
      const { messages, page } = action.payload;

      if (page === 1) {
        // First page, replace messages
        state.messages = messages;
      } else {
        // Next pages, prepend messages to top
        state.messages = [...messages, ...state.messages];
      }
      state.buttonLoading = false;
    });

    builder.addCase(getMessageThunk.rejected, (state) => {
      state.screenLoading = false;
      state.loading = false;
    });
  },
});

export const { setNewMessage, clearMessages } = messageSlice.actions;

export default messageSlice.reducer;
