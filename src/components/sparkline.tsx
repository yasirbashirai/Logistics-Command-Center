"use client";

export default function Sparkline({
  values,
  width = 80,
  height = 24,
  color = "currentColor",
  showDot = true,
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  showDot?: boolean;
}) {
  if (values.length === 0) {
    return (
      <svg width={width} height={height} className="opacity-20">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke={color} strokeDasharray="2 2" />
      </svg>
    );
  }
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={areaPath} fill={color} fillOpacity="0.1" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {showDot && <circle cx={lastX} cy={lastY} r="2" fill={color} />}
    </svg>
  );
}
