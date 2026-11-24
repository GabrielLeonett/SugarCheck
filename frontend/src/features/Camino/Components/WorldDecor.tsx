import { Box } from "@mui/material";

interface WorldDecorProps {
    /** Número del mundo (1 a 5). */
    world: string | number;
    /** Color de acento resuelto según el modo de color. */
    accent: string;
    /** "card" para la tarjeta del mundo, "page" para la lección a pantalla completa. */
    variant?: "card" | "page";
}

/**
 * Ilustración de fondo sutil para cada mundo del camino.
 * Es puramente decorativa: no captura eventos y no debe tapar el contenido.
 */
export default function WorldDecor({ world, accent, variant = "card" }: WorldDecorProps) {
    const id = String(world);
    const esPagina = variant === "page";

    return (
        <Box
            component="svg"
            aria-hidden="true"
            viewBox="0 0 600 320"
            preserveAspectRatio="xMaxYMax meet"
            sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: esPagina
                    ? { xs: 220, sm: 320, md: 380 }
                    : { xs: 150, sm: 190, md: 220 },
                opacity: esPagina ? 0.7 : 0.95,
                pointerEvents: "none",
                userSelect: "none",
                zIndex: 0,
            }}
        >
            {id === "1" && (
                <g fill={accent}>
                    <circle cx="500" cy="74" r="54" fillOpacity="0.06" />
                    <circle cx="500" cy="74" r="30" fillOpacity="0.1" />
                    <path d="M118 54l3.2 7.6 7.6 3.2-7.6 3.2-3.2 7.6-3.2-7.6-7.6-3.2 7.6-3.2z" fillOpacity="0.22" />
                    <path d="M172 102l2.4 5.6 5.6 2.4-5.6 2.4-2.4 5.6-2.4-5.6-5.6-2.4 5.6-2.4z" fillOpacity="0.18" />
                    <path d="M0 252c70-36 130-24 190-4 80 26 170-10 250-2 70 7 120 24 160 14v60H0z" fillOpacity="0.06" />
                    <g fillOpacity="0.15">
                        <rect x="418" y="132" width="112" height="120" rx="3" />
                        <rect x="402" y="156" width="30" height="96" rx="3" />
                        <rect x="518" y="150" width="32" height="102" rx="3" />
                        <path d="M402 156l15-19 15 19z" />
                        <path d="M518 150l16-21 16 21z" />
                        <rect x="456" y="110" width="36" height="142" rx="3" />
                        <path d="M456 110l18-25 18 25z" />
                    </g>
                    <g fill="#ffffff" fillOpacity="0.32">
                        <rect x="468" y="140" width="12" height="20" rx="6" />
                        <rect x="468" y="176" width="12" height="20" rx="6" />
                        <rect x="432" y="180" width="9" height="16" rx="4.5" />
                        <rect x="540" y="174" width="9" height="16" rx="4.5" />
                    </g>
                    <path d="M474 86v-26" stroke={accent} strokeWidth="2.5" strokeOpacity="0.3" strokeLinecap="round" />
                    <path d="M474 60l22 7-22 8z" fillOpacity="0.28" />
                    <path d="M0 278c90-30 180-8 270-18 100-11 210-26 330 8v52H0z" fillOpacity="0.05" />
                </g>
            )}

            {id === "2" && (
                <g fill={accent}>
                    <circle cx="498" cy="66" r="46" fillOpacity="0.06" />
                    <path d="M0 252l110-116 86 84 92-124 108 132 96-84 108 108v68H0z" fillOpacity="0.07" />
                    <path d="M0 292l140-86 100 52 96-70 110 78 84-44 70 38v60H0z" fillOpacity="0.1" />
                    <path d="M308 196l24-38 24 38z" fillOpacity="0.22" />
                    <g transform="translate(452 92)" fillOpacity="0.16">
                        <path d="M48 0l48 84H0z" />
                    </g>
                    <path d="M500 118v30" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="7" strokeLinecap="round" />
                    <circle cx="500" cy="160" r="4.5" fill="#ffffff" fillOpacity="0.55" />
                    <g fillOpacity="0.18">
                        <path d="M120 78c-16 24-24 40-24 52a24 24 0 0048 0c0-12-8-28-24-52z" />
                        <path d="M176 48c-12 18-18 30-18 39a18 18 0 0036 0c0-9-6-21-18-39z" />
                    </g>
                    <path d="M104 152l-8-22m0 22l8-22" stroke={accent} strokeOpacity="0.28" strokeWidth="3" strokeLinecap="round" />
                    <path d="M192 94l-8 22m0-22l8 22" stroke={accent} strokeOpacity="0.22" strokeWidth="2.5" strokeLinecap="round" />
                    <path
                        d="M20 286c40-18 60 18 100 0s60 18 100 0 60 18 100 0 60 18 100 0 60 18 100 0"
                        fill="none"
                        stroke={accent}
                        strokeOpacity="0.16"
                        strokeWidth="3"
                        strokeDasharray="12 12"
                        strokeLinecap="round"
                    />
                </g>
            )}

            {id === "3" && (
                <g fill={accent}>
                    <circle cx="502" cy="66" r="48" fillOpacity="0.07" />
                    <circle cx="502" cy="66" r="30" fillOpacity="0.1" />
                    <path d="M0 236c60-14 100 24 160 12s100-30 160-14 110 26 170 8 80 2 110 12v66H0z" fillOpacity="0.05" />
                    <path d="M0 268c52-12 92 18 144 8s96-24 148-12 100 20 152 8 96 0 156 10v38H0z" fillOpacity="0.06" />
                    <ellipse cx="440" cy="266" rx="132" ry="34" fillOpacity="0.1" />
                    <path d="M440 264c-4-42 2-78 24-108" fill="none" stroke={accent} strokeOpacity="0.26" strokeWidth="7" strokeLinecap="round" />
                    <g fillOpacity="0.18">
                        <path d="M466 156c14-26 42-34 62-26-12 24-38 36-62 26z" />
                        <path d="M464 158c-22-20-48-18-62-6 16 20 42 24 62 6z" />
                        <path d="M466 152c6-28 30-46 52-46-2 26-22 48-52 46z" />
                        <path d="M463 160c-24-12-50-2-58 12 22 12 46 8 58-12z" />
                    </g>
                    <g fillOpacity="0.2">
                        <circle cx="352" cy="264" r="14" />
                        <circle cx="378" cy="276" r="10" />
                        <circle cx="330" cy="282" r="8" />
                    </g>
                    <path d="M352 240c-6 6-6 12 0 16 6-4 6-10 0-16z" fillOpacity="0.25" />
                    <path
                        d="M28 214c34-16 62 16 96 0s62 16 96 0"
                        fill="none"
                        stroke={accent}
                        strokeOpacity="0.18"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <path
                        d="M60 244c34-16 62 16 96 0s62 16 96 0"
                        fill="none"
                        stroke={accent}
                        strokeOpacity="0.13"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </g>
            )}

            {id === "4" && (
                <g fill={accent}>
                    <circle cx="500" cy="70" r="52" fillOpacity="0.06" />
                    <g stroke={accent} strokeOpacity="0.14" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M500 6v18" />
                        <path d="M448 20l9 16" />
                        <path d="M552 20l-9 16" />
                        <path d="M414 66h18" />
                        <path d="M568 66h18" />
                    </g>
                    <g transform="translate(-30 0)">
                        <path d="M406 168l94-58 94 58z" fillOpacity="0.14" />
                        <g fillOpacity="0.13">
                            <rect x="420" y="176" width="22" height="96" rx="3" />
                            <rect x="458" y="176" width="22" height="96" rx="3" />
                            <rect x="500" y="176" width="22" height="96" rx="3" />
                            <rect x="538" y="176" width="22" height="96" rx="3" />
                            <rect x="574" y="176" width="22" height="96" rx="3" />
                            <rect x="400" y="272" width="212" height="14" rx="4" />
                            <rect x="384" y="290" width="244" height="12" rx="4" />
                        </g>
                    </g>
                    <g>
                        <path d="M126 74c-24 36-36 60-36 78a36 36 0 0072 0c0-18-12-42-36-78z" fillOpacity="0.1" />
                        <path d="M126 104v52M100 130h52" stroke={accent} strokeOpacity="0.28" strokeWidth="7" strokeLinecap="round" />
                    </g>
                    <path d="M200 60l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fillOpacity="0.2" />
                    <path d="M262 132l2.2 5.2 5.2 2.2-5.2 2.2-2.2 5.2-2.2-5.2-5.2-2.2 5.2-2.2z" fillOpacity="0.16" />
                    <path d="M0 306c70-10 130 4 190-2 90-9 190-14 260 0 50 10 100 6 150 0v16H0z" fillOpacity="0.05" />
                </g>
            )}

            {id === "5" && (
                <g fill={accent}>
                    <circle cx="512" cy="62" r="54" fillOpacity="0.06" />
                    <circle cx="512" cy="62" r="32" fillOpacity="0.1" />
                    <path d="M0 268l118-138 84 88 74-70 92 96 78-112 154 136v52H0z" fillOpacity="0.07" />
                    <path d="M0 306l128-92 88 52 90-76 104 82 82-52 108 70v28H0z" fillOpacity="0.09" />
                    <path d="M268 170l42-52 42 52z" fillOpacity="0.13" />
                    <path d="M486 154l38-46 38 46z" fillOpacity="0.14" />
                    <path d="M510 122l14-17 14 17z" fill="#ffffff" fillOpacity="0.28" />
                    <path d="M524 118v-42" stroke={accent} strokeOpacity="0.32" strokeWidth="3" strokeLinecap="round" />
                    <path d="M524 76l26 8-26 9z" fillOpacity="0.3" />
                    <path
                        d="M30 300c44-6 58-42 90-46s46 22 80 10 54-44 88-40"
                        fill="none"
                        stroke={accent}
                        strokeOpacity="0.18"
                        strokeWidth="3"
                        strokeDasharray="9 11"
                        strokeLinecap="round"
                    />
                    <g fill="none" stroke={accent} strokeOpacity="0.2" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M118 74q10-9 20 0q10-9 20 0" />
                        <path d="M182 104q8-7 16 0q8-7 16 0" />
                    </g>
                </g>
            )}
        </Box>
    );
}
