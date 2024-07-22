import { useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./login/cms.login";
import CreateTemplate from "./template/CreateTemplate";
import ProtectedRoute from "./routes/protected.route";
import Cookies from "js-cookie";
import Template from "./template/Template";
import { ToastContainer } from "react-toastify";
import { logout } from "./api/auth.api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!Cookies.get("access_token")
  );

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error during logout:", error);
      setIsAuthenticated(false);
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
              isAuthenticated ? (
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
                isAuthenticated={isAuthenticated}
                element={<Template onLogout={handleLogout} />}
              />
            }
          />
          <Route
            path="/template/:template_name"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
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
