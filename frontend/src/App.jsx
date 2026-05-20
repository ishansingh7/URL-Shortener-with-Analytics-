import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Navbar from "./components/Nabvar/Navbar";
import BottomNav from "./components/BottomNav/BottomNav";

import Login from "./components/Login/Login";
import Register from "./components/Login/Register";

import Home from "./components/Home/Home";

import Dashboard from "./components/Dashboard/Dashboard";
import ManageUrls from "./components/URlmange/ManageUrls";
import Insights from "./components/Insights/Insights";
import PublicStats from "./components/PublicStats/PublicStats";

/* =========================
   PROTECTED ROUTE
========================= */

function ProtectedRoute({ children }) {
  const user = JSON.parse(
    localStorage.getItem("userInfo")
  );

  return user
    ? children
    : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* PROTECTED DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* MANAGE URLS */}
        <Route
          path="/manage-urls"
          element={
            <ProtectedRoute>
              <ManageUrls />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ManageUrls"
          element={<Navigate to="/manage-urls" replace />}
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Insights />
            </ProtectedRoute>
          }
        />

        <Route
          path="/public-stats/:shortCode"
          element={<PublicStats />}
        />
      </Routes>

      <BottomNav />
    </BrowserRouter>
  );
}

export default App;
