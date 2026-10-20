import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "ecom_theme";
const DEFAULT_THEME = "lumina";

export const THEMES = [
  { id: "lumina",   name: "Lumina",   desc: "Purple · pink (default)" },
  { id: "ocean",    name: "Ocean",    desc: "Cyan · blue"            },
  { id: "forest",   name: "Forest",   desc: "Green · emerald"        },
  { id: "sunset",   name: "Sunset",   desc: "Orange · rose"          },
  { id: "midnight", name: "Midnight", desc: "Dark mode"              },
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return THEMES.some((t) => t.id === saved) ? saved : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  const setTheme = (next) => {
    if (THEMES.some((t) => t.id === next)) setThemeState(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}