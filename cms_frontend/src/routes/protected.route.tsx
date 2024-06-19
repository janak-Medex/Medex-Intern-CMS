import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const isAuthenticated = !!Cookies.get("access_token");
  return isAuthenticated ? <>{element}</> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
