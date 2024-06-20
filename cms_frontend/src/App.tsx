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

function App() {
  const isAuthenticated = !!Cookies.get("access_token");

  return (
    <Router>
      <Routes>
        {/* Route for Login */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/template" replace /> : <Login />
          }
        />

        {/* Protected Routes */}
        <Route
          path="/template"
          element={
            isAuthenticated ? (
              <ProtectedRoute element={<Template />} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/create-template/:template_name"
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
  );
}

export default App;
