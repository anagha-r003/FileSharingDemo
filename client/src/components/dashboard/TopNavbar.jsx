import { useAuth } from "../../context/AuthContext";
import { Bell, ChevronDown } from "lucide-react";

function TopNavbar({ title, onMenuClick }) {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0c0e12]">
      {/* Left — menu toggle (mobile) + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-400 hover:text-white"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-xl font-bold text-white font-['Space_Grotesk']">
          {title}
        </h1>
      </div>

      {/* Right — upload + notification + profile */}
      <div className="flex items-center gap-3">
        {/* Upload button */}
        <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-white text-sm font-semibold transition">
          <span className="material-symbols-outlined text-base">
            upload_file
          </span>
          Upload Files
        </button>

        {/* Notification bell */}
        <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition">
          <Bell size={18} />
          {/* Red dot badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <span className="text-white text-sm font-medium hidden md:block">
            {user?.name || "User"}
          </span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}

export default TopNavbar;
