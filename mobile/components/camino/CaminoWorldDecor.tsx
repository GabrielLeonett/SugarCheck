import React from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

interface CaminoWorldDecorProps {
  world: number;
  accent: string;
  /** Color de contraste para detalles sobre el acento. */
  contrast: string;
  height?: number;
}

/**
 * Ilustración de fondo sutil para cada mundo del Camino.
 * Es decorativa: no captura eventos y vive detrás del contenido.
 */
export function CaminoWorldDecor({ world, accent, contrast, height = 190 }: CaminoWorldDecorProps) {
  return (
    <Svg
      width="100%"
      height={height}
      viewBox="0 0 600 320"
      preserveAspectRatio="xMaxYMax meet"
      pointerEvents="none"
      style={{ position: 'absolute', right: 0, bottom: 0, opacity: 0.95 }}
    >
      {world === 1 && (
        <G fill={accent}>
          <Circle cx="500" cy="74" r="54" fillOpacity={0.06} />
          <Circle cx="500" cy="74" r="30" fillOpacity={0.1} />
          <Path d="M118 54l3.2 7.6 7.6 3.2-7.6 3.2-3.2 7.6-3.2-7.6-7.6-3.2 7.6-3.2z" fillOpacity={0.22} />
          <Path d="M172 102l2.4 5.6 5.6 2.4-5.6 2.4-2.4 5.6-2.4-5.6-5.6-2.4 5.6-2.4z" fillOpacity={0.18} />
          <Path d="M0 252c70-36 130-24 190-4 80 26 170-10 250-2 70 7 120 24 160 14v60H0z" fillOpacity={0.06} />
          <G fillOpacity={0.16}>
            <Rect x="418" y="132" width="112" height="120" rx="3" />
            <Rect x="402" y="156" width="30" height="96" rx="3" />
            <Rect x="518" y="150" width="32" height="102" rx="3" />
            <Path d="M402 156l15-19 15 19z" />
            <Path d="M518 150l16-21 16 21z" />
            <Rect x="456" y="110" width="36" height="142" rx="3" />
            <Path d="M456 110l18-25 18 25z" />
          </G>
          <Path d="M474 86v-26" stroke={accent} strokeWidth={2.5} strokeOpacity={0.3} strokeLinecap="round" />
          <Path d="M474 60l22 7-22 8z" fillOpacity={0.28} />
          <Path d="M0 278c90-30 180-8 270-18 100-11 210-26 330 8v52H0z" fillOpacity={0.05} />
        </G>
      )}

      {world === 2 && (
        <G fill={accent}>
          <Circle cx="498" cy="66" r="46" fillOpacity={0.06} />
          <Path d="M0 252l110-116 86 84 92-124 108 132 96-84 108 108v68H0z" fillOpacity={0.07} />
          <Path d="M0 292l140-86 100 52 96-70 110 78 84-44 70 38v60H0z" fillOpacity={0.1} />
          <Path d="M308 196l24-38 24 38z" fillOpacity={0.22} />
          <Path d="M500 92l48 84H452z" fillOpacity={0.16} />
          <Line x1="500" y1="118" x2="500" y2="148" stroke={contrast} strokeOpacity={0.55} strokeWidth={7} strokeLinecap="round" />
          <Circle cx="500" cy="160" r="4.5" fill={contrast} fillOpacity={0.55} />
          <Path d="M120 78c-16 24-24 40-24 52a24 24 0 0048 0c0-12-8-28-24-52z" fillOpacity={0.18} />
          <Path d="M176 48c-12 18-18 30-18 39a18 18 0 0036 0c0-9-6-21-18-39z" fillOpacity={0.18} />
          <Path d="M104 152l-8-22m0 22l8-22" stroke={accent} strokeOpacity={0.28} strokeWidth={3} strokeLinecap="round" />
          <Path d="M192 94l-8 22m0-22l8 22" stroke={accent} strokeOpacity={0.22} strokeWidth={2.5} strokeLinecap="round" />
          <Path
            d="M20 286c40-18 60 18 100 0s60 18 100 0 60 18 100 0 60 18 100 0 60 18 100 0"
            fill="none"
            stroke={accent}
            strokeOpacity={0.16}
            strokeWidth={3}
            strokeDasharray={[12, 12]}
            strokeLinecap="round"
          />
        </G>
      )}

      {world === 3 && (
        <G fill={accent}>
          <Circle cx="502" cy="66" r="48" fillOpacity={0.07} />
          <Circle cx="502" cy="66" r="30" fillOpacity={0.1} />
          <Path d="M0 236c60-14 100 24 160 12s100-30 160-14 110 26 170 8 80 2 110 12v66H0z" fillOpacity={0.05} />
          <Path d="M0 268c52-12 92 18 144 8s96-24 148-12 100 20 152 8 96 0 156 10v38H0z" fillOpacity={0.06} />
          <Ellipse cx="440" cy="266" rx="132" ry="34" fillOpacity={0.1} />
          <Path d="M440 264c-4-42 2-78 24-108" fill="none" stroke={accent} strokeOpacity={0.26} strokeWidth={7} strokeLinecap="round" />
          <Path d="M466 156c14-26 42-34 62-26-12 24-38 36-62 26z" fillOpacity={0.18} />
          <Path d="M464 158c-22-20-48-18-62-6 16 20 42 24 62 6z" fillOpacity={0.18} />
          <Path d="M466 152c6-28 30-46 52-46-2 26-22 48-52 46z" fillOpacity={0.18} />
          <Path d="M463 160c-24-12-50-2-58 12 22 12 46 8 58-12z" fillOpacity={0.18} />
          <Circle cx="352" cy="264" r="14" fillOpacity={0.2} />
          <Circle cx="378" cy="276" r="10" fillOpacity={0.2} />
          <Circle cx="330" cy="282" r="8" fillOpacity={0.2} />
          <Path d="M28 214c34-16 62 16 96 0s62 16 96 0" fill="none" stroke={accent} strokeOpacity={0.18} strokeWidth={3} strokeLinecap="round" />
          <Path d="M60 244c34-16 62 16 96 0s62 16 96 0" fill="none" stroke={accent} strokeOpacity={0.13} strokeWidth={3} strokeLinecap="round" />
        </G>
      )}

      {world === 4 && (
        <G fill={accent}>
          <Circle cx="500" cy="70" r="52" fillOpacity={0.06} />
          <G stroke={accent} strokeOpacity={0.14} strokeWidth={2.5} strokeLinecap="round">
            <Line x1="500" y1="6" x2="500" y2="24" />
            <Line x1="448" y1="20" x2="457" y2="36" />
            <Line x1="552" y1="20" x2="543" y2="36" />
            <Line x1="414" y1="66" x2="432" y2="66" />
            <Line x1="568" y1="66" x2="586" y2="66" />
          </G>
          <G transform="translate(-30 0)">
            <Path d="M406 168l94-58 94 58z" fillOpacity={0.14} />
            <G fillOpacity={0.13}>
              <Rect x="420" y="176" width="22" height="96" rx="3" />
              <Rect x="458" y="176" width="22" height="96" rx="3" />
              <Rect x="500" y="176" width="22" height="96" rx="3" />
              <Rect x="538" y="176" width="22" height="96" rx="3" />
              <Rect x="574" y="176" width="22" height="96" rx="3" />
              <Rect x="400" y="272" width="212" height="14" rx="4" />
              <Rect x="384" y="290" width="244" height="12" rx="4" />
            </G>
          </G>
          <Path d="M126 74c-24 36-36 60-36 78a36 36 0 0072 0c0-18-12-42-36-78z" fillOpacity={0.1} />
          <Path d="M126 104v52M100 130h52" stroke={accent} strokeOpacity={0.28} strokeWidth={7} strokeLinecap="round" />
          <Path d="M200 60l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fillOpacity={0.2} />
          <Path d="M262 132l2.2 5.2 5.2 2.2-5.2 2.2-2.2 5.2-2.2-5.2-5.2-2.2 5.2-2.2z" fillOpacity={0.16} />
        </G>
      )}

      {world === 5 && (
        <G fill={accent}>
          <Circle cx="512" cy="62" r="54" fillOpacity={0.06} />
          <Circle cx="512" cy="62" r="32" fillOpacity={0.1} />
          <Path d="M0 268l118-138 84 88 74-70 92 96 78-112 154 136v52H0z" fillOpacity={0.07} />
          <Path d="M0 306l128-92 88 52 90-76 104 82 82-52 108 70v28H0z" fillOpacity={0.09} />
          <Path d="M268 170l42-52 42 52z" fillOpacity={0.13} />
          <Path d="M486 154l38-46 38 46z" fillOpacity={0.14} />
          <Path d="M510 122l14-17 14 17z" fill={contrast} fillOpacity={0.28} />
          <Path d="M524 118v-42" stroke={accent} strokeOpacity={0.32} strokeWidth={3} strokeLinecap="round" />
          <Path d="M524 76l26 8-26 9z" fillOpacity={0.3} />
          <Path
            d="M30 300c44-6 58-42 90-46s46 22 80 10 54-44 88-40"
            fill="none"
            stroke={accent}
            strokeOpacity={0.18}
            strokeWidth={3}
            strokeDasharray={[9, 11]}
            strokeLinecap="round"
          />
          <Path d="M118 74q10-9 20 0q10-9 20 0" fill="none" stroke={accent} strokeOpacity={0.2} strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M182 104q8-7 16 0q8-7 16 0" fill="none" stroke={accent} strokeOpacity={0.2} strokeWidth={2.5} strokeLinecap="round" />
        </G>
      )}
    </Svg>
  );
}
