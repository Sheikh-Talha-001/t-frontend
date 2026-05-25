import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 1. Initialize from localStorage user preferences if available
    const initTheme = () => {
      try {
        const storedUserStr = localStorage.getItem('user');
        if (storedUserStr) {
          const user = JSON.parse(storedUserStr);
          if (user?.preferences?.darkMode !== undefined) {
            setIsDarkMode(user.preferences.darkMode);
          } else {
            // Fallback to light mode by default
            setIsDarkMode(false);
          }
        }
      } catch (e) {
        console.error("Failed to parse user preferences for theme", e);
      }
      setIsInitialized(true);
    };

    initTheme();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode, isInitialized]);

  const toggleTheme = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Save locally
    try {
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
        const user = JSON.parse(storedUserStr);
        user.preferences = { ...user.preferences, darkMode: newDarkMode };
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (e) {
      // ignore
    }

    // Persist to backend permanently
    try {
      await api.patch('/users/preferences', { darkMode: newDarkMode });
    } catch (error) {
      console.error("Failed to sync theme preference to server", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
