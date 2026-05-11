import { useState } from "react";
import { createShareLink } from "../../services/shareService";
import Toast from "../sharedlink/Toast";

function ShareModal({ file, onClose }) {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [expiryDate, setExpiryDate] = useState(
    tomorrow.toISOString().slice(0, 16),
  );

  const [access, setAccess] = useState("anyone");

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast((p) => ({ ...p, visible: false })), 3000);
  };

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
      const requestBody = {
        fileId: file.id,

        recipientEmails: emails,

        message: message,

        expiresAt: expiryDate,

        accessType: access === "anyone" ? "ANYONE" : "RESTRICTED",
      };

      const response = await createShareLink(requestBody);

      const generatedLink = response?.data?.[0]?.shareUrl;

      setLink(generatedLink);

      return generatedLink;
    } catch (err) {
      console.error(err);

      showToast("Failed to create sharelink");

      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    let finalLink = link;
    if (!finalLink) {
      finalLink = await handleGenerateLink();
    }
    if (!finalLink) return;
    navigator.clipboard.writeText(finalLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    if (emails.length === 0) {
      showToast("Add atleast one email");
      return;
    }

    const finalLink = await handleGenerateLink();

    if (!finalLink) return;

    showToast("Share link created and emails sent!");

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1e1e1e] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-semibold text-white">
              Send the link for
            </h2>
            <p className="text-violet-400 font-semibold text-base mt-0.5 truncate">
              "{file.name}"
            </p>
            <p className="text-slate-500 text-xs mt-1">
              You'll send an email with the link from below
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/5"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5 overflow-y-auto">
          {/* Email input */}
          <div className="border border-violet-500/40 rounded-xl px-4 py-3 bg-white/[0.02] focus-within:border-violet-500/80 focus-within:bg-white/[0.04] transition">
            <label className="block text-[10px] uppercase tracking-wider text-violet-400 mb-2 font-bold">
              Add people
            </label>
            <div className="flex flex-wrap gap-2 items-center">
              {emails.map((em) => (
                <span
                  key={em}
                  className="flex items-center gap-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-200 text-xs pl-2.5 pr-1.5 py-1 rounded-lg"
                >
                  {em}
                  <button
                    onClick={() => removeEmail(em)}
                    className="hover:bg-violet-500/30 rounded-md transition p-0.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">
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
                className="flex-1 min-w-[140px] bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a message..."
            rows={3}
            className="w-full bg-white/[0.02] border border-white/10 rounded-xl text-white text-sm px-4 py-3 outline-none focus:border-white/20 focus:bg-white/[0.04] transition placeholder:text-slate-600 resize-none"
          />

          {/* General access section */}
          <div className="space-y-3">
            <h3 className="text-white font-medium text-sm">General access</h3>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${access === "anyone" ? "bg-green-500/10" : "bg-slate-700/30"}`}
                >
                  <span
                    className={`material-symbols-outlined text-xl ${access === "anyone" ? "text-green-500" : "text-slate-400"}`}
                  >
                    {access === "anyone" ? "public" : "lock"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <select
                      value={access}
                      onChange={(e) => setAccess(e.target.value)}
                      className="bg-transparent text-white text-sm font-semibold outline-none cursor-pointer appearance-none pr-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJ3aGl0ZSI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiIGQ9Ik0xOSA5bC03IDctNy03Ii8+PC9zdmc+')] bg-[length:14px] bg-[right_center] bg-no-repeat"
                    >
                      <option value="anyone" className="bg-[#1e1e1e]">
                        Anyone with the link
                      </option>
                      <option value="restricted" className="bg-[#1e1e1e]">
                        Restricted
                      </option>
                    </select>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {access === "anyone"
                      ? "Anyone with link can view"
                      : "Only invited people"}
                  </p>
                </div>
              </div>

              {/* RIGHT POSITIONED EXPIRY */}
              <div className="flex flex-col items-end gap-1.5 border-l border-white/10 pl-4">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <span className="material-symbols-outlined text-[14px]">
                    timer
                  </span>
                  Expiry
                </div>
                <input
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="bg-[#111] border border-white/10 rounded-lg text-slate-300 text-[11px] px-2 py-1.5 outline-none focus:border-violet-500/50 transition [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Generated link area */}
          {link && (
            <div className="flex items-center gap-2 p-2 bg-violet-600/5 border border-violet-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
              <input
                readOnly
                value={link}
                className="flex-1 bg-transparent text-violet-200 text-xs px-2 outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <button
              onClick={handleGenerateLink}
              disabled={loading}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">link</span>
              {loading ? "Generating..." : link ? "Update Link" : "Create Link"}
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="text-sm font-medium text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={emails.length === 0}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white transition shadow-lg shadow-violet-600/20 disabled:opacity-30 disabled:grayscale"
              >
                Send
              </button>
            </div>

            <Toast message={toast.message} visible={toast.visible} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
