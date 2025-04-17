import { Route, Routes } from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";
import Home from "./pages/home/Home";
import { PeerProvider } from "./context/PeerContext"; // create this file
import Login from "./pages/authentication/Login";
import SignUp from "./pages/authentication/SignUp";
import { store } from "./pages/store/store";
import { Provider, useDispatch, useSelector } from "react-redux";
import ProtectedRoute from "./components/ProtectedRoutes";
import { useEffect } from "react";
import {
  getOtherUsersThunk,
  getUserProfileThunk,
} from "./pages/store/user/user.thunk";
import VideoCallScreen from "./pages/CallingPages/VideoCallScreen";

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.userReducer);

  useEffect(() => {
   
    (async () => {
      await dispatch(getUserProfileThunk());
    })();
    dispatch(getOtherUsersThunk());
  }, [isAuthenticated]);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Protecting Home Route */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/call" element={<VideoCallScreen />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PeerProvider>
        <AppContent />
      </PeerProvider>
    </Provider>
  );
}

export default App;
