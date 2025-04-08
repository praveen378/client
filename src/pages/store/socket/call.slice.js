// call.slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  peer: null,
  calling: false,
  receivingCall: false,
  callAccepted: false,
  callerInfo: null,
  incomingCall: null, // <-- add this if not present
};

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    setPeer: (state, action) => {
      state.peer = action.payload;
    },
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
  },
});

export const {
  setPeer,
  setCalling,
  setReceivingCall,
  setCallAccepted,
  setCallerInfo,
  setIncomingCall,
} = callSlice.actions;
export const isCallerSelector = (state) =>
  state.callReducer.calling && !state.callReducer.receivingCall;
export default callSlice.reducer;
