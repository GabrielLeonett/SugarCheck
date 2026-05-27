export interface NavItem {
  name: string;
  // Usamos Template Literal Types para asegurar que siempre sea un ancla de ID
  href: `#${string}`;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

interface User {
  sub: number;
  name: string;
  email: string;
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