import {
  House,
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  ScanLine,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import "./BottomNav.css";

function BottomNav() {
  const location = useLocation();
  const user = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const navItems = user
    ? [
        {
          label: "Dashboard",
          to: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Manage",
          to: "/manage-urls",
          icon: FolderKanban,
        },
        {
          label: "Scan",
          to: "/dashboard?scanner=1",
          icon: ScanLine,
        },
        {
          label: "Analytics",
          to: "/analytics",
          icon: BarChart3,
        },
      ]
    : [
        {
          label: "Home",
          to: "/",
          icon: House,
        },
        {
          label: "Login",
          to: "/login",
          icon: LogIn,
        },
        {
          label: "Register",
          to: "/register",
          icon: UserPlus,
        },
      ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.to.includes("?")
            ? location.pathname === "/dashboard" &&
              location.search.includes(
                "scanner=1"
              )
            : location.pathname === item.to;

        return (
          <Link
            key={item.to}
            to={item.to}
            className={`bottom-nav-link ${isActive ? "active" : ""}`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default BottomNav;
