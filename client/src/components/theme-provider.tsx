import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  availableThemes: { value: Theme; label: string; colors: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes = [
  { value: 'dark' as Theme, label: 'Dark', colors: 'bg-gray-950 border-gray-800' },
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always use dark theme
  const [theme] = useState<Theme>('dark');

  useEffect(() => {
    const root = document.documentElement;
    
    // Always apply dark class
    root.classList.add('dark');
    
    // Remove any other theme classes
    root.classList.remove('ocean', 'nature', 'sunset', 'midnight');
    
    // Clear CSS variables (not needed for traditional dark theme)
    root.style.removeProperty('--theme-bg');
    root.style.removeProperty('--theme-bg-secondary');
    root.style.removeProperty('--theme-accent');
    root.style.removeProperty('--theme-text');
    
    // Set theme preference in localStorage
    localStorage.setItem('app-theme', 'dark');
  }, []);

  // setTheme does nothing - theme is locked to dark
  const setTheme = () => {
    // Theme is locked to dark, do nothing
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
