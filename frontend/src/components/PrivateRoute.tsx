import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute: React.FC = () => {
  const { token } = useContext(AuthContext)!;  // Get the token from context

  if (!token) {
    return <Navigate to="/login" />;  // Redirect to login if no token
  }

  return <Outlet />;  // Render the protected content if token exists
};

export default PrivateRoute;
