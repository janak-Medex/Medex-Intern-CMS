import { useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./login/cms.login.tsx";
import CreateTemplate from "./template/CreateTemplate.tsx";
import ProtectedRoute from "./routes/protected.route";
import Cookies from "js-cookie";
import Template from "./template/Template.tsx";
import { ToastContainer } from "react-toastify";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!Cookies.get("access_token")
  );

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    Cookies.remove("access_token");
    setIsAuthenticated(false);
  }, []);

  return (
    <>
      <ToastContainer />
      <Router>
        <Routes>
          {/* Route for Login */}
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

          {/* Protected Routes */}
          <Route
            path="/template"
            element={
              isAuthenticated ? (
                <ProtectedRoute
                  element={<Template onLogout={handleLogout} />}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/template/:template_name"
            element={
              isAuthenticated ? (
                <ProtectedRoute element={<CreateTemplate />} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
