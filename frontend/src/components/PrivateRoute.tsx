import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * A private route that requires authentication.
 * @returns {JSX.Element} The private route component.
 */
const PrivateRoute: React.FC = () => {
  const { user, token } = useContext(AuthContext)!;
  if (!token || !user) {
    return <Navigate to="/login" />;
  }
  return <Outlet />;
};

export default PrivateRoute;
