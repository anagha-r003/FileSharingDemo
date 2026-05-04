import { useState } from "react";
import { createShareLink } from "../../services/fileService";

function ShareModal({ file, onClose }) {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiryDays, setExpiryDays] = useState(7);
  const [access, setAccess] = useState("anyone");

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = email.trim().replace(",", "");
      if (val && !emails.includes(val)) {
        setEmails((prev) => [...prev, val]);
      }
      setEmail("");
    }
  };

  const removeEmail = (em) => {
    setEmails((prev) => prev.filter((e) => e !== em));
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const data = await createShareLink(file.id, { expiryDays, access });
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

  const handleSend = () => {
    if (emails.length === 0) {
      alert("Add at least one email to send to.");
      return;
    }
    alert(`Link sent to: ${emails.join(", ")}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      {/* Sheet slides up on mobile, centered modal on sm+ */}
      <div className="bg-[#1e1e1e] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-5 md:px-6 pt-5 md:pt-6 pb-4">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-base md:text-lg font-semibold text-white">
              Send the link for
            </h2>
            <p className="text-violet-400 font-semibold text-sm md:text-base mt-0.5 truncate">
              "{file.name}"
            </p>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              You'll send an email with the link from below
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition flex-shrink-0 mt-1 p-1 rounded-lg hover:bg-white/5"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-5 md:px-6 pb-5 md:pb-6 space-y-4">
          {/* Email input */}
          <div className="border border-violet-500/60 rounded-xl px-3 py-2 bg-transparent focus-within:border-violet-400 transition min-h-[52px]">
            <label className="block text-xs text-violet-400 mb-1 font-medium">
              Add people to send the link to
            </label>
            <div className="flex flex-wrap gap-2 items-center">
              {emails.map((em) => (
                <span
                  key={em}
                  className="flex items-center gap-1 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs px-2 py-1 rounded-full"
                >
                  {em}
                  <button
                    onClick={() => removeEmail(em)}
                    className="hover:text-white transition"
                  >
                    <span className="material-symbols-outlined text-xs">
                      close
                    </span>
                  </button>
                </span>
              ))}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                placeholder={
                  emails.length === 0 ? "Enter email and press Enter" : ""
                }
                className="flex-1 min-w-[120px] bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            rows={3}
            className="w-full bg-transparent border border-white/10 rounded-xl text-white text-sm px-4 py-3 outline-none focus:border-white/20 transition placeholder:text-slate-600 resize-none"
          />

          {/* General access */}
          <div>
            <p className="text-white font-semibold text-sm mb-3">
              General access
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  access === "anyone" ? "bg-green-500/20" : "bg-slate-700"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-lg ${
                    access === "anyone" ? "text-green-400" : "text-slate-400"
                  }`}
                >
                  {access === "anyone" ? "public" : "lock"}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <select
                  value={access}
                  onChange={(e) => setAccess(e.target.value)}
                  className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer mb-0.5"
                >
                  <option value="anyone" className="bg-[#1e1e1e]">
                    Anyone with the link
                  </option>
                  <option value="restricted" className="bg-[#1e1e1e]">
                    Restricted
                  </option>
                </select>
                <p className="text-slate-500 text-xs">
                  {access === "anyone"
                    ? "Anyone on the internet with the link can view"
                    : "Only people with access can open with the link"}
                </p>
              </div>

              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className="bg-[#111] border border-white/10 rounded-lg text-slate-300 text-xs px-2 py-1 outline-none flex-shrink-0"
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={0}>Never</option>
              </select>
            </div>
          </div>

          {/* Generated link input — shown only after generating */}
          {link && (
            <div className="flex gap-2">
              <input
                readOnly
                value={link}
                className="flex-1 bg-[#111] border border-white/10 rounded-xl text-slate-300 text-xs py-2 px-3 outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className={`px-3 md:px-4 py-2 rounded-xl text-sm font-semibold transition flex-shrink-0 ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-violet-600 hover:bg-violet-500 text-white"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}

          {/* Action buttons — all in one row, Copy link left, Cancel+Send right */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 mt-2">
            {/* Copy link — left side */}
            <button
              onClick={handleGenerateLink}
              disabled={loading}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition disabled:opacity-50 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-base">link</span>
              <span className="hidden sm:inline">
                {loading ? "Generating..." : link ? "Regenerate" : "Copy link"}
              </span>
              <span className="sm:hidden">
                {loading ? "..." : link ? "Regenerate" : "Copy link"}
              </span>
            </button>

            {/* Cancel + Send — right side, always in a row */}
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 md:px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={emails.length === 0}
                className="px-4 md:px-5 py-2 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
