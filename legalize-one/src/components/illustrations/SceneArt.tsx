import { useId, type ReactNode } from 'react'
import type { SceneArtVariant } from '@/types/media'

interface SceneArtProps {
  variant: SceneArtVariant
  className?: string
  title?: string
}

/**
 * Ilustração arquitetônica vetorial usada como fallback de fotos.
 * Cada variação reproduz o clima de um ambiente (fachada, sala, cozinha...)
 * com a paleta da marca, para que o layout nunca exiba imagem quebrada.
 */
export function SceneArt({ variant, className, title }: SceneArtProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const id = (name: string) => `${uid}-${name}`
  const url = (name: string) => `url(#${id(name)})`

  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={title ?? 'Ilustração do ambiente'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={id('dusk')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#081a2d" />
          <stop offset="0.55" stopColor="#23385a" />
          <stop offset="0.82" stopColor="#8a6a5c" />
          <stop offset="1" stopColor="#d59a63" />
        </linearGradient>
        <linearGradient id={id('day')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fa5d6" />
          <stop offset="0.7" stopColor="#bcd8ee" />
          <stop offset="1" stopColor="#eef3f4" />
        </linearGradient>
        <linearGradient id={id('glow')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe2a8" />
          <stop offset="1" stopColor="#e79a4b" />
        </linearGradient>
        <linearGradient id={id('glass')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2e4a66" />
          <stop offset="0.5" stopColor="#6f93b3" />
          <stop offset="1" stopColor="#2b4560" />
        </linearGradient>
        <linearGradient id={id('water')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4fc3d6" />
          <stop offset="1" stopColor="#0f6f8f" />
        </linearGradient>
        <linearGradient id={id('waterNight')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3fb5c9" />
          <stop offset="1" stopColor="#0a3d5c" />
        </linearGradient>
        <linearGradient id={id('wood')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a5a35" />
          <stop offset="0.5" stopColor="#b07a4c" />
          <stop offset="1" stopColor="#7a4d2c" />
        </linearGradient>
        <linearGradient id={id('floor')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d8cbb6" />
          <stop offset="1" stopColor="#efe7da" />
        </linearGradient>
        <linearGradient id={id('wall')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe9df" />
          <stop offset="1" stopColor="#e2d8c8" />
        </linearGradient>
        <linearGradient id={id('sideWall')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#cfc3b0" />
          <stop offset="1" stopColor="#e6ddcf" />
        </linearGradient>
        <linearGradient id={id('view')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9cde6" />
          <stop offset="0.62" stopColor="#dfeef2" />
          <stop offset="0.63" stopColor="#6e9a62" />
          <stop offset="1" stopColor="#3f6b3f" />
        </linearGradient>
        <linearGradient id={id('sea')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0a2a4a" />
          <stop offset="0.6" stopColor="#135a7a" />
          <stop offset="1" stopColor="#1c8aa0" />
        </linearGradient>
        <radialGradient id={id('lamp')} cx="0.5" cy="0.3" r="0.6">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('vignette')} cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      {renderVariant(variant, url)}

      <rect width="1600" height="1000" fill={url('vignette')} />
    </svg>
  )
}

type UrlFn = (name: string) => string

function renderVariant(variant: SceneArtVariant, url: UrlFn): ReactNode {
  switch (variant) {
    case 'facade-night':
      return <Facade url={url} night />
    case 'facade-day':
      return <Facade url={url} />
    case 'townhouse':
      return <Facade url={url} tall />
    case 'apartment-tower':
      return <Tower url={url} />
    case 'living':
      return <Living url={url} />
    case 'kitchen':
      return <Kitchen url={url} />
    case 'suite':
      return <Suite url={url} />
    case 'gourmet':
      return <Gourmet url={url} />
    case 'pool':
      return <PoolScene url={url} />
    case 'coast':
      return <Coast url={url} />
  }
}

/* ------------------------------------------------------------------ */
/* Elementos compartilhados                                            */
/* ------------------------------------------------------------------ */

function Palm({ x, y, scale = 1, color = '#0b1c24' }: { x: number; y: number; scale?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill={color}>
      <path d="M-6 0 C-4 -120 -14 -240 4 -360 L12 -360 C0 -240 10 -120 8 0 Z" />
      <g transform="translate(8 -360)">
        <path d="M0 0 C-60 -40 -130 -30 -180 20 C-120 -10 -60 -5 0 10 Z" />
        <path d="M0 0 C60 -45 140 -35 190 15 C120 -12 60 -2 0 10 Z" />
        <path d="M0 0 C-30 -70 -90 -110 -150 -110 C-90 -80 -40 -40 -4 6 Z" />
        <path d="M0 0 C30 -75 95 -115 160 -105 C95 -80 45 -40 4 6 Z" />
        <path d="M0 0 C-50 10 -110 60 -130 120 C-90 70 -40 30 0 12 Z" />
        <path d="M0 0 C50 10 110 60 125 125 C85 72 40 32 0 12 Z" />
      </g>
    </g>
  )
}

function Sofa({ x, y, w, color = '#cfc6b8', shadow = '#a89e8f' }: { x: number; y: number; w: number; color?: string; shadow?: string }) {
  return (
    <g>
      <ellipse cx={x + w / 2} cy={y + 150} rx={w * 0.55} ry={22} fill="#000" opacity="0.12" />
      <rect x={x} y={y} width={w} height={90} rx={22} fill={shadow} />
      <rect x={x + 30} y={y + 58} width={w - 60} height={70} rx={16} fill={color} />
      <rect x={x - 10} y={y + 30} width={60} height={110} rx={20} fill={shadow} />
      <rect x={x + w - 50} y={y + 30} width={60} height={110} rx={20} fill={shadow} />
      <rect x={x + 60} y={y + 14} width={110} height={70} rx={14} fill="#e9e1d3" />
      <rect x={x + w - 170} y={y + 14} width={110} height={70} rx={14} fill="#b89b72" />
    </g>
  )
}

function Plant({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-40 0 L40 0 L30 90 L-30 90 Z" fill="#3b3a37" />
      <g fill="#3f6b45">
        <ellipse cx="-40" cy="-60" rx="22" ry="70" transform="rotate(-30 -40 -60)" />
        <ellipse cx="30" cy="-80" rx="22" ry="80" transform="rotate(25 30 -80)" />
        <ellipse cx="-5" cy="-110" rx="20" ry="90" />
        <ellipse cx="60" cy="-30" rx="18" ry="55" transform="rotate(60 60 -30)" />
      </g>
    </g>
  )
}

function Pendant({ x, y, len }: { x: number; y: number; len: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + len} stroke="#3a3a3a" strokeWidth="3" />
      <path d={`M${x - 40} ${y + len + 40} Q${x} ${y + len - 20} ${x + 40} ${y + len + 40} Z`} fill="#1d2833" />
      <ellipse cx={x} cy={y + len + 42} rx={34} ry={8} fill="#ffe3b0" />
      <circle cx={x} cy={y + len + 120} r={150} fill="#ffd79a" opacity="0.12" />
    </g>
  )
}

/** Caixa do cômodo em perspectiva de um ponto (parede do fundo + laterais + piso). */
function Room({ url, children, window: showWindow = true }: { url: UrlFn; children?: ReactNode; window?: boolean }) {
  return (
    <g>
      <rect width="1600" height="1000" fill={url('wall')} />
      <polygon points="0,0 1600,0 1300,120 300,120" fill="#f6f2ec" />
      <polygon points="0,0 300,120 300,640 0,1000" fill={url('sideWall')} />
      <polygon points="1600,0 1300,120 1300,640 1600,1000" fill={url('sideWall')} />
      <polygon points="0,1000 1600,1000 1300,640 300,640" fill={url('floor')} />
      {[0.2, 0.4, 0.6, 0.8].map((t) => (
        <line
          key={t}
          x1={300 + 1000 * t}
          y1={640}
          x2={1600 * t}
          y2={1000}
          stroke="#c9b99f"
          strokeWidth="1.5"
          opacity="0.5"
        />
      ))}
      {showWindow && (
        <g>
          <rect x="560" y="170" width="700" height="440" fill={url('view')} />
          <Palm x={760} y={600} scale={0.55} color="#2f5436" />
          <Palm x={1110} y={610} scale={0.7} color="#294a31" />
          <rect x="560" y="170" width="700" height="440" fill="none" stroke="#2a2f35" strokeWidth="10" />
          <line x1="793" y1="170" x2="793" y2="610" stroke="#2a2f35" strokeWidth="8" />
          <line x1="1027" y1="170" x2="1027" y2="610" stroke="#2a2f35" strokeWidth="8" />
          <rect x="560" y="170" width="700" height="440" fill="#fff" opacity="0.08" />
        </g>
      )}
      {children}
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* Cenas                                                               */
/* ------------------------------------------------------------------ */

function Facade({ url, night = false, tall = false }: { url: UrlFn; night?: boolean; tall?: boolean }) {
  const win = night ? url('glow') : url('glass')
  const slab = night ? '#e9e4dc' : '#f4f1ec'
  const body = night ? '#1c2a36' : '#e7e2da'
  const upperY = tall ? 230 : 300
  return (
    <g>
      <rect width="1600" height="1000" fill={night ? url('dusk') : url('day')} />
      {night && (
        <g fill="#fff" opacity="0.6">
          <circle cx="220" cy="90" r="1.6" />
          <circle cx="480" cy="60" r="1.2" />
          <circle cx="1380" cy="120" r="1.5" />
          <circle cx="1180" cy="50" r="1.1" />
        </g>
      )}
      <Palm x={140} y={760} scale={1.25} color={night ? '#07131c' : '#2f5a3b'} />
      <Palm x={1480} y={740} scale={1.1} color={night ? '#07131c' : '#2f5a3b'} />
      <rect x="0" y="720" width="1600" height="280" fill={night ? '#0e1d25' : '#5b8a4f'} />

      {/* Volume superior */}
      <rect x="560" y={upperY - 24} width="820" height="26" fill={slab} />
      <rect x="600" y={upperY} width="760" height="210" fill={body} />
      <rect x="640" y={upperY + 30} width="300" height="160" fill={win} />
      <rect x="980" y={upperY + 30} width="340" height="160" fill={win} />
      <g stroke={night ? '#2a3440' : '#9aa7b3'} strokeWidth="5">
        {[700, 760, 820, 880, 1040, 1100, 1160, 1220, 1280].map((x) => (
          <line key={x} x1={x} y1={upperY + 30} x2={x} y2={upperY + 190} />
        ))}
      </g>
      <rect x="600" y={upperY + 190} width="760" height="10" fill={night ? '#9a8a74' : '#c8c0b2'} />
      <rect x="600" y={upperY + 200} width="760" height="6" fill="#fff" opacity="0.5" />

      {/* Volume térreo */}
      <rect x="260" y="500" width="1180" height="22" fill={slab} />
      <rect x="300" y="522" width="1100" height="200" fill={body} />
      <rect x="330" y="540" width="1040" height="182" fill={win} />
      <g stroke={night ? '#3a2e22' : '#51677c'} strokeWidth="6">
        {[460, 590, 720, 850, 980, 1110, 1240].map((x) => (
          <line key={x} x1={x} y1="540" x2={x} y2="722" />
        ))}
      </g>
      <rect x="260" y="522" width="60" height="200" fill={url('wood')} />
      {night && <rect x="330" y="540" width="1040" height="182" fill="#fff4d6" opacity="0.18" />}

      {/* Piscina e deck */}
      <polygon points="120,780 1480,780 1600,1000 0,1000" fill={night ? '#2a2521' : '#d9cdb7'} />
      <polygon points="260,810 1340,810 1420,960 180,960" fill={night ? url('waterNight') : url('water')} />
      <polygon points="330,820 1240,820 1250,850 320,850" fill="#fff" opacity={night ? 0.25 : 0.35} />
      {night && <polygon points="420,830 1100,830 1160,950 380,950" fill="#ffd18a" opacity="0.18" />}
      <g fill={night ? '#e8e0d2' : '#fbfaf7'}>
        <rect x="1180" y="740" width="120" height="16" rx="6" />
        <rect x="1330" y="740" width="120" height="16" rx="6" />
      </g>
    </g>
  )
}

function Tower({ url }: { url: UrlFn }) {
  const floors = Array.from({ length: 11 }, (_, i) => i)
  return (
    <g>
      <rect width="1600" height="1000" fill={url('day')} />
      <rect x="240" y="420" width="220" height="600" fill="#c9d3dc" />
      <rect x="1180" y="360" width="260" height="660" fill="#d4dce3" />
      <rect x="560" y="60" width="520" height="960" fill="#ece7df" />
      {floors.map((i) => (
        <g key={i}>
          <rect x="560" y={100 + i * 82} width="520" height="54" fill={url('glass')} />
          <rect x="540" y={150 + i * 82} width="560" height="12" fill="#faf8f4" />
          <line x1="560" y1={128 + i * 82} x2="1080" y2={128 + i * 82} stroke="#fff" strokeWidth="2" opacity="0.4" />
        </g>
      ))}
      <rect x="760" y="60" width="18" height="960" fill={url('wood')} />
      <Palm x={420} y={1000} scale={1.2} color="#2c5238" />
      <Palm x={1260} y={1000} scale={1} color="#2c5238" />
    </g>
  )
}

function Living({ url }: { url: UrlFn }) {
  return (
    <Room url={url}>
      <polygon points="420,760 1180,760 1300,900 300,900" fill="#d7ccbb" />
      <Sofa x={470} y={650} w={660} />
      <rect x="640" y="820" width="320" height="24" rx="8" fill={url('wood')} />
      <rect x="660" y="844" width="16" height="40" fill="#5a3b22" />
      <rect x="924" y="844" width="16" height="40" fill="#5a3b22" />
      <Plant x={250} y={820} s={1.1} />
      <rect x="1330" y="520" width="140" height="300" rx="10" fill="#1f2f3f" opacity="0.9" />
      <Pendant x={800} y={0} len={120} />
      <rect width="1600" height="1000" fill={url('lamp')} />
    </Room>
  )
}

function Kitchen({ url }: { url: UrlFn }) {
  return (
    <Room url={url} window={false}>
      <rect x="300" y="150" width="1000" height="170" fill="#243a52" />
      {[400, 500, 600, 700, 800, 900, 1000, 1100, 1200].map((x) => (
        <line key={x} x1={x} y1="150" x2={x} y2="320" stroke="#1a2c40" strokeWidth="3" />
      ))}
      <rect x="300" y="320" width="1000" height="180" fill="#e8e1d6" />
      <rect x="640" y="340" width="320" height="140" fill={url('view')} />
      <rect x="640" y="340" width="320" height="140" fill="none" stroke="#2a2f35" strokeWidth="6" />
      <rect x="300" y="500" width="1000" height="18" fill="#f7f4ef" />
      <rect x="300" y="518" width="1000" height="122" fill="#243a52" />
      {/* Ilha */}
      <rect x="360" y="700" width="880" height="34" rx="4" fill="#f5f2ed" />
      <rect x="380" y="734" width="840" height="170" fill={url('wood')} />
      {[520, 700, 880, 1060].map((x) => (
        <g key={x}>
          <rect x={x} y="820" width="70" height="16" rx="6" fill="#2a2a2a" />
          <line x1={x + 10} y1="836" x2={x} y2="930" stroke="#2a2a2a" strokeWidth="6" />
          <line x1={x + 60} y1="836" x2={x + 70} y2="930" stroke="#2a2a2a" strokeWidth="6" />
        </g>
      ))}
      <Pendant x={600} y={0} len={300} />
      <Pendant x={800} y={0} len={300} />
      <Pendant x={1000} y={0} len={300} />
    </Room>
  )
}

function Suite({ url }: { url: UrlFn }) {
  return (
    <Room url={url} window={false}>
      <rect x="1060" y="150" width="200" height="490" fill={url('view')} />
      <rect x="1040" y="140" width="40" height="510" fill="#e9e1d4" />
      <rect x="1250" y="140" width="40" height="510" fill="#e9e1d4" />
      <rect x="440" y="360" width="600" height="280" fill={url('wood')} />
      {/* Cama */}
      <polygon points="470,610 1010,610 1150,880 330,880" fill="#f3efe8" />
      <polygon points="330,880 1150,880 1150,930 330,930" fill="#d8d0c2" />
      <polygon points="420,720 1060,720 1150,880 330,880" fill="#c8b79d" />
      <rect x="520" y="560" width="200" height="80" rx="18" fill="#fbf9f5" />
      <rect x="760" y="560" width="200" height="80" rx="18" fill="#fbf9f5" />
      {[330, 1150].map((x) => (
        <g key={x}>
          <rect x={x === 330 ? 250 : 1170} y="700" width="120" height="110" rx="6" fill="#6d4a2e" />
          <line x1={x === 330 ? 310 : 1230} y1="590" x2={x === 330 ? 310 : 1230} y2="700" stroke="#333" strokeWidth="4" />
          <path d={`M${x === 330 ? 270 : 1190} 600 L${x === 330 ? 350 : 1270} 600 L${x === 330 ? 335 : 1255} 555 L${x === 330 ? 285 : 1205} 555 Z`} fill="#f0dcb4" />
        </g>
      ))}
      <rect width="1600" height="1000" fill={url('lamp')} opacity="0.7" />
    </Room>
  )
}

function Gourmet({ url }: { url: UrlFn }) {
  return (
    <g>
      <Room url={url} window={false}>
        <rect x="300" y="120" width="1000" height="520" fill={url('view')} />
        <Palm x={520} y={640} scale={0.9} color="#2c5238" />
        <Palm x={1180} y={640} scale={0.75} color="#335d3f" />
        {[380, 540, 700, 860, 1020, 1180].map((x) => (
          <line key={x} x1={x} y1="120" x2={x} y2="640" stroke="#2a2f35" strokeWidth="8" />
        ))}
        {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((t) => (
          <line key={t} x1={1600 * t} y1={0} x2={300 + 1000 * t} y2={120} stroke="#b07a4c" strokeWidth="14" />
        ))}
        <polygon points="0,560 300,500 300,640 0,760" fill="#2d3b48" />
        <polygon points="0,540 300,486 300,500 0,560" fill="#efebe5" />
        <rect x="560" y="740" width="480" height="26" rx="6" fill={url('wood')} />
        <rect x="590" y="766" width="16" height="120" fill="#5a3b22" />
        <rect x="994" y="766" width="16" height="120" fill="#5a3b22" />
        {[600, 720, 840, 960].map((x) => (
          <rect key={x} x={x} y="680" width="70" height="60" rx="10" fill="#e4dccf" />
        ))}
      </Room>
    </g>
  )
}

function PoolScene({ url }: { url: UrlFn }) {
  return (
    <g>
      <rect width="1600" height="1000" fill={url('day')} />
      <Palm x={1360} y={640} scale={1.1} color="#2f5a3b" />
      <Palm x={1500} y={660} scale={0.9} color="#2f5a3b" />
      <rect x="0" y="560" width="1600" height="100" fill="#5b8a4f" />
      <rect x="0" y="180" width="560" height="480" fill="#ece7df" />
      <rect x="40" y="240" width="480" height="380" fill={url('glass')} />
      <rect x="0" y="160" width="600" height="24" fill="#fbfaf7" />
      <polygon points="0,640 1600,640 1600,1000 0,1000" fill={url('wood')} />
      {[680, 740, 800, 860, 920, 980].map((y) => (
        <line key={y} x1="0" y1={y} x2="1600" y2={y} stroke="#6e4527" strokeWidth="2" opacity="0.5" />
      ))}
      <polygon points="380,690 1380,690 1560,960 200,960" fill={url('water')} />
      <polygon points="380,690 1380,690 1390,712 372,712" fill="#e9f7f9" />
      <path d="M340 800 Q520 780 700 805 T1060 800 T1420 810" stroke="#fff" strokeWidth="4" fill="none" opacity="0.45" />
      <path d="M300 880 Q480 860 660 885 T1020 880 T1480 890" stroke="#fff" strokeWidth="4" fill="none" opacity="0.35" />
      <g fill="#fbfaf7">
        <rect x="620" y="610" width="170" height="20" rx="8" />
        <rect x="840" y="610" width="170" height="20" rx="8" />
      </g>
    </g>
  )
}

function Coast({ url }: { url: UrlFn }) {
  const buildings = [
    [860, 520, 40, 180],
    [910, 470, 46, 230],
    [965, 500, 38, 200],
    [1010, 430, 52, 270],
    [1070, 470, 44, 230],
    [1120, 400, 56, 300],
    [1185, 450, 48, 250],
    [1240, 380, 60, 320],
    [1305, 430, 50, 270],
    [1360, 360, 62, 340],
    [1430, 420, 54, 280],
    [1490, 350, 66, 350],
    [1560, 400, 60, 300],
  ]
  return (
    <g>
      <rect width="1600" height="1000" fill={url('sea')} />
      <path d="M760 1000 C820 820 900 700 1080 620 C1250 545 1450 560 1600 520 L1600 1000 Z" fill="#e8d7b5" />
      <path d="M800 1000 C860 830 940 720 1100 650 C1260 580 1450 590 1600 560 L1600 1000 Z" fill="#2c4a3a" />
      <path d="M760 1000 C820 820 900 700 1080 620 C1250 545 1450 560 1600 520" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="6" fill="none" />
      {buildings.map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x} y={y + 160} width={w} height={h} fill={i % 2 ? '#dfe3e6' : '#c9d0d6'} />
          {Array.from({ length: Math.floor(h / 22) }, (_, r) => (
            <rect key={r} x={x + 5} y={y + 170 + r * 22} width={w - 10} height={6} fill="#6f8aa3" opacity="0.55" />
          ))}
        </g>
      ))}
    </g>
  )
}
