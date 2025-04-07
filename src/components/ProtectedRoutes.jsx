import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {
  const { isAuthenticated, screenLoading } = useSelector(
    (state) => state.userReducer
  );
  const navigate = useNavigate();

  useEffect(
    () => {
      if (!isAuthenticated) navigate("/login");
    },
    [isAuthenticated],
    [screenLoading]
  );

  return children;
};

export default ProtectedRoutes;
