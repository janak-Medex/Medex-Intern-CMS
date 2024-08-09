import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  element,
}) => {
  useEffect(() => {
    console.log("ProtectedRoute rendered. isAuthenticated:", isAuthenticated);
    console.log("Access token:", Cookies.get("access_token"));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    console.log("Redirecting to login page");
    return <Navigate to="/" replace />;
  }
  return element;
};

export default ProtectedRoute;
