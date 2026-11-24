export const SITE_URL = "https://sugarcheck.app";

const INDEXABLE =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const NOT_INDEXABLE = "noindex, nofollow";

export interface RouteSeoEntry {
  /** Título de la pestaña y de los resultados de búsqueda. */
  title: string;
  /** Descripción para Google y redes sociales. */
  description: string;
  /** Ruta canónica, relativa a SITE_URL. */
  path: string;
  robots: string;
  /** Datos estructurados específicos de la ruta. */
  jsonLd?: Record<string, unknown>;
}

const FAQ = [
  {
    question: "¿SugarCheck es gratis?",
    answer:
      "Sí. Puedes crear tu cuenta y empezar a registrar tu información sin costo.",
  },
  {
    question: "¿Sirve para niños y adultos?",
    answer:
      "Sí. La app está diseñada pensando en niños con diabetes y sus familias, pero cualquier persona que necesite llevar un control de glucosa e insulina puede usarla.",
  },
  {
    question: "¿Necesito un sensor de glucosa?",
    answer:
      "No. Puedes registrar tus mediciones manualmente. Si usas un glucómetro o un sensor, también puedes anotar los valores en SugarCheck.",
  },
  {
    question: "¿Qué pasa con mis datos?",
    answer:
      "Tus datos de salud se tratan con medidas de seguridad reforzadas y solo con tu consentimiento. Puedes consultar todos los detalles en nuestra política de privacidad.",
  },
];

const landingJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const DEFAULT_DESCRIPTION =
  "SugarCheck convierte el control de la diabetes en una aventura épica. Registra glucosa, insulina y bienestar físico con una app pensada para niños, familias y cuidadores.";

export const ROUTE_SEO: Record<string, RouteSeoEntry> = {
  "/": {
    title: "SugarCheck | Control de glucosa e insulina para niños",
    description: DEFAULT_DESCRIPTION,
    path: "/",
    robots: INDEXABLE,
    jsonLd: landingJsonLd,
  },
  "/login": {
    title: "Iniciar sesión | SugarCheck",
    description:
      "Entra a tu Cuartel General de SugarCheck y continúa tu aventura: registra tu glucosa, insulina y bienestar físico.",
    path: "/login",
    robots: INDEXABLE,
  },
  "/register": {
    title: "Crear cuenta | SugarCheck",
    description:
      "Únete a los Guerreros Azules. Crea tu cuenta gratis y empieza a cuidar tu diabetes con la diversión de un videojuego.",
    path: "/register",
    robots: INDEXABLE,
  },
  "/privacidad": {
    title: "Política de Privacidad | SugarCheck",
    description:
      "Conoce cómo SugarCheck protege tus datos personales y tus datos sensibles de salud, y cuáles son tus derechos.",
    path: "/privacidad",
    robots: INDEXABLE,
  },
  "/terminos": {
    title: "Términos y Condiciones | SugarCheck",
    description:
      "Consulta las condiciones de uso de SugarCheck, la app que convierte el control de la diabetes en una aventura.",
    path: "/terminos",
    robots: INDEXABLE,
  },
  "/cookies": {
    title: "Política de Cookies | SugarCheck",
    description:
      "Información sobre las cookies y tecnologías similares que utiliza SugarCheck y cómo puedes gestionar tus preferencias.",
    path: "/cookies",
    robots: INDEXABLE,
  },
  "/perfil": {
    title: "Mi perfil | SugarCheck",
    description: DEFAULT_DESCRIPTION,
    path: "/perfil",
    robots: NOT_INDEXABLE,
  },
  "/completar-registro": {
    title: "Completar registro | SugarCheck",
    description: DEFAULT_DESCRIPTION,
    path: "/completar-registro",
    robots: NOT_INDEXABLE,
  },
  "/olvidoContrasena": {
    title: "Recuperar contraseña | SugarCheck",
    description: DEFAULT_DESCRIPTION,
    path: "/olvidoContrasena",
    robots: NOT_INDEXABLE,
  },
  "/restablecer-contrasena": {
    title: "Restablecer contraseña | SugarCheck",
    description: DEFAULT_DESCRIPTION,
    path: "/restablecer-contrasena",
    robots: NOT_INDEXABLE,
  },
  "/bitacora/control-glucosa": {
    title: "Control de glucosa | SugarCheck",
    description: DEFAULT_DESCRIPTION,
    path: "/bitacora/control-glucosa",
    robots: NOT_INDEXABLE,
  },
  "/bitacora/monitoreo-fisico": {
    title: "Monitoreo físico | SugarCheck",
    description: DEFAULT_DESCRIPTION,
    path: "/bitacora/monitoreo-fisico",
    robots: NOT_INDEXABLE,
  },
  "/bitacora/dosis-insulina": {
    title: "Dosis de insulina | SugarCheck",
    description: DEFAULT_DESCRIPTION,
    path: "/bitacora/dosis-insulina",
    robots: NOT_INDEXABLE,
  },
  "/agente/camino": {
    title: "El Camino del Guerrero | SugarCheck",
    description: DEFAULT_DESCRIPTION,
    path: "/agente/camino",
    robots: NOT_INDEXABLE,
  },
  "/agente/oraculo-chat": {
    title: "El Gran Oráculo | SugarCheck",
    description: DEFAULT_DESCRIPTION,
    path: "/agente/oraculo-chat",
    robots: NOT_INDEXABLE,
  },
};

const PRIVATE_PREFIXES = [
  "/perfil",
  "/completar-registro",
  "/bitacora",
  "/agente",
  "/olvidoContrasena",
  "/restablecer-contrasena",
];

function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

export function getRouteSeo(pathname: string): RouteSeoEntry {
  const path = normalizePath(pathname);
  const entry = ROUTE_SEO[path];

  if (entry) return entry;

  const isPrivate = PRIVATE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  return {
    title: isPrivate ? "SugarCheck" : "Página no encontrada | SugarCheck",
    description: DEFAULT_DESCRIPTION,
    path,
    robots: NOT_INDEXABLE,
  };
}
