import { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./login/cms.login";
import CreateTemplate from "./template/CreateTemplate";
import ProtectedRoute from "./routes/protected.route";
import Template from "./template/Template";
import { ToastContainer } from "react-toastify";
import { logout, isAuthenticated } from "./api/auth.api";
import Cookies from "js-cookie";

function App() {
  const [isAuth, setIsAuth] = useState<boolean>(() => {
    const auth = isAuthenticated();
    console.log("Initial auth state:", auth);
    return auth;
  });

  useEffect(() => {
    const handleAuthChange = () => {
      const newAuthState = isAuthenticated();
      console.log("Auth state changed:", newAuthState);
      setIsAuth(newAuthState);
    };

    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    console.log("isAuth state changed:", isAuth);
    console.log("Current access token:", Cookies.get("access_token"));
  }, [isAuth]);

  const handleLogin = useCallback(() => {
    console.log("Login callback triggered");
    setIsAuth(true);
  }, []);

  const handleLogout = useCallback(async () => {
    console.log("Logout callback triggered");
    try {
      await logout();
      setIsAuth(false);
    } catch (error) {
      console.error("Error during logout:", error);
      setIsAuth(false);
    }
  }, []);

  return (
    <>
      <ToastContainer />
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isAuth ? (
                <Navigate to="/template" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/template"
            element={
              <ProtectedRoute
                isAuthenticated={isAuth}
                element={<Template onLogout={handleLogout} />}
              />
            }
          />
          <Route
            path="/template/:template_name"
            element={
              <ProtectedRoute
                isAuthenticated={isAuth}
                element={<CreateTemplate onLogout={handleLogout} />}
              />
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
