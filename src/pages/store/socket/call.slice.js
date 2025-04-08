// call.slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  
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
   
  setCalling,
  setReceivingCall,
  setCallAccepted,
  setCallerInfo,
  setIncomingCall,
} = callSlice.actions;
 export const isCallerSelector = (state) => {
  const slice = state.callReducer;
  if (!slice) return false;
  return slice.calling && !slice.receivingCall;
};

export default callSlice.reducer;
