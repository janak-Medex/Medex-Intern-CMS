import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCookie } from "../utils/cookie";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const accessToken = getCookie("access_token");
    setIsAuthenticated(!!accessToken);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
