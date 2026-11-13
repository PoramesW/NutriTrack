
import { NavLink, useNavigate } from "react-router-dom";
import { TOKEN_KEY } from "../services/api";

const navigationItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/nutrition", label: "Nutrition" },
  { to: "/analyzation", label: "Analyzation" },
  { to: "/food-tracking", label: "Food Tracking" },
];

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    navigate("/welcome", { replace: true });
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">N</span>
        <span>NutriTrack</span>
      </div>

      <nav className="nav-links">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-link${isActive ? " active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        Nutrition & Fitness Tracker

        <button
          type="button"
          className="food-secondary-button"
          style={{ width: "100%", marginTop: "14px" }}
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
