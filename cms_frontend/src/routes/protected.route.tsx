import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  element,
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return element;
};

export default ProtectedRoute;
