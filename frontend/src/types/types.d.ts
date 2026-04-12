export interface NavItem {
  name: string;
  // Usamos Template Literal Types para asegurar que siempre sea un ancla de ID
  href: `#${string}`;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}
