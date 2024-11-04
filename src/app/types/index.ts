export interface DataPoint {
  x: number;
  y: number;
  timestamp?: number;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}
