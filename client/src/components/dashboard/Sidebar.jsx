import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../services/authService";

const navItems = [
  { label: "Dashboard", icon: "grid_view", path: "/dashboard" },
  { label: "My Files", icon: "folder", path: "/my-files" },
  { label: "Shared Links", icon: "share", path: "/shared-links" },
  { label: "Analytics", icon: "bar_chart", path: "/analytics" },
  { label: "Security Logs", icon: "security", path: "/security" },
  { label: "Settings", icon: "settings", path: "/settings" },
];

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    logout(); // clear context
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen flex flex-col border-r border-white/5 bg-[#111111]">
      <div className="px-6 py-6">
        <span className="text-xl font-black text-violet-400 font-['Space_Grotesk']">
          VaultLink
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-violet-600/20 text-violet-400"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <span className="material-symbols-outlined text-xl">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6 space-y-1">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition w-full">
          <span className="material-symbols-outlined text-xl">help</span>
          Support
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition w-full"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Log Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
