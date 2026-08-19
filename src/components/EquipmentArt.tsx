type Props = {
  slug: string;
  className?: string;
};

/**
 * Ilustração técnica (line-art) usada como placeholder enquanto os
 * renders reais de cada equipamento não são adicionados em
 * public/images/*.png. Ver README para instruções de substituição.
 */
export default function EquipmentArt({ slug, className }: Props) {
  const common = "h-full w-full";
  switch (slug) {
    case "tanque":
      return <TanqueArt className={className ?? common} />;
    case "flotador":
      return <FlotadorArt className={className ?? common} />;
    case "motor-compressor":
      return <MotorCompressorArt className={className ?? common} />;
    case "air-cooler":
      return <AirCoolerArt className={className ?? common} />;
    case "forno":
      return <FornoArt className={className ?? common} />;
    case "vaso-peneira":
      return <VasoPeneiraArt className={className ?? common} />;
    default:
      return <TanqueArt className={className ?? common} />;
  }
}

const strokeMain = "rgba(255,255,255,0.42)";
const strokeSoft = "rgba(255,255,255,0.16)";
const strokeAccent = "#D2F51E";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <line x1="18" y1="330" x2="462" y2="330" stroke={strokeSoft} strokeWidth="1" />
      {children}
    </>
  );
}

function TanqueArt({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 480 360" className={className} fill="none" aria-hidden>
      <Frame>
        <ellipse cx="240" cy="94" rx="72" ry="16" stroke={strokeMain} strokeWidth="1.5" />
        <path d="M168 94V270" stroke={strokeMain} strokeWidth="1.5" />
        <path d="M312 94V270" stroke={strokeMain} strokeWidth="1.5" />
        <path d="M168 270a72 16 0 0 0 144 0" stroke={strokeMain} strokeWidth="1.5" />
        {[126, 158, 190, 222].map((y) => (
          <path key={y} d={`M168 ${y}a72 16 0 0 0 144 0`} stroke={strokeSoft} strokeWidth="1" />
        ))}
        <path d="M240 78V44" stroke={strokeAccent} strokeWidth="1.5" />
        <circle cx="240" cy="38" r="6" stroke={strokeAccent} strokeWidth="1.5" />
        <path d="M330 130h20M330 130v110M330 240h-18" stroke={strokeSoft} strokeWidth="1" />
        {Array.from({ length: 8 }).map((_, i) => (
          <path key={i} d={`M330 ${140 + i * 12}h14`} stroke={strokeSoft} strokeWidth="1" />
        ))}
        <path d="M150 300h180" stroke={strokeAccent} strokeWidth="1" strokeDasharray="2 4" />
        <path d="M150 296v8M330 296v8" stroke={strokeAccent} strokeWidth="1" />
      </Frame>
    </svg>
  );
}

function FlotadorArt({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 480 360" className={className} fill="none" aria-hidden>
      <Frame>
        <ellipse cx="240" cy="150" rx="120" ry="20" stroke={strokeMain} strokeWidth="1.5" />
        <path d="M120 150V250" stroke={strokeMain} strokeWidth="1.5" />
        <path d="M360 150V250" stroke={strokeMain} strokeWidth="1.5" />
        <path d="M120 250a120 20 0 0 0 240 0" stroke={strokeMain} strokeWidth="1.5" />
        <path d="M100 150h-16M100 150v14M84 164h16" stroke={strokeSoft} strokeWidth="1" />
        <rect x="216" y="66" width="48" height="30" rx="3" stroke={strokeAccent} strokeWidth="1.5" />
        <path d="M240 96V150" stroke={strokeMain} strokeWidth="1.5" />
        <path d="M204 150l72 30M276 150l-72 30" stroke={strokeSoft} strokeWidth="1.2" />
        <path d="M60 210h60" stroke={strokeSoft} strokeWidth="1" />
        <circle cx="54" cy="210" r="6" stroke={strokeSoft} strokeWidth="1" />
      </Frame>
    </svg>
  );
}

