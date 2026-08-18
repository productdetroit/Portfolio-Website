/* K2b "system ring" brand mark from the TopHand brand guide: the farmer at
   the center on a gold hub, the farm's domains orbiting on a gold ring —
   green discs on light backgrounds, paper discs on dark. Pure SVG so it
   server-renders at any size. Per the guide: never below 28px (favicon uses
   the simplified single-farmer app icon instead). */

const GOLD = "#E0A82E";
const GREEN = "#1F3D2B";
const PAPER = "#F7F4EC";

type IconName = "weather" | "seed" | "stock" | "team" | "equipment" | "task" | "farmer";

export function DomainIcon({ name, col }: { name: IconName; col: string }) {
  const P = {
    fill: "none",
    stroke: col,
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;

  switch (name) {
    case "weather":
      return (
        <>
          <circle cx={8} cy={8} r={3.4} {...P} />
          <path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.5 3.5l1 1M11.5 11.5l1 1" {...P} />
          <path d="M9 17.5h8a3.2 3.2 0 0 0 .3-6.4A4.3 4.3 0 0 0 9 12a3 3 0 0 0 0 5.5z" {...P} fill={col} stroke={col} />
        </>
      );
    case "seed":
      return (
        <>
          <path d="M12 21v-8" {...P} />
          <path d="M12 14c-1-4-4-5-7-5 0 4 3 5 7 5z" {...P} fill={col} />
          <path d="M12 12c1-5 4-6 8-6 0 5-4 6-8 6z" {...P} fill="none" />
          <path d="M8 21h8" {...P} />
        </>
      );
    case "stock":
      return (
        <>
          <path
            fill={col}
            stroke={col}
            strokeWidth={0.5}
            strokeLinejoin="round"
            d="M2.5 10.5L2.4 11.8Q2.4 12.4 3 12.4L4.2 12.4Q4.8 12.4 5 13L5.2 15L5.2 19.6L6.6 19.6L6.6 15.4L15 15.6L15 19.6L16.4 19.6L16.6 15.2Q18.4 15 18.7 13L19 10.6Q19.1 9.8 18.4 9.9L6.8 9.5Q5.2 9.4 4.6 10L4 10.4L3.6 11Q3.2 11.2 2.5 10.5Z"
          />
          <path d="M7.6 15.6V19.6" stroke={col} strokeWidth={1.5} strokeLinecap="round" />
          <path d="M14 15.6V19.6" stroke={col} strokeWidth={1.5} strokeLinecap="round" />
          <path d="M4.4 9.9Q4.2 8.9 5 8.7" fill="none" stroke={col} strokeWidth={1.2} strokeLinecap="round" />
          <path d="M5.6 9.4Q6.3 8.7 7 9" fill="none" stroke={col} strokeWidth={1.2} strokeLinecap="round" />
          <circle cx={3.7} cy={10.9} r={0.5} fill={GOLD} stroke="none" />
          <path d="M12.6 15.6q1.4.1 1.4 1.3" fill="none" stroke={col} strokeWidth={1.3} strokeLinecap="round" />
          <path d="M18.9 10.7Q19.9 12.2 19.4 15" fill="none" stroke={col} strokeWidth={1.4} strokeLinecap="round" />
          <path d="M19.4 15q-.6.8 0 1.6q.6-.8 0-1.6z" fill={col} stroke={col} />
        </>
      );
    case "farmer":
      return (
        <>
          <path d="M4 8.9C4 8.1 7.6 7.5 12 7.5s8 .6 8 1.4-3.6 1.5-8 1.5S4 9.7 4 8.9z" {...P} fill={col} />
          <path d="M8.2 8.5C8.2 5.7 9.6 4 12 4s3.8 1.7 3.8 4.5" {...P} />
          <circle cx={12} cy={12.3} r={2.7} {...P} />
          <path d="M6 20.6c0-3.4 2.7-5.3 6-5.3s6 1.9 6 5.3" {...P} />
          <path d="M10.5 15.6l.5 5M13.5 15.6l-.5 5" {...P} strokeWidth={1.3} />
        </>
      );
    case "team":
      return (
        <>
          <circle cx={8} cy={8} r={2.4} {...P} />
          <path d="M3.5 19c0-3.2 2-4.9 4.5-4.9" {...P} />
          <circle cx={16} cy={8} r={2.4} {...P} />
          <path d="M20.5 19c0-3.2-2-4.9-4.5-4.9" {...P} />
          <path d="M8.2 19c0-3.6 1.7-5.4 3.8-5.4s3.8 1.8 3.8 5.4" {...P} />
        </>
      );
    case "equipment":
      return (
        <g transform="translate(0 -3.2)">
          <circle cx={7} cy={16.8} r={4.6} {...P} />
          <circle cx={7} cy={16.8} r={1.3} {...P} fill={col} />
          <circle cx={18.6} cy={18.4} r={2.9} {...P} />
          <circle cx={18.6} cy={18.4} r={0.9} {...P} fill={col} />
          <path d="M12.4 12.6h3.4c.6 0 1 .4 1 1v2.5h-3.6" {...P} />
          <path d="M16.8 16h1.8" {...P} />
          <path d="M11 16l1.4-3.4" {...P} />
          <path d="M11.1 12h2.4" {...P} strokeWidth={1.8} />
          <path d="M7 12.3l.9-2.8h2.7l.8 2.8" {...P} />
        </g>
      );
    case "task":
      return (
        <>
          <rect x={4} y={3} width={16} height={18} rx={2.5} {...P} />
          <path d="M8 9l1.5 1.5L13 7" {...P} stroke={col} />
          <path d="M8 15l1.5 1.5L13 13" {...P} />
          <path d="M15.5 9H17M15.5 15H17" {...P} />
        </>
      );
  }
}

const CHIP_POS: [number, number][] = [
  [33, 10],
  [52.9, 21.5],
  [52.9, 44.5],
  [33, 56],
  [13.1, 44.5],
  [13.1, 21.5],
];
const ORBIT: IconName[] = ["weather", "seed", "stock", "team", "equipment", "task"];

export default function BrandMark({ size, bg }: { size: number; bg: "light" | "dark" }) {
  const chipFill = bg === "dark" ? PAPER : GREEN;
  const iconCol = bg === "dark" ? GREEN : PAPER;
  const iconScale = 14 / 24;

  return (
    <svg width={size} height={size} viewBox="0 0 66 66" aria-hidden="true" style={{ flex: "none", display: "block" }}>
      <circle cx={33} cy={33} r={23} fill="none" stroke={GOLD} strokeWidth={2.4} />
      {ORBIT.map((name, i) => {
        const [cx, cy] = CHIP_POS[i];
        return (
          <g key={name}>
            <circle cx={cx} cy={cy} r={9.6} fill={chipFill} />
            <g transform={`translate(${cx - 7} ${cy - 7}) scale(${iconScale})`}>
              <DomainIcon name={name} col={iconCol} />
            </g>
          </g>
        );
      })}
      <circle cx={33} cy={33} r={12} fill={GOLD} />
      <g transform={`translate(22 22) scale(${22 / 24})`}>
        <DomainIcon name="farmer" col={GREEN} />
      </g>
    </svg>
  );
}
