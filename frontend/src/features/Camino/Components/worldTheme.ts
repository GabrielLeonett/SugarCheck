import CastleRounded from "@mui/icons-material/CastleRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import RestaurantRounded from "@mui/icons-material/RestaurantRounded";
import VaccinesRounded from "@mui/icons-material/VaccinesRounded";
import DirectionsRunRounded from "@mui/icons-material/DirectionsRunRounded";
import type { SvgIconComponent } from "@mui/icons-material";

export interface WorldTheme {
    /** Color de acento para modo claro. */
    accent: string;
    /** Color de acento para modo oscuro. */
    accentDark: string;
    /** Icono representativo del mundo. */
    Icon: SvgIconComponent;
}

/**
 * Cada mundo tiene su propia identidad visual: color e icono.
 * Se usan tanto en la cabecera del mundo como en su decoración de fondo.
 */
export const WORLD_THEMES: Record<string, WorldTheme> = {
    "1": { accent: "#3f729b", accentDark: "#8fc0e4", Icon: CastleRounded },
    "2": { accent: "#c2842f", accentDark: "#e8bb7a", Icon: WarningAmberRounded },
    "3": { accent: "#3f8f68", accentDark: "#8ad2ae", Icon: RestaurantRounded },
    "4": { accent: "#7561a8", accentDark: "#b7a7e2", Icon: VaccinesRounded },
    "5": { accent: "#2b8fa3", accentDark: "#79cbd9", Icon: DirectionsRunRounded },
};

const DEFAULT_THEME = WORLD_THEMES["1"];

export function getWorldTheme(numero: string | number): WorldTheme {
    return WORLD_THEMES[String(numero)] ?? DEFAULT_THEME;
}

export function worldAccent(theme: WorldTheme, mode: "light" | "dark"): string {
    return mode === "dark" ? theme.accentDark : theme.accent;
}
