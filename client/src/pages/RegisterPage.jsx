const RegisterPage = () => {
  return (
    <div className="bg-[#0e0e0e] text-white min-h-screen flex flex-col">
      {/* Top Navbar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#0e0e0e]/70 backdrop-blur-xl">
        <div className="text-xl font-bold tracking-tighter text-[#98a9ff]">
          VaultLink
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[#adaaaa] hover:text-white transition-colors cursor-pointer">
            ?
          </span>
          <span className="text-[#adaaaa] hover:text-white transition-colors cursor-pointer">
            i
          </span>
        </div>
      </header>

      {/* Main Section */}
      <main className="relative flex-grow flex items-center justify-center px-4 pt-24 pb-12 overflow-hidden bg-[radial-gradient(circle_at_top_left,_#1a1a1a_0%,_#0e0e0e_100%)]">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(152,169,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(152,169,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {/* Glow Orb */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
          <div className="w-96 h-96 rounded-full bg-[#98a9ff] blur-[120px]"></div>
        </div>

        {/* Glass Card */}
        <div className="relative z-10 w-full max-w-2xl p-8 md:p-12 rounded-xl bg-[#1a1a1a]/60 backdrop-blur-2xl">
          {/* Heading */}
          <div className="mb-12 text-center max-w-lg mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              Create Your Vault
            </h1>

            <p className="text-gray-400 text-base md:text-lg leading-relaxed">
              Securely store, manage, and share your files from one protected
              workspace.
            </p>
          </div>

          {/* Form */}
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
                First Name
              </label>
              <input
                type="text"
                placeholder="Alex"
                className="w-full bg-[#131313] rounded-xl text-white py-3 px-4 outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Vance"
                className="w-full bg-[#131313] rounded-xl text-white py-3 px-4 outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
                Secure Email Address
              </label>
              <input
                type="email"
                placeholder="vance@obsidian.network"
                className="w-full bg-[#131313] rounded-xl text-white py-3 px-4 outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
                Vault Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#131313] rounded-xl text-white py-3 px-4 outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
                Confirm Vault Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#131313] rounded-xl text-white py-3 px-4 outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-[#98a9ff] uppercase tracking-wider">
                Date of Birth
              </label>
              <input
                type="date"
                className="w-full bg-[#131313] rounded-xl text-white py-3 px-4 outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-br from-[#98a9ff] to-[#4065ff] text-white font-extrabold text-lg rounded-xl hover:shadow-[0_0_25px_rgba(152,169,255,0.4)] transition-all active:scale-95"
              >
                Join the Vault
              </button>
            </div>
          </form>

          {/* Bottom Info */}
          <div className="mt-10 text-center space-y-4">
            <p className="text-gray-400 text-sm">
              Already have an account?
              <a
                href="#"
                className="text-cyan-400 font-bold hover:underline ml-1"
              >
                Secure Login
              </a>
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6 border-t border-zinc-700/30">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">✔</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  End-to-End Encrypted
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-cyan-400">🔒</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  Zero-Trust Protocol
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 bg-black flex flex-col md:flex-row justify-between items-center px-12 gap-4">
        <div className="text-xs tracking-wide text-gray-400 uppercase">
          © 2026 VaultLink. Protected storage. Trusted sharing.
        </div>

        <nav className="flex gap-8">
          <a className="text-xs tracking-wide text-gray-400 uppercase hover:text-cyan-400 transition-all">
            Privacy Policy
          </a>
          <a className="text-xs tracking-wide text-gray-400 uppercase hover:text-cyan-400 transition-all">
            Terms of Service
          </a>
          <a className="text-xs tracking-wide text-gray-400 uppercase hover:text-cyan-400 transition-all">
            Security Architecture
          </a>
        </nav>
      </footer>
    </div>
  );
};

export default RegisterPage;
