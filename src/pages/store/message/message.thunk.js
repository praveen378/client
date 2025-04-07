import { createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from "../../utility/axiousinstance";

//send message
export const sendMessageThunk = createAsyncThunk(
  "/messages/send", // ✅ Correct action type
  async ({ recieverId, message }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/messages/send/${recieverId}`,
        {
          message,
        }
      );

      return response.data; // ✅ Return response data correctly
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Login failed! Please try again.";
      toast.error(errorMessage); // ✅ Show toast notification for errors

      return rejectWithValue(errorMessage); // ✅ Pass error message properly
    }
  }
);
// get message
// This thunk fetches messages for a specific user
export const getMessageThunk = createAsyncThunk(
  "/messages/get-message",
  async ({ otherParticipantId, page = 1, limit = 15 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/messages/get-message/${otherParticipantId}?page=${page}&limit=${limit}`
      );
      
      return {
        messages: response.data.responseData.messages.reverse(), // ✅ Corrected response path
        page,
      };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to load messages!";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);


// this thunk for message status
export const updateMessageStatus = createAsyncThunk(
  "/status/sender", // ✅ Correct action type
  async ({senderId, recieverId  }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/status/sender/${senderId}/${recieverId}`,
        
      );
      return response.data; // ✅ Return response data correctly
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message  
      toast.error(errorMessage); // ✅ Show toast notification for errors

      return rejectWithValue(errorMessage); // ✅ Pass error message properly
    }
  }
);