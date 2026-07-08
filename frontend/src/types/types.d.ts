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
  id: string;
  username: string;
  email?: string;
  sexo?: string;
}

interface AuthContextType {
  auth: {
    user: User | null;
    accessToken: string | null;
  };
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<string>;
}

// Define la estructura exacta que responde tu backend en errores
interface BackendErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
}

export type MeasurementState = 'Bajo peso' | 'Normal' | 'Sobrepeso';

export interface PhysicalRecord {
  id: string;
  fecha: string; // Formato DD/MM/AAAA
  peso: number;  // kg
  estatura: number; // cm
  imc: number;
  estado: MeasurementState;
}

export interface PhysicalEvolution {
  pesoDiff: number;       // ej: -1.3
  estaturaDiff: number;   // ej: 2.5
  fechaReferencia: string;
}

export interface BackendErrorsApi {
  message: string,
  error: string,
  statusCode: number
}