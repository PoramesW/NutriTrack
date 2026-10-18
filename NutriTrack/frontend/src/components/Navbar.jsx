
import { Link, NavLink } from "react-router-dom";

const navigationItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/nutrition", label: "Nutrition" },
  { to: "/analyzation", label: "Analyzation" },
  { to: "/food-tracking", label: "Food Tracking" },
];

export default function Navbar() {
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

      <Link to="/login">เข้าสู่ระบบ</Link>
      <Link to="/register">สมัครสมาชิก</Link>

      <div className="sidebar-footer">
        Nutrition & Fitness Tracker
      </div>
    </aside>
  );
}
