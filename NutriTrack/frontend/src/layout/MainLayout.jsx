
import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { TOKEN_KEY } from "../services/api";

export default function MainLayout() {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
