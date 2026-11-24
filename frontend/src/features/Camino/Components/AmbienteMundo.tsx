import type { ReactNode } from "react";
import { NIVELES, type MundoTheme } from "./caminoTheme";

interface AmbienteMundoProps {
  mundo: MundoTheme;
  oscuro: boolean;
}

/**
 * Escenografía vectorial de cada mundo.
 *
 * El suelo y el cielo van recortados con las esquinas redondeadas de la banda,
 * y cada nivel recibe un "hito" decorativo en el lado contrario al nodo, para
 * que el entorno acompañe al camino y no se amontone en la parte baja.
 */
export function AmbienteMundo({ mundo, oscuro }: AmbienteMundoProps) {
  const { y, height } = mundo.band;
  const bottom = y + height;
  const skyId = `camino-cielo-${mundo.numero}`;
  const clipId = `camino-banda-${mundo.numero}`;
  const suelo = oscuro ? mundo.groundDark : mundo.ground;
  const nieve = oscuro ? "#cbd5e1" : "#ffffff";
  const piedra = oscuro ? "#334155" : "#cbd5e1";
  const piedraOscura = oscuro ? "#1e293b" : "#94a3b8";

  const hitos = NIVELES.filter((nivel) => nivel.mundo === mundo.numero).map((nivel) => ({
    x: nivel.x < 500 ? 836 : 164,
    y: nivel.y + 76,
    suelo,
  }));

  return (
    <g>
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={oscuro ? mundo.skyDarkTop : mundo.skyTop} />
          <stop offset="100%" stopColor={oscuro ? mundo.skyDarkBottom : mundo.skyBottom} />
        </linearGradient>
        <radialGradient id={`${skyId}-brillo`} cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor={mundo.accent} stopOpacity={oscuro ? 0.22 : 0.16} />
          <stop offset="100%" stopColor={mundo.accent} stopOpacity="0" />
        </radialGradient>
        <clipPath id={clipId}>
          <rect x={20} y={y} width={960} height={height} rx={56} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {/* Cielo del mundo */}
        <rect x={20} y={y} width={960} height={height} fill={`url(#${skyId})`} />
        <rect x={20} y={y} width={960} height={height} fill={`url(#${skyId}-brillo)`} />

        {/* Suelo */}
        <path
          d={`M20 ${bottom - 86} Q 240 ${bottom - 168} 500 ${bottom - 92} T 980 ${bottom - 112} L 980 ${bottom} L 20 ${bottom} Z`}
          fill={suelo}
          opacity={0.9}
        />
        <path
          d={`M20 ${bottom - 54} Q 300 ${bottom - 120} 560 ${bottom - 62} T 980 ${bottom - 74} L 980 ${bottom} L 20 ${bottom} Z`}
          fill={mundo.groundDark}
          opacity={oscuro ? 0.55 : 0.35}
        />

        {mundo.environment === "reino" && (
          <>
            <Nube x={170} y={y + 92} s={1.05} />
            <Nube x={610} y={y + 66} s={0.78} />
            {hitos.map((hito, i) => (
              <Hito key={`reino-${i}`} {...hito}>
                {i === 0 && (
                  <>
                    <Pino x={0} y={-4} s={0.95} />
                    <Pino x={-40} y={8} s={0.7} />
                    <Pino x={40} y={10} s={0.62} />
                  </>
                )}
                {i === 1 && (
                  <Castillo
                    x={0}
                    y={0}
                    s={0.58}
                    acento={mundo.accent}
                    piedra={piedra}
                    piedraOscura={piedraOscura}
                  />
                )}
                {i === 2 && (
                  <>
                    <Pino x={-32} y={4} s={0.75} />
                    <Pino x={28} y={8} s={0.6} />
                    <Banderines x={0} y={-92} acento={mundo.accent} />
                  </>
                )}
              </Hito>
            ))}
          </>
        )}

        {mundo.environment === "valle" && (
          <>
            <Nube x={560} y={y + 88} s={0.75} />
            <Nube x={300} y={y + 68} s={0.6} />
            {hitos.map((hito, i) => (
              <Hito key={`valle-${i}`} {...hito}>
                {i === 0 && <Volcan x={0} y={0} s={0.52} />}
                {i === 1 && (
                  <>
                    <Hielo x={0} y={2} s={0.72} nieve={nieve} />
                    <Rocas x={-56} y={10} piedra={piedraOscura} />
                    <Rocas x={54} y={16} piedra={piedraOscura} />
                  </>
                )}
                {i === 2 && (
                  <>
                    <Senal x={-14} y={0} acento={mundo.accent} />
                    <Rocas x={56} y={12} piedra={piedraOscura} />
                  </>
                )}
              </Hito>
            ))}
          </>
        )}

        {mundo.environment === "isla" && (
          <>
            <circle cx={834} cy={y + 96} r={40} fill="#fde68a" opacity={oscuro ? 0.55 : 0.9} />
            <circle cx={834} cy={y + 96} r={58} fill="#fde68a" opacity={0.18} />
            <Nube x={360} y={y + 70} s={0.7} />
            <Nube x={700} y={y + 100} s={0.85} />
            <Olas y={bottom - 34} acento={mundo.accentSoft} />
            {hitos.map((hito, i) => (
              <Hito key={`isla-${i}`} {...hito}>
                {i === 0 && (
                  <>
                    <Palmera x={-18} y={4} s={0.85} />
                    <Frutas x={44} y={10} />
                  </>
                )}
                {i === 1 && (
                  <>
                    <Arbol x={0} y={0} s={0.92} />
                    <Frutas x={-46} y={12} />
                  </>
                )}
                {i === 2 && (
                  <>
                    <Palmera x={20} y={2} s={0.8} />
                    <Frutas x={-44} y={8} />
                  </>
                )}
              </Hito>
            ))}
          </>
        )}

        {mundo.environment === "templo" && (
          <>
            <Nube x={300} y={y + 82} s={0.65} />
            <Nube x={700} y={y + 64} s={0.8} />
            {hitos.map((hito, i) => (
              <Hito key={`templo-${i}`} {...hito}>
                {i === 0 && (
                  <>
                    <Columna x={-30} y={0} s={0.7} piedra={piedra} />
                    <Columna x={28} y={4} s={0.55} piedra={piedra} />
                    <Farol x={2} y={-6} acento={mundo.accent} />
                  </>
                )}
                {i === 1 && (
                  <Templo
                    x={0}
                    y={0}
                    s={0.55}
                    acento={mundo.accent}
                    piedra={piedra}
                    piedraOscura={piedraOscura}
                  />
                )}
                {i === 2 && (
                  <>
                    <Columna x={-28} y={0} s={0.62} piedra={piedra} />
                    <Columna x={30} y={6} s={0.5} piedra={piedra} />
                    <Farol x={-2} y={-8} acento={mundo.accent} />
                  </>
                )}
              </Hito>
            ))}
          </>
        )}

        {mundo.environment === "cumbre" && (
          <>
            <circle cx={830} cy={y + 96} r={34} fill="#fbbf24" opacity={oscuro ? 0.5 : 0.85} />
            <Nube x={240} y={y + 88} s={0.8} />
            <Nube x={760} y={y + 70} s={0.65} />
            {hitos.map((hito, i) => (
              <Hito key={`cumbre-${i}`} {...hito}>
                {i === 0 && (
                  <>
                    <Montana x={0} y={0} s={0.5} nieve={nieve} piedra={piedra} />
                    <Pino x={-74} y={6} s={0.6} />
                  </>
                )}
                {i === 1 && (
                  <>
                    <Montana x={0} y={0} s={0.44} nieve={nieve} piedra={piedra} />
                    <Pajaros x={0} y={-78} />
                  </>
                )}
                {i === 2 && (
                  <>
                    <Montana x={0} y={0} s={0.34} nieve={nieve} piedra={piedra} />
                    <Banderines x={0} y={-72} acento={mundo.accent} />
                  </>
                )}
              </Hito>
            ))}
          </>
        )}
      </g>
    </g>
  );
}