function MotorCompressorArt({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 480 360" className={className} fill="none" aria-hidden>
      <Frame>
        <rect x="60" y="240" width="360" height="18" rx="2" stroke={strokeMain} strokeWidth="1.5" />
        <rect x="96" y="196" width="90" height="44" rx="4" stroke={strokeMain} strokeWidth="1.5" />
        <path d="M186 214h30" stroke={strokeSoft} strokeWidth="1.5" />
        <rect x="216" y="204" width="44" height="24" rx="3" stroke={strokeSoft} strokeWidth="1.2" />
        <path d="M260 216h26" stroke={strokeMain} strokeWidth="1.5" />
        <circle cx="330" cy="216" r="40" stroke={strokeAccent} strokeWidth="1.5" />
        <circle cx="330" cy="216" r="6" stroke={strokeAccent} strokeWidth="1.5" />
        <path d="M330 176v-16M290 216h-16" stroke={strokeSoft} strokeWidth="1.2" />
        <path d="M120 196v-16h34v16" stroke={strokeSoft} strokeWidth="1" />
        <path d="M108 240v-20h10v20M126 240v-30h10v30" stroke={strokeSoft} strokeWidth="1" />
      </Frame>
    </svg>
  );
}

function AirCoolerArt({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 480 360" className={className} fill="none" aria-hidden>
      <Frame>
        <rect x="90" y="90" width="300" height="90" rx="4" stroke={strokeMain} strokeWidth="1.5" />
        {[150, 240, 330].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="230" r="34" stroke={strokeAccent} strokeWidth="1.5" />
            <path
              d={`M${cx} 196v68M${cx - 30} 230h60M${cx - 21} 209l42 42M${cx - 21} 251l42-42`}
              stroke={strokeSoft}
              strokeWidth="1"
            />
          </g>
        ))}
        <path d="M90 108h300M90 126h300" stroke={strokeSoft} strokeWidth="1" />
      </Frame>
    </svg>
  );
}

function FornoArt({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 480 360" className={className} fill="none" aria-hidden>
      <Frame>
        <path d="M188 70h104v190a10 10 0 0 1-10 10h-84a10 10 0 0 1-10-10V70Z" stroke={strokeMain} strokeWidth="1.5" />
        <path d="M220 40h40v30h-40z" stroke={strokeAccent} strokeWidth="1.5" />
        {[110, 140, 170, 200, 230].map((y) => (
          <path key={y} d={`M188 ${y}h104`} stroke={strokeSoft} strokeWidth="1" />
        ))}
        <path d="M292 150h40v70h-40" stroke={strokeSoft} strokeWidth="1.2" />
        <path d="M168 270h144" stroke={strokeMain} strokeWidth="1.5" />
        <path d="M180 270v20M300 270v20" stroke={strokeSoft} strokeWidth="1" />
      </Frame>
    </svg>
  );
}

function VasoPeneiraArt({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 480 360" className={className} fill="none" aria-hidden>
      <Frame>
        <path d="M200 60h80v20a40 12 0 0 1-80 0V60Z" stroke={strokeMain} strokeWidth="1.5" />
        <path d="M200 80V240a40 12 0 0 0 80 0V80" stroke={strokeMain} strokeWidth="1.5" />
        <path d="M200 240h80v10a40 12 0 0 1-80 0v-10Z" stroke={strokeMain} strokeWidth="1.5" />
        <path d="M212 95l56 130M268 95l-56 130" stroke={strokeAccent} strokeWidth="1" strokeDasharray="3 4" />
        {[110, 140, 170, 200].map((y) => (
          <path key={y} d={`M200 ${y}h80`} stroke={strokeSoft} strokeWidth="1" />
        ))}
        <circle cx="200" cy="160" r="6" stroke={strokeSoft} strokeWidth="1" />
        <circle cx="280" cy="160" r="6" stroke={strokeSoft} strokeWidth="1" />
      </Frame>
    </svg>
  );
}
