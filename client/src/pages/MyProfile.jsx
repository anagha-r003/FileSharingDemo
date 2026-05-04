import { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";
import { useAuth } from "../context/AuthContext";

export default function MyProfile() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync sidebar with your other pages' logic
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-[#0c0e12] text-white overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopNavbar
          title="My Profile"
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Hero Card */}
            <div className="relative p-6 md:p-10 rounded-3xl bg-[#161922] border border-white/5 overflow-hidden shadow-2xl">
              {/* Subtle background glow to match storage health indicators */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/10 blur-[100px]" />

              <div className="relative flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 p-1 shadow-lg shadow-violet-600/20">
                    <div className="w-full h-full rounded-full bg-[#161922] flex items-center justify-center text-4xl md:text-5xl font-black">
                      {user?.firstName?.[0] || user?.name?.[0]}
                    </div>
                  </div>
                  <button className="absolute bottom-1 right-1 w-9 h-9 rounded-xl bg-[#1e212b] border border-white/10 flex items-center justify-center hover:bg-violet-600 transition-all shadow-xl">
                    <span className="material-symbols-outlined text-sm">
                      edit
                    </span>
                  </button>
                </div>

                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black tracking-tight mb-1">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-slate-500 font-medium mb-6">
                    {user?.email}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-[10px] font-black uppercase tracking-widest border border-violet-500/20">
                      Enterprise Member
                    </span>
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="p-6 md:p-8 rounded-2xl bg-[#161922] border border-white/5 space-y-8">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-violet-500">
                      manage_accounts
                    </span>
                    Personal Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        First Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.firstName}
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500/50 outline-none transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Last Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.lastName}
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500/50 outline-none transition"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500/50 outline-none transition cursor-not-allowed opacity-70"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button className="px-8 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-bold transition shadow-lg shadow-violet-600/20">
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Info Card */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-600/20 to-transparent border border-violet-500/10">
                  <h4 className="text-sm font-bold mb-4 uppercase tracking-widest text-violet-400">
                    Security Status
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        2FA Enabled
                      </span>
                      <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Password strength
                      </span>
                      <span className="text-xs font-bold text-white">
                        Strong
                      </span>
                    </div>
                  </div>
                  <button className="w-full mt-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition border border-white/5">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