interface HitoProps {
  x: number;
  y: number;
  suelo: string;
  children: ReactNode;
}

/** Montículo suave + decoración de un nivel. */
function Hito({ x, y, suelo, children }: HitoProps) {
  return (
    <g>
      <path
        d={`M ${x - 100} ${y + 4} Q ${x} ${y - 62} ${x + 100} ${y + 4} Z`}
        fill={suelo}
        opacity={0.72}
      />
      <g transform={`translate(${x} ${y})`}>{children}</g>
    </g>
  );
}

interface DecorProps {
  x: number;
  y: number;
  s?: number;
}

function Nube({ x, y, s = 1 }: DecorProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.9}>
      <ellipse cx={0} cy={0} rx={44} ry={18} fill="#ffffff" />
      <ellipse cx={-32} cy={7} rx={28} ry={14} fill="#ffffff" />
      <ellipse cx={34} cy={6} rx={30} ry={15} fill="#ffffff" />
    </g>
  );
}

function Pino({ x, y, s = 1 }: DecorProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-5} y={-12} width={10} height={26} rx={5} fill="#7c4a2d" />
      <polygon
        points="0,-70 26,-20 -26,-20"
        fill="#2f6b45"
        stroke="#2f6b45"
        strokeWidth={12}
        strokeLinejoin="round"
      />
      <polygon
        points="0,-46 30,6 -30,6"
        fill="#3d8a58"
        stroke="#3d8a58"
        strokeWidth={12}
        strokeLinejoin="round"
      />
    </g>
  );
}

