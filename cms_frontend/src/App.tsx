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
            isAuthenticated ? (
              <Navigate to="/create-template" replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/template"
          element={<ProtectedRoute element={<Template />} />}
        />
        <Route
          path="/create-template"
          element={<ProtectedRoute element={<CreateTemplate />} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
