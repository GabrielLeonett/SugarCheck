import React, { type ReactNode } from 'react';
import {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
} from 'react-native-svg';

import { NIVELES, type MundoTheme } from './caminoTheme';

interface AmbienteMundoProps {
  mundo: MundoTheme;
  oscuro: boolean;
}

/**
 * Escenografía vectorial de cada mundo (react-native-svg).
 *
 * La banda se recorta con esquinas redondeadas y cada nivel recibe un hito
 * decorativo en el lado contrario al nodo.
 */
export function AmbienteMundo({ mundo, oscuro }: AmbienteMundoProps) {
  const { y, height } = mundo.band;
  const bottom = y + height;
  const skyId = `camino-cielo-${mundo.numero}`;
  const clipId = `camino-banda-${mundo.numero}`;
  const suelo = oscuro ? mundo.groundDark : mundo.ground;
  const nieve = oscuro ? '#cbd5e1' : '#ffffff';
  const piedra = oscuro ? '#334155' : '#cbd5e1';
  const piedraOscura = oscuro ? '#1e293b' : '#94a3b8';

  const hitos = NIVELES.filter((nivel) => nivel.mundo === mundo.numero).map((nivel) => ({
    x: nivel.x < 500 ? 836 : 164,
    y: nivel.y + 76,
    suelo,
  }));

  return (
    <G>
      <Defs>
        <LinearGradient id={skyId} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={oscuro ? mundo.skyDarkTop : mundo.skyTop} />
          <Stop offset="100%" stopColor={oscuro ? mundo.skyDarkBottom : mundo.skyBottom} />
        </LinearGradient>
        <ClipPath id={clipId}>
          <Rect x={20} y={y} width={960} height={height} rx={56} />
        </ClipPath>
      </Defs>

      <G clipPath={`url(#${clipId})`}>
        <Rect x={20} y={y} width={960} height={height} fill={`url(#${skyId})`} />

        {/* Suelo */}
        <Path
          d={`M20 ${bottom - 86} Q 240 ${bottom - 168} 500 ${bottom - 92} T 980 ${bottom - 112} L 980 ${bottom} L 20 ${bottom} Z`}
          fill={suelo}
          opacity={0.9}
        />
        <Path
          d={`M20 ${bottom - 54} Q 300 ${bottom - 120} 560 ${bottom - 62} T 980 ${bottom - 74} L 980 ${bottom} L 20 ${bottom} Z`}
          fill={mundo.groundDark}
          opacity={oscuro ? 0.55 : 0.35}
        />

        {mundo.environment === 'reino' && (
          <G>
            <Nube x={170} y={y + 92} s={1.05} />
            <Nube x={610} y={y + 66} s={0.78} />
            {hitos.map((hito, i) => (
              <Hito key={`reino-${i}`} {...hito}>
                {i === 0 && (
                  <G>
                    <Pino x={0} y={-4} s={0.95} />
                    <Pino x={-40} y={8} s={0.7} />
                    <Pino x={40} y={10} s={0.62} />
                  </G>
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
                  <G>
                    <Pino x={-32} y={4} s={0.75} />
                    <Pino x={28} y={8} s={0.6} />
                    <Banderines x={0} y={-92} acento={mundo.accent} />
                  </G>
                )}
              </Hito>
            ))}
          </G>
        )}

        {mundo.environment === 'valle' && (
          <G>
            <Nube x={560} y={y + 88} s={0.75} />
            <Nube x={300} y={y + 68} s={0.6} />
            {hitos.map((hito, i) => (
              <Hito key={`valle-${i}`} {...hito}>
                {i === 0 && <Volcan x={0} y={0} s={0.52} />}
                {i === 1 && (
                  <G>
                    <Hielo x={0} y={2} s={0.72} nieve={nieve} />
                    <Rocas x={-56} y={10} piedra={piedraOscura} />
                    <Rocas x={54} y={16} piedra={piedraOscura} />
                  </G>
                )}
                {i === 2 && (
                  <G>
                    <Senal x={-14} y={0} acento={mundo.accent} />
                    <Rocas x={56} y={12} piedra={piedraOscura} />
                  </G>
                )}
              </Hito>
            ))}
          </G>
        )}

        {mundo.environment === 'isla' && (
          <G>
            <Circle cx={834} cy={y + 96} r={40} fill="#fde68a" opacity={oscuro ? 0.55 : 0.9} />
            <Circle cx={834} cy={y + 96} r={58} fill="#fde68a" opacity={0.18} />
            <Nube x={360} y={y + 70} s={0.7} />
            <Nube x={700} y={y + 100} s={0.85} />
            <Olas y={bottom - 34} acento={mundo.accentSoft} />
            {hitos.map((hito, i) => (
              <Hito key={`isla-${i}`} {...hito}>
                {i === 0 && (
                  <G>
                    <Palmera x={-18} y={4} s={0.85} />
                    <Frutas x={44} y={10} />
                  </G>
                )}
                {i === 1 && (
                  <G>
                    <Arbol x={0} y={0} s={0.92} />
                    <Frutas x={-46} y={12} />
                  </G>
                )}
                {i === 2 && (
                  <G>
                    <Palmera x={20} y={2} s={0.8} />
                    <Frutas x={-44} y={8} />
                  </G>
                )}
              </Hito>
            ))}
          </G>
        )}

        {mundo.environment === 'templo' && (
          <G>
            <Nube x={300} y={y + 82} s={0.65} />
            <Nube x={700} y={y + 64} s={0.8} />
            {hitos.map((hito, i) => (
              <Hito key={`templo-${i}`} {...hito}>
                {i === 0 && (
                  <G>
                    <Columna x={-30} y={0} s={0.7} piedra={piedra} />
                    <Columna x={28} y={4} s={0.55} piedra={piedra} />
                    <Farol x={2} y={-6} acento={mundo.accent} />
                  </G>
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
                  <G>
                    <Columna x={-28} y={0} s={0.62} piedra={piedra} />
                    <Columna x={30} y={6} s={0.5} piedra={piedra} />
                    <Farol x={-2} y={-8} acento={mundo.accent} />
                  </G>
                )}
              </Hito>
            ))}
          </G>
        )}

        {mundo.environment === 'cumbre' && (
          <G>
            <Circle cx={830} cy={y + 96} r={34} fill="#fbbf24" opacity={oscuro ? 0.5 : 0.85} />
            <Nube x={240} y={y + 88} s={0.8} />
            <Nube x={760} y={y + 70} s={0.65} />
            {hitos.map((hito, i) => (
              <Hito key={`cumbre-${i}`} {...hito}>
                {i === 0 && (
                  <G>
                    <Montana x={0} y={0} s={0.5} nieve={nieve} piedra={piedra} />
                    <Pino x={-74} y={6} s={0.6} />
                  </G>
                )}
                {i === 1 && (
                  <G>
                    <Montana x={0} y={0} s={0.44} nieve={nieve} piedra={piedra} />
                    <Pajaros x={0} y={-78} />
                  </G>
                )}
                {i === 2 && (
                  <G>
                    <Montana x={0} y={0} s={0.34} nieve={nieve} piedra={piedra} />
                    <Banderines x={0} y={-72} acento={mundo.accent} />
                  </G>
                )}
              </Hito>
            ))}
          </G>
        )}
      </G>
    </G>
  );
}