function Castillo({
  x,
  y,
  s = 1,
  acento,
  piedra,
  piedraOscura,
}: DecorProps & { acento: string; piedra: string; piedraOscura: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-72} y={-84} width={144} height={84} rx={14} fill={piedra} />
      <rect x={-82} y={-108} width={32} height={108} rx={10} fill={piedraOscura} />
      <rect x={50} y={-108} width={32} height={108} rx={10} fill={piedraOscura} />
      <polygon
        points="-82,-108 -66,-142 -50,-108"
        fill={acento}
        stroke={acento}
        strokeWidth={10}
        strokeLinejoin="round"
      />
      <polygon
        points="50,-108 66,-142 82,-108"
        fill={acento}
        stroke={acento}
        strokeWidth={10}
        strokeLinejoin="round"
      />
      <rect x={-18} y={-60} width={36} height={60} rx={18} fill={piedraOscura} />
      <rect x={-56} y={-76} width={14} height={20} rx={7} fill="#fde68a" />
      <rect x={42} y={-76} width={14} height={20} rx={7} fill="#fde68a" />
      <line x1={66} y1={-142} x2={66} y2={-172} stroke={piedraOscura} strokeWidth={3} />
      <polygon
        points="66,-172 98,-160 66,-148"
        fill={acento}
        stroke={acento}
        strokeWidth={6}
        strokeLinejoin="round"
      />
    </g>
  );
}

