import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { themeOptions, defaultThemeId } from '../theme/themes';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const themeMap = themeOptions.reduce((acc, theme) => {
  acc[theme.id] = theme;
  return acc;
}, {});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themeMap[savedTheme]) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : defaultThemeId;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const selected = themeMap[theme] || themeMap[defaultThemeId];

    themeOptions.forEach((opt) => root.classList.remove(`theme-${opt.id}`));
    root.classList.remove('light', 'dark');
    root.classList.add(`theme-${selected.id}`);
    root.classList.add(selected.id === 'dark' ? 'dark' : 'light');

    Object.entries(selected.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    localStorage.setItem('theme', selected.id);
  }, [theme]);

  const toggleTheme = () => {
    const order = themeOptions.map((t) => t.id);
    const currentIndex = order.indexOf(theme);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % order.length;
    setTheme(order[nextIndex]);
  };

  const setThemeById = (id) => {
    if (themeMap[id]) setTheme(id);
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeById,
      toggleTheme,
      themes: themeOptions
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
