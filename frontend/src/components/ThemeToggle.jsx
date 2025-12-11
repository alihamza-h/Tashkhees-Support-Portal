import React from 'react';
import { motion } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-xl bg-beige-200 dark:bg-neutral-800 text-brown-700 dark:text-neutral-200 hover:bg-beige-300 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Toggle Theme"
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.3 }}
            >
                {theme === 'dark' ? <FaMoon size={18} /> : <FaSun size={18} className="text-orange-500" />}
            </motion.div>
        </button>
    );
};

export default ThemeToggle;