function Banderines({ x, y, acento }: DecorProps & { acento: string }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={0.9}>
      <path d="M-70 0 Q 0 18 70 0" stroke={acento} strokeWidth={3} fill="none" />
      {[-52, -20, 12, 44].map((dx, i) => (
        <polygon
          key={dx}
          points={`${dx},${6 + i * 1.2} ${dx + 18},${6 + i * 1.2} ${dx + 9},${24 + i * 1.2}`}
          fill={i % 2 === 0 ? acento : "#fbbf24"}
          stroke={i % 2 === 0 ? acento : "#fbbf24"}
          strokeWidth={5}
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
}

function Volcan({ x, y, s = 1 }: DecorProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M-120 0 L-34 -156 L8 -74 L48 -128 L122 0 Z"
        fill="#5b4636"
        stroke="#5b4636"
        strokeWidth={22}
        strokeLinejoin="round"
      />
      <path
        d="M-34 -156 L8 -74 L-4 0 L-76 0 Z"
        fill="#7a5a44"
        stroke="#7a5a44"
        strokeWidth={14}
        strokeLinejoin="round"
      />
      <ellipse cx={-34} cy={-156} rx={28} ry={11} fill="#ff7043" />
      <ellipse cx={-34} cy={-156} rx={16} ry={6} fill="#fbbf24" />
      <g className="camino-humo">
        <circle cx={-46} cy={-186} r={16} fill="#e2e8f0" opacity={0.5} />
        <circle cx={-22} cy={-208} r={20} fill="#e2e8f0" opacity={0.4} />
        <circle cx={-40} cy={-234} r={14} fill="#e2e8f0" opacity={0.3} />
      </g>
      <path d="M-96 0 Q -34 -34 30 0 Z" fill="#f97316" opacity={0.35} />
    </g>
  );
}

function Hielo({ x, y, s = 1, nieve }: DecorProps & { nieve: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-100 0 Q -48 -92 8 -58 Q 56 -96 104 0 Z" fill={nieve} opacity={0.92} />
      <path
        d="M-64 -30 L-42 -52 L-24 -34 L-4 -60 L18 -36 L38 -52 L58 -28"
        stroke="#7dd3fc"
        strokeWidth={4}
        fill="none"
        opacity={0.7}
      />
      {[-40, 10, 54].map((dx) => (
        <circle key={dx} cx={dx} cy={-12} r={3} fill="#38bdf8" opacity={0.8} />
      ))}
    </g>
  );
}

function Senal({ x, y, acento }: DecorProps & { acento: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-4} y={0} width={8} height={78} rx={4} fill="#78716c" />
      <polygon
        points="0,-4 52,16 0,36"
        fill={acento}
        stroke={acento}
        strokeWidth={9}
        strokeLinejoin="round"
      />
      <rect x={12} y={10} width={5} height={14} rx={2.5} fill="#ffffff" />
    </g>
  );
}

function Rocas({ x, y, piedra }: DecorProps & { piedra: string }) {
  return (
    <g transform={`translate(${x} ${y})`} fill={piedra} opacity={0.85}>
      <ellipse cx={0} cy={0} rx={26} ry={12} />
      <ellipse cx={26} cy={6} rx={16} ry={8} />
      <ellipse cx={-24} cy={7} rx={13} ry={7} />
    </g>
  );
}

function Olas({ y, acento }: { y: number; acento: string }) {
  return (
    <g>
      <path
        className="camino-olas"
        d={`M20 ${y} q 40 -16 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0`}
        stroke={acento}
        strokeWidth={5}
        fill="none"
        opacity={0.8}
      />
      <path
        className="camino-olas-lento"
        d={`M20 ${y + 22} q 40 16 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0`}
        stroke="#ffffff"
        strokeWidth={3}
        fill="none"
        opacity={0.5}
      />
    </g>
  );
}

function Palmera({ x, y, s = 1 }: DecorProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M0 0 C 8 -42 -6 -76 8 -118"
        stroke="#8b5e34"
        strokeWidth={11}
        fill="none"
        strokeLinecap="round"
      />
      <g fill="#22c55e">
        <ellipse cx={-28} cy={-116} rx={30} ry={10} transform="rotate(24 -28 -116)" />
        <ellipse cx={34} cy={-116} rx={30} ry={10} transform="rotate(-24 34 -116)" />
        <ellipse cx={4} cy={-134} rx={26} ry={10} />
        <ellipse cx={-20} cy={-130} rx={26} ry={9} transform="rotate(48 -20 -130)" />
        <ellipse cx={24} cy={-130} rx={26} ry={9} transform="rotate(-48 24 -130)" />
      </g>
      <circle cx={-2} cy={-104} r={7} fill="#f59e0b" />
      <circle cx={12} cy={-98} r={6} fill="#fb923c" />
    </g>
  );
}

