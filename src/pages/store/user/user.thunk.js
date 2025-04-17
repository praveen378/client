import { createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from "../../utility/axiousinstance";

// Rgister User
export const registerUserThunk = createAsyncThunk(
  "users/register", // ✅ Correct action type
  async (
    { fullName, username, email, password, gender, avatar },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axiosInstance.post("/users/register", {
        fullName,
        username,
        email,
        password,
        gender,
        avatar,
      });

      toast.success("SignUp Successfully!"); // ✅ Show toast notification for success
      return data; // ✅ Return response data correctly
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "SignUp failed! Please try again.";
      toast.error(errorMessage); // ✅ Show toast notification for errors

      return rejectWithValue(errorMessage); // ✅ Pass error message properly
    }
  }
);
//login user
export const loginUserThunk = createAsyncThunk(
  "users/login", // ✅ Correct action type
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/users/login", {
        username,
        password,
      });

      toast.success("Login Successfully !"); // ✅ Show toast notification for success
      return data; // ✅ Return response data correctly
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Login failed! Please try again.";
      toast.error(errorMessage); // ✅ Show toast notification for errors

      return rejectWithValue(errorMessage); // ✅ Pass error message properly
    }
  }
);
//logout user
export const logoutUserThunk = createAsyncThunk(
  "users/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/users/logout");
      toast.success("Logout Successfully !"); // ✅ Show toast notification for success

      return data; // ✅ Return response data correctly
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Logout failed! Please try again.";
      toast.error(errorMessage); // ✅ Show toast notification for errors

      return rejectWithValue(errorMessage); // ✅ Pass error message properly
    }
  }
);

// getUserprofie
export const getUserProfileThunk = createAsyncThunk(
  "users/get-profile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/users/get-profile");

      return response.data;
    } catch (error) {
      console.error(error.response.data.message);
      const errorMessage =
        error?.response?.data?.message ||
        "Get-profile failed! Please try again.";

      return rejectWithValue(errorMessage); // ✅ Pass error message properly
    }
  }

  //
);

//getother users

export const getOtherUsersThunk = createAsyncThunk(
  "users/get-Other-users",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/users/get-other-users");
      return response.data;
    } catch (error) {
      console.error(error.response.data);
      const errorOutput = error?.response?.data?.errMessage;
      // toast.error(errorOutput);
      return rejectWithValue(errorOutput);
    }
  }
);

export const getUnreadMessagesIds = createAsyncThunk(
  "/status/get-notificationIds",
  async ({ myId }) => {
    try {
      const response = await axiosInstance.get(
        `/status/get-notificationIds/${myId}`
      );

      return response.data; // ✅ Return response data correctly
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      toast.error(errorMessage); // ✅ Show toast notification for errors

      return rejectWithValue(errorMessage); // ✅ Pass error message properly
    }
  }
);
