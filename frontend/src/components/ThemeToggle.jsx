import React from 'react';
import { motion } from 'framer-motion';
import { FaSun, FaMoon, FaCloud } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const icons = {
  light: FaSun,
  dark: FaMoon,
  lavender: FaCloud
};

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const Icon = icons[theme] || FaSun;

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-xl bg-[var(--color-button-muted)] text-[var(--color-text-primary)] hover:shadow-md transition-colors"
      aria-label="Toggle Theme"
    >
      <motion.div initial={false} animate={{ rotate: theme === 'dark' ? 180 : 0 }} transition={{ duration: 0.3 }}>
        <Icon size={18} />
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