function Arbol({ x, y, s = 1 }: DecorProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-8} y={-60} width={16} height={62} rx={8} fill="#8b5e34" />
      <ellipse cx={0} cy={-82} rx={48} ry={40} fill="#34a853" />
      <ellipse cx={-32} cy={-64} rx={30} ry={26} fill="#43b95f" />
      <ellipse cx={32} cy={-66} rx={28} ry={24} fill="#2f9e4b" />
      <circle cx={-22} cy={-90} r={6} fill="#ef4444" />
      <circle cx={16} cy={-96} r={6} fill="#f59e0b" />
      <circle cx={34} cy={-72} r={5} fill="#ef4444" />
    </g>
  );
}

function Frutas({ x, y }: DecorProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={44} ry={16} fill="#16a34a" opacity={0.85} />
      <circle cx={-22} cy={-8} r={7} fill="#ef4444" />
      <circle cx={2} cy={-12} r={7} fill="#f59e0b" />
      <circle cx={24} cy={-6} r={7} fill="#22c55e" />
    </g>
  );
}

function Templo({
  x,
  y,
  s = 1,
  acento,
  piedra,
  piedraOscura,
}: DecorProps & { acento: string; piedra: string; piedraOscura: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-96} y={-18} width={192} height={18} rx={8} fill={piedraOscura} />
      <rect x={-86} y={-30} width={172} height={14} rx={6} fill={piedra} />
      {[-62, -22, 22, 62].map((cx) => (
        <g key={cx}>
          <rect x={cx - 9} y={-124} width={18} height={96} rx={6} fill={piedra} />
          <rect x={cx - 13} y={-132} width={26} height={12} rx={6} fill={piedraOscura} />
        </g>
      ))}
      <polygon
        points="-100,-132 0,-182 100,-132"
        fill={piedra}
        stroke={piedra}
        strokeWidth={14}
        strokeLinejoin="round"
      />
      <polygon points="-100,-132 0,-182 100,-132" fill={acento} opacity={0.18} />
      <circle cx={0} cy={-152} r={13} fill="#fbbf24" />
      <circle cx={0} cy={-152} r={20} fill="#fbbf24" opacity={0.25} />
    </g>
  );
}

function Columna({ x, y, s = 1, piedra }: DecorProps & { piedra: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-14} y={-8} width={28} height={8} rx={4} fill={piedra} />
      <rect x={-9} y={-84} width={18} height={78} rx={6} fill={piedra} />
      <rect x={-13} y={-92} width={26} height={9} rx={4} fill={piedra} />
    </g>
  );
}

function Farol({ x, y, acento }: DecorProps & { acento: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1={0} y1={0} x2={0} y2={54} stroke="#78716c" strokeWidth={4} />
      <circle cx={0} cy={-2} r={9} fill="#fbbf24" />
      <circle cx={0} cy={-2} r={18} fill={acento} opacity={0.25} className="camino-brillo" />
    </g>
  );
}

function Montana({ x, y, s = 1, nieve, piedra }: DecorProps & { nieve: string; piedra: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <polygon
        points="0,-164 116,0 -116,0"
        fill={piedra}
        stroke={piedra}
        strokeWidth={20}
        strokeLinejoin="round"
      />
      <polygon
        points="0,-164 42,-104 -42,-104"
        fill={nieve}
        stroke={nieve}
        strokeWidth={12}
        strokeLinejoin="round"
      />
      <polygon points="-20,-124 20,-124 0,-152" fill={nieve} opacity={0.85} />
    </g>
  );
}

function Pajaros({ x, y }: DecorProps) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="#475569" strokeWidth={3} fill="none" opacity={0.7}>
      <path d="M-40 0 q 10 -10 20 0 q 10 -10 20 0" />
      <path d="M20 22 q 8 -8 16 0 q 8 -8 16 0" />
      <path d="M-10 40 q 7 -7 14 0 q 7 -7 14 0" />
    </g>
  );
}
