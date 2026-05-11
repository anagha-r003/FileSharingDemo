import { useState } from "react";

/**
 * AddToFolderModal
 * Props:
 *   selectedCount {number}   – how many files are being moved
 *   folders       {string[]} – existing folder names
 *   onConfirm     {function(folderName: string)} – called when user clicks "Move files"
 *   onClose       {function} – called on cancel / backdrop click
 */
function AddToFolderModal({ selectedCount, folders = [], onConfirm, onClose }) {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [localFolders, setLocalFolders] = useState(folders);

  const handleCreate = () => {
    const name = newFolderName.trim();
    if (!name) return;
    setLocalFolders((prev) => (prev.includes(name) ? prev : [name, ...prev]));
    setSelectedFolder(name);
    setNewFolderName("");
  };

  const handleConfirm = () => {
    if (!selectedFolder) return;
    onConfirm(selectedFolder);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl border border-white/10 bg-[#0f111a] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-semibold text-base">Add to folder</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
        <p className="text-slate-500 text-xs mb-4">
          Moving {selectedCount} file{selectedCount > 1 ? "s" : ""} — choose an
          existing folder or create a new one.
        </p>

        {/* Existing folders */}
        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto mb-4 pr-1">
          {localFolders.length === 0 && (
            <p className="text-slate-600 text-xs text-center py-3">
              No folders yet — create one below.
            </p>
          )}
          {localFolders.map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition w-full ${
                selectedFolder === folder
                  ? "bg-violet-600/20 border border-violet-500/40 text-white"
                  : "hover:bg-white/5 border border-transparent text-slate-300"
              }`}
            >
              <span
                className={`material-symbols-outlined text-lg ${
                  selectedFolder === folder
                    ? "text-violet-400"
                    : "text-amber-400"
                }`}
              >
                folder
              </span>
              <span className="text-sm font-medium flex-1 truncate">
                {folder}
              </span>
              {selectedFolder === folder && (
                <span className="material-symbols-outlined text-violet-400 text-base">
                  check_circle
                </span>
              )}
            </button>
          ))}
        </div>

        {/* New folder input */}
        <div className="border-t border-white/5 pt-4 mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Create new folder
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Folder name"
              className="flex-1 bg-[#111] border border-white/10 rounded-xl text-white text-sm py-2 px-3 outline-none focus:border-violet-500/50 transition placeholder:text-slate-600"
            />
            <button
              onClick={handleCreate}
              disabled={!newFolderName.trim()}
              className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition"
            >
              Create
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedFolder}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">
              drive_file_move
            </span>
            Move files
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddToFolderModal;
