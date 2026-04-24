const TOTAL_GB = 1;

const CATEGORIES = [
  { label: "Images", gb: 0.43, color: "#8b5cf6" }, // ~430 MB
  { label: "Videos", gb: 0.25, color: "#10b981" }, // ~250 MB
  { label: "Documents", gb: 0.1, color: "#f59e0b" }, // ~100 MB
];

const usedGB = CATEGORIES.reduce((sum, cat) => sum + cat.gb, 0); // 0.78
const freeGB = +(TOTAL_GB - usedGB).toFixed(2); // 0.22
const usedPct = +((usedGB / TOTAL_GB) * 100).toFixed(1); // 78.0%

// Helper: format display — show MB if < 1 GB for readability
function fmt(gb) {
  if (gb < 1) return `${Math.round(gb * 1000)} MB`;
  return `${gb.toFixed(2)} GB`;
}

// ─── Donut helpers ────────────────────────────────────────────────────────────
const CX = 60,
  CY = 60,
  RADIUS = 46,
  STROKE_WIDTH = 9;
const GAP_DEGREES = 3;

function getPoint(angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + RADIUS * Math.cos(rad), y: CY + RADIUS * Math.sin(rad) };
}

function arcPath(startDeg, endDeg) {
  const start = getPoint(startDeg);
  const end = getPoint(endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function buildArcs() {
  let cursor = 0;
  return CATEGORIES.map((cat, index) => {
    const span = (cat.gb / TOTAL_GB) * 360;
    const isFirst = index === 0;
    const isLast = index === CATEGORIES.length - 1;
    const startDeg = cursor + (isFirst ? 0 : GAP_DEGREES / 2);
    const endDeg = cursor + span - (isLast ? 0 : GAP_DEGREES / 2);
    cursor += span;
    return { ...cat, startDeg, endDeg };
  });
}

const ARCS = buildArcs();

// ─── Component ────────────────────────────────────────────────────────────────
export default function StorageHealth() {
  return (
    <div className="bg-[#0f0f17] border border-[#1a1a28] rounded-[14px] p-6 hover:border-violet-500/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-[15px] font-bold text-white"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Storage Health
        </h3>
        <span className="text-[10px] font-semibold text-[#6366f1] bg-[#6366f115] border border-[#6366f122] px-2.5 py-1 rounded-full uppercase tracking-wide">
          Enterprise
        </span>
      </div>

      {/* Donut chart */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative" style={{ width: 170, height: 170 }}>
          <svg viewBox="0 0 120 120" width="170" height="170">
            {/* Grey track */}
            <circle
              cx={CX}
              cy={CY}
              r={RADIUS}
              fill="none"
              stroke="#1a1a28"
              strokeWidth={STROKE_WIDTH}
            />
            {/* Coloured arcs */}
            {ARCS.map((arc) => (
              <path
                key={arc.label}
                d={arcPath(arc.startDeg, arc.endDeg)}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* Centre label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-[28px] font-black text-white leading-none"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {usedPct}%
            </span>
            <span className="text-[9px] font-semibold text-[#44446a] uppercase tracking-[1.3px] mt-1">
              Allocated
            </span>
          </div>
        </div>

        {/* Used / total */}
        <p className="text-[13px] text-[#44446a] mt-3">
          <span
            className="text-[16px] font-black text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {fmt(usedGB)}
          </span>{" "}
          / {TOTAL_GB} GB used
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#1a1a28] mb-5" />

      {/* Category legend */}
      <div className="flex flex-col gap-3.5 mb-5">
        {CATEGORIES.map((cat) => (
          <div key={cat.label} className="flex items-center gap-3">
            {/* Colour dot */}
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                background: cat.color,
                boxShadow: `0 0 5px ${cat.color}55`,
              }}
            />
            {/* Name */}
            <span className="text-[13px] text-[#8888aa] flex-1">
              {cat.label}
            </span>
            {/* Mini bar */}
            <div
              className="rounded-full overflow-hidden"
              style={{ width: 60, height: 3, background: "#1a1a28" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(cat.gb / usedGB) * 100}%`,
                  background: cat.color,
                }}
              />
            </div>
            {/* Size */}
            <span
              className="text-[13px] font-semibold text-white tabular-nums"
              style={{ width: 54, textAlign: "right" }}
            >
              {fmt(cat.gb)}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#1a1a28] mb-5" />

      {/* Remaining available */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10.5px] font-semibold text-[#44446a] uppercase tracking-[0.9px] mb-1.5">
            Remaining Available
          </p>
          <p
            className="text-[26px] font-black leading-none"
            style={{
              fontFamily: "'Syne', sans-serif",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {fmt(freeGB)} <span style={{ fontSize: 13 }}>free</span>
          </p>
        </div>

        {/* 10-bar indicator */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-end gap-[3px]" style={{ height: 28 }}>
            {Array.from({ length: 10 }).map((_, i) => {
              const freeBars = Math.round((freeGB / TOTAL_GB) * 10);
              return (
                <div
                  key={i}
                  className="w-1.5 rounded-full"
                  style={{
                    height: 8 + i * 2,
                    background: i < freeBars ? "#6366f1" : "#1a1a28",
                  }}
                />
              );
            })}
          </div>
          <span className="text-[10px] text-[#44446a]">
            {((freeGB / TOTAL_GB) * 100).toFixed(0)}% free
          </span>
        </div>
      </div>
    </div>
  );
}
