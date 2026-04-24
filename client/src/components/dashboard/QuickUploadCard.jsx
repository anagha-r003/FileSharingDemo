import { useRef, useState } from "react";
import { uploadFile } from "../../services/fileService";

function QuickUploadCard({ onUploadComplete }) {
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList);
    setUploading(true);
    setResults([]);

    const newResults = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        await uploadFile(file, (pct) => {
          setProgress(Math.round(((i + pct / 100) / files.length) * 100));
        });
        newResults.push({ name: file.name, ok: true });
      } catch (err) {
        const message = err.response?.data?.message || "Upload failed";
        newResults.push({ name: file.name, ok: false, message });
      }
    }

    setResults(newResults);
    setProgress(0);
    setUploading(false);
    if (onUploadComplete) onUploadComplete();
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) uploadFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  };

  return (
    <section className="custom-card p-8 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-violet-400">
          cloud_upload
        </span>
        <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
          Quick Upload
        </h3>
      </div>

      <div
        onClick={() => !uploading && fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`group border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center bg-white/[0.02] transition-all ${
          uploading
            ? "border-violet-500/50 cursor-not-allowed"
            : "border-white/10 hover:border-violet-500/50 cursor-pointer"
        }`}
      >
        <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-slate-400 group-hover:text-violet-400">
            {uploading ? "hourglass_empty" : "upload"}
          </span>
        </div>

        {uploading ? (
          <>
            <p className="text-slate-300 font-medium">
              Uploading... {progress}%
            </p>
            <div className="w-full max-w-xs mt-3 bg-slate-800 rounded-full h-1.5">
              <div
                className="bg-violet-500 h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <p className="text-slate-300 font-medium">
              Drag & drop or{" "}
              <span className="text-violet-400 underline decoration-2 underline-offset-4">
                browse
              </span>
            </p>
            <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">
              Multiple files • max 100 MB each
            </p>
          </>
        )}

        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {results.length > 0 && (
        <div className="mt-4 space-y-1">
          {results.map((r, i) => (
            <div
              key={i}
              className={`text-xs flex items-center gap-2 ${
                r.ok ? "text-emerald-400" : "text-red-400"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {r.ok ? "check_circle" : "error"}
              </span>
              <span className="truncate">{r.name}</span>
              {!r.ok && <span className="text-red-500">— {r.message}</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default QuickUploadCard;
