import { useState, useEffect } from "react";
import {
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  BarChart3,
  FolderKanban,
  Menu,
  X,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] =
    useState(false);

  const user = JSON.parse(
    localStorage.getItem("userInfo")
  );

  useEffect(() => {
    if (
      user &&
      (
        location.pathname === "/login" ||
        location.pathname === "/register"
      )
    ) {
      navigate("/dashboard");
    }
  }, [location.pathname, navigate, user]);

  useEffect(() => {
    setShowMenu(false);
    setShowMobileMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  };

  const isActive = (path) =>
    location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        URL Shortener
      </Link>

      <div className="nav-right">
        <button
          className="mobile-menu-toggle"
          onClick={() =>
            setShowMobileMenu(
              !showMobileMenu
            )
          }
          aria-label="Toggle navigation"
          type="button"
        >
          {showMobileMenu ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>

        {!user ? (
          <>
            <Link
              to="/login"
              className="nav-btn"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="register-btn"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            <div className="nav-links">
              <Link
                to="/dashboard"
                className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>

              <Link
                to="/manage-urls"
                className={`nav-link ${isActive("/manage-urls") ? "active" : ""}`}
              >
                <FolderKanban size={18} />
                URL Management
              </Link>

              <Link
                to="/analytics"
                className={`nav-link ${isActive("/analytics") ? "active" : ""}`}
              >
                <BarChart3 size={18} />
                Analytics
              </Link>
            </div>

            <div className="profile-container">
              <div
                className="profile"
                onClick={() =>
                  setShowMenu(!showMenu)
                }
              >
                <div className="profile-avatar">
                  <User size={18} />
                </div>

                <div className="profile-info">
                  <span className="profile-name">
                    {user?.name}
                  </span>

                  <span className="profile-role">
                    Analytics Owner
                  </span>
                </div>

                <ChevronDown size={18} />
              </div>

              {showMenu && (
                <div className="dropdown">
                  <Link
                    to="/dashboard"
                    className="menu-item"
                  >
                    <User size={18} />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/analytics"
                    className="menu-item"
                  >
                    <BarChart3 size={18} />
                    <span>Analytics</span>
                  </Link>

                  <div
                    className="logout-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showMobileMenu && (
        <div className="mobile-menu">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`mobile-nav-link ${isActive("/dashboard") ? "active" : ""}`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>

              <Link
                to="/manage-urls"
                className={`mobile-nav-link ${isActive("/manage-urls") ? "active" : ""}`}
              >
                <FolderKanban size={18} />
                URL Management
              </Link>

              <Link
                to="/analytics"
                className={`mobile-nav-link ${isActive("/analytics") ? "active" : ""}`}
              >
                <BarChart3 size={18} />
                Analytics
              </Link>

              <button
                className="mobile-logout-btn"
                onClick={handleLogout}
                type="button"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="mobile-nav-link"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="mobile-nav-link mobile-register-link"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
