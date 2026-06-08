export interface NavItem {
  name: string;
  href?: `/${string}`; // Hacemos href opcional para permitir menús que solo despliegan
  icon?: React.ReactNode;
}

export interface NavItemWithSubmenu {
  name: string;
  submenu: NavItem[];
  icon?: React.ReactNode;
  href?: never; // Asegura que no se pueda poner un href si hay un submenu
}

export type NavItemType = NavItem | NavItemWithSubmenu;

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

interface User {
  sub: number;
  name: string;
  email: string;
  role:string;
}

interface AuthContextType {
  auth: {
    user: User | null; // Puedes definir un tipo más específico para el usuario si lo deseas
    accessToken: string | null;
  };
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<string>;
}

// Define la estructura exacta que responde tu backend en errores
interface BackendErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
}