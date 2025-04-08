 // call.slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  calling: false,
  receivingCall: false,
  callAccepted: false,
  callerInfo: null,
  incomingCall: null, // <-- add this if not present
  calleeId: null, // <-- add this if not present
};

const callReducer = createSlice({
  name: "call",
  initialState,
  reducers: {
    setCalling: (state, action) => {
      state.calling = action.payload;
    },
    setReceivingCall: (state, action) => {
      state.receivingCall = action.payload;
    },
    setCallAccepted: (state, action) => {
      state.callAccepted = action.payload;
    },
    setCallerInfo: (state, action) => {
      state.callerInfo = action.payload;
    },
    setIncomingCall: (state, action) => {
      console.log("Incoming call action payload:", action.payload);
      state.incomingCall = action.payload;
      state.receivingCall = !!action.payload;
    },
    setCalleeId: (state, action) => {
      state.calleeId = action.payload;
    },
  },
});

export const {
  setCalling,
  setReceivingCall,
  setCallAccepted,
  setCallerInfo,
  setIncomingCall,
  setCalleeId,
} = callReducer.actions;

export const isCallerSelector = (state) =>
  state.callReducer.calling && !state.callReducer.receivingCall;

export default callReducer.reducer;
