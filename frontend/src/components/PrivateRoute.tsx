import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute: React.FC = () => {
  const { user, token } = useContext(AuthContext)!;

  console.log("User from Toolpad", user);
  console.log("token from Toolpad", token);

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
