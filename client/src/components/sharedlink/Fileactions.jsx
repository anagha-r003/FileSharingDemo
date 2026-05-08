import { DownloadIcon } from "lucide-react";
import { EyeIcon } from "lucide-react";
import { CopyIcon } from "lucide-react";

const ghostStyle = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.07)",
  color: "#7b7a99",
};

const ghostHover = {
  background: "rgba(26,26,46,1)",
  color: "#f0eeff",
  borderColor: "rgba(255,255,255,0.12)",
};

/**
 * GhostButton – reusable outlined button
 */
function GhostButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
      style={ghostStyle}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, ghostHover)}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, ghostStyle)}
    >
      {icon}
      {label}
    </button>
  );
}

/**
 * FileActions
 * Props:
 *   onDownload {function}
 *   onPreview  {function}
 *   onCopy     {function}
 */
export default function FileActions({ onDownload, onPreview, onCopy }) {
  return (
    <div className="flex items-center gap-3 px-7 py-5 flex-wrap">
      {/* Primary download button */}
      <button
        onClick={onDownload}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: "#7c5cfc" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#8f6dfd";
          e.currentTarget.style.boxShadow = "0 0 0 6px rgba(124,92,252,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#7c5cfc";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <DownloadIcon />
        Download File
      </button>

      <GhostButton
        icon={<EyeIcon />}
        label="Preview in Browser"
        onClick={onPreview}
      />
      <GhostButton icon={<CopyIcon />} label="Copy Link" onClick={onCopy} />
    </div>
  );
}
