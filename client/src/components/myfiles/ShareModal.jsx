import { useState } from "react";
import { createShareLink } from "../../services/fileService";

function ShareModal({ file, onClose }) {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiryDays, setExpiryDays] = useState(7);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await createShareLink(file.id, { expiryDays });
      setLink(data.shareUrl || data.url || data.link);
    } catch (err) {
      console.error("Share failed:", err);
      alert("Failed to create share link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Share File</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-slate-400 text-sm mb-4 truncate">
          <span className="text-white font-medium">{file.name}</span>
        </p>

        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Link expires in
          </label>
          <select
            value={expiryDays}
            onChange={(e) => setExpiryDays(Number(e.target.value))}
            className="w-full bg-[#111] border border-white/10 rounded-xl text-white py-2 px-3 outline-none"
          >
            <option value={1}>1 day</option>
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={0}>Never</option>
          </select>
        </div>

        {link ? (
          <div className="flex gap-2 mt-4">
            <input
              readOnly
              value={link}
              className="flex-1 bg-[#111] border border-white/10 rounded-xl text-white text-sm py-2 px-3 outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Link"}
          </button>
        )}
      </div>
    </div>
  );
}

export default ShareModal;