interface HitoProps {
  x: number;
  y: number;
  suelo: string;
  children: ReactNode;
}

function Hito({ x, y, suelo, children }: HitoProps) {
  return (
    <G>
      <Path
        d={`M ${x - 100} ${y + 4} Q ${x} ${y - 62} ${x + 100} ${y + 4} Z`}
        fill={suelo}
        opacity={0.72}
      />
      <G transform={`translate(${x} ${y})`}>{children}</G>
    </G>
  );
}

interface DecorProps {
  x: number;
  y: number;
  s?: number;
}

function Nube({ x, y, s = 1 }: DecorProps) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`} opacity={0.9}>
      <Ellipse cx={0} cy={0} rx={44} ry={18} fill="#ffffff" />
      <Ellipse cx={-32} cy={7} rx={28} ry={14} fill="#ffffff" />
      <Ellipse cx={34} cy={6} rx={30} ry={15} fill="#ffffff" />
    </G>
  );
}

function Pino({ x, y, s = 1 }: DecorProps) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Rect x={-5} y={-12} width={10} height={26} rx={5} fill="#7c4a2d" />
      <Polygon
        points="0,-70 26,-20 -26,-20"
        fill="#2f6b45"
        stroke="#2f6b45"
        strokeWidth={12}
        strokeLinejoin="round"
      />
      <Polygon
        points="0,-46 30,6 -30,6"
        fill="#3d8a58"
        stroke="#3d8a58"
        strokeWidth={12}
        strokeLinejoin="round"
      />
    </G>
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
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Rect x={-72} y={-84} width={144} height={84} rx={14} fill={piedra} />
      <Rect x={-82} y={-108} width={32} height={108} rx={10} fill={piedraOscura} />
      <Rect x={50} y={-108} width={32} height={108} rx={10} fill={piedraOscura} />
      <Polygon
        points="-82,-108 -66,-142 -50,-108"
        fill={acento}
        stroke={acento}
        strokeWidth={10}
        strokeLinejoin="round"
      />
      <Polygon
        points="50,-108 66,-142 82,-108"
        fill={acento}
        stroke={acento}
        strokeWidth={10}
        strokeLinejoin="round"
      />
      <Rect x={-18} y={-60} width={36} height={60} rx={18} fill={piedraOscura} />
      <Rect x={-56} y={-76} width={14} height={20} rx={7} fill="#fde68a" />
      <Rect x={42} y={-76} width={14} height={20} rx={7} fill="#fde68a" />
      <Line x1={66} y1={-142} x2={66} y2={-172} stroke={piedraOscura} strokeWidth={3} />
      <Polygon
        points="66,-172 98,-160 66,-148"
        fill={acento}
        stroke={acento}
        strokeWidth={6}
        strokeLinejoin="round"
      />
    </G>
  );
}

function Banderines({ x, y, acento }: DecorProps & { acento: string }) {
  return (
    <G transform={`translate(${x} ${y})`} opacity={0.9}>
      <Path d="M-70 0 Q 0 18 70 0" stroke={acento} strokeWidth={3} fill="none" />
      {[-52, -20, 12, 44].map((dx, i) => (
        <Polygon
          key={dx}
          points={`${dx},${6 + i * 1.2} ${dx + 18},${6 + i * 1.2} ${dx + 9},${24 + i * 1.2}`}
          fill={i % 2 === 0 ? acento : '#fbbf24'}
          stroke={i % 2 === 0 ? acento : '#fbbf24'}
          strokeWidth={5}
          strokeLinejoin="round"
        />
      ))}
    </G>
  );
}

function Volcan({ x, y, s = 1 }: DecorProps) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path
        d="M-120 0 L-34 -156 L8 -74 L48 -128 L122 0 Z"
        fill="#5b4636"
        stroke="#5b4636"
        strokeWidth={22}
        strokeLinejoin="round"
      />
      <Path
        d="M-34 -156 L8 -74 L-4 0 L-76 0 Z"
        fill="#7a5a44"
        stroke="#7a5a44"
        strokeWidth={14}
        strokeLinejoin="round"
      />
      <Ellipse cx={-34} cy={-156} rx={28} ry={11} fill="#ff7043" />
      <Ellipse cx={-34} cy={-156} rx={16} ry={6} fill="#fbbf24" />
      <Circle cx={-46} cy={-186} r={16} fill="#e2e8f0" opacity={0.5} />
      <Circle cx={-22} cy={-208} r={20} fill="#e2e8f0" opacity={0.4} />
      <Circle cx={-40} cy={-234} r={14} fill="#e2e8f0" opacity={0.3} />
      <Path d="M-96 0 Q -34 -34 30 0 Z" fill="#f97316" opacity={0.35} />
    </G>
  );
}

function Hielo({ x, y, s = 1, nieve }: DecorProps & { nieve: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-100 0 Q -48 -92 8 -58 Q 56 -96 104 0 Z" fill={nieve} opacity={0.92} />
      <Path
        d="M-64 -30 L-42 -52 L-24 -34 L-4 -60 L18 -36 L38 -52 L58 -28"
        stroke="#7dd3fc"
        strokeWidth={4}
        fill="none"
        opacity={0.7}
      />
      {[-40, 10, 54].map((dx) => (
        <Circle key={dx} cx={dx} cy={-12} r={3} fill="#38bdf8" opacity={0.8} />
      ))}
    </G>
  );
}

function Senal({ x, y, acento }: DecorProps & { acento: string }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      <Rect x={-4} y={0} width={8} height={78} rx={4} fill="#78716c" />
      <Polygon
        points="0,-4 52,16 0,36"
        fill={acento}
        stroke={acento}
        strokeWidth={9}
        strokeLinejoin="round"
      />
      <Rect x={12} y={10} width={5} height={14} rx={2.5} fill="#ffffff" />
    </G>
  );
}

function Rocas({ x, y, piedra }: DecorProps & { piedra: string }) {
  return (
    <G transform={`translate(${x} ${y})`} fill={piedra} opacity={0.85}>
      <Ellipse cx={0} cy={0} rx={26} ry={12} />
      <Ellipse cx={26} cy={6} rx={16} ry={8} />
      <Ellipse cx={-24} cy={7} rx={13} ry={7} />
    </G>
  );
}

function Olas({ y, acento }: { y: number; acento: string }) {
  return (
    <G>
      <Path
        d={`M20 ${y} q 40 -16 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0`}
        stroke={acento}
        strokeWidth={5}
        fill="none"
        opacity={0.8}
      />
      <Path
        d={`M20 ${y + 22} q 40 16 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0`}
        stroke="#ffffff"
        strokeWidth={3}
        fill="none"
        opacity={0.5}
      />
    </G>
  );
}

function Palmera({ x, y, s = 1 }: DecorProps) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path
        d="M0 0 C 8 -42 -6 -76 8 -118"
        stroke="#8b5e34"
        strokeWidth={11}
        fill="none"
        strokeLinecap="round"
      />
      <G fill="#22c55e">
        <Ellipse cx={-28} cy={-116} rx={30} ry={10} transform="rotate(24 -28 -116)" />
        <Ellipse cx={34} cy={-116} rx={30} ry={10} transform="rotate(-24 34 -116)" />
        <Ellipse cx={4} cy={-134} rx={26} ry={10} />
        <Ellipse cx={-20} cy={-130} rx={26} ry={9} transform="rotate(48 -20 -130)" />
        <Ellipse cx={24} cy={-130} rx={26} ry={9} transform="rotate(-48 24 -130)" />
      </G>
      <Circle cx={-2} cy={-104} r={7} fill="#f59e0b" />
      <Circle cx={12} cy={-98} r={6} fill="#fb923c" />
    </G>
  );
}

function Arbol({ x, y, s = 1 }: DecorProps) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Rect x={-8} y={-60} width={16} height={62} rx={8} fill="#8b5e34" />
      <Ellipse cx={0} cy={-82} rx={48} ry={40} fill="#34a853" />
      <Ellipse cx={-32} cy={-64} rx={30} ry={26} fill="#43b95f" />
      <Ellipse cx={32} cy={-66} rx={28} ry={24} fill="#2f9e4b" />
      <Circle cx={-22} cy={-90} r={6} fill="#ef4444" />
      <Circle cx={16} cy={-96} r={6} fill="#f59e0b" />
      <Circle cx={34} cy={-72} r={5} fill="#ef4444" />
    </G>
  );
}

function Frutas({ x, y }: DecorProps) {
  return (
    <G transform={`translate(${x} ${y})`}>
      <Ellipse cx={0} cy={0} rx={44} ry={16} fill="#16a34a" opacity={0.85} />
      <Circle cx={-22} cy={-8} r={7} fill="#ef4444" />
      <Circle cx={2} cy={-12} r={7} fill="#f59e0b" />
      <Circle cx={24} cy={-6} r={7} fill="#22c55e" />
    </G>
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
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Rect x={-96} y={-18} width={192} height={18} rx={8} fill={piedraOscura} />
      <Rect x={-86} y={-30} width={172} height={14} rx={6} fill={piedra} />
      {[-62, -22, 22, 62].map((cx) => (
        <G key={cx}>
          <Rect x={cx - 9} y={-124} width={18} height={96} rx={6} fill={piedra} />
          <Rect x={cx - 13} y={-132} width={26} height={12} rx={6} fill={piedraOscura} />
        </G>
      ))}
      <Polygon
        points="-100,-132 0,-182 100,-132"
        fill={piedra}
        stroke={piedra}
        strokeWidth={14}
        strokeLinejoin="round"
      />
      <Polygon points="-100,-132 0,-182 100,-132" fill={acento} opacity={0.18} />
      <Circle cx={0} cy={-152} r={13} fill="#fbbf24" />
      <Circle cx={0} cy={-152} r={20} fill="#fbbf24" opacity={0.25} />
    </G>
  );
}

function Columna({ x, y, s = 1, piedra }: DecorProps & { piedra: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Rect x={-14} y={-8} width={28} height={8} rx={4} fill={piedra} />
      <Rect x={-9} y={-84} width={18} height={78} rx={6} fill={piedra} />
      <Rect x={-13} y={-92} width={26} height={9} rx={4} fill={piedra} />
    </G>
  );
}

function Farol({ x, y, acento }: DecorProps & { acento: string }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      <Line x1={0} y1={0} x2={0} y2={54} stroke="#78716c" strokeWidth={4} />
      <Circle cx={0} cy={-2} r={9} fill="#fbbf24" />
      <Circle cx={0} cy={-2} r={18} fill={acento} opacity={0.25} />
    </G>
  );
}

function Montana({ x, y, s = 1, nieve, piedra }: DecorProps & { nieve: string; piedra: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Polygon
        points="0,-164 116,0 -116,0"
        fill={piedra}
        stroke={piedra}
        strokeWidth={20}
        strokeLinejoin="round"
      />
      <Polygon
        points="0,-164 42,-104 -42,-104"
        fill={nieve}
        stroke={nieve}
        strokeWidth={12}
        strokeLinejoin="round"
      />
      <Polygon points="-20,-124 20,-124 0,-152" fill={nieve} opacity={0.85} />
    </G>
  );
}

function Pajaros({ x, y }: DecorProps) {
  return (
    <G transform={`translate(${x} ${y})`} stroke="#475569" strokeWidth={3} fill="none" opacity={0.7}>
      <Path d="M-40 0 q 10 -10 20 0 q 10 -10 20 0" />
      <Path d="M20 22 q 8 -8 16 0 q 8 -8 16 0" />
      <Path d="M-10 40 q 7 -7 14 0 q 7 -7 14 0" />
    </G>
  );
}
