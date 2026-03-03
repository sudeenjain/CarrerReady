import React from 'react';
import { useTheme } from '../src/contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const cycleTheme = () => {
        if (theme === 'light') setTheme('dark');
        else if (theme === 'dark') setTheme('system');
        else setTheme('light');
    };

    const titles = {
        light: 'Switch to Dark Mode',
        dark: 'Switch to System Mode',
        system: 'Switch to Light Mode'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={cycleTheme}
            className="relative p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--glass-bg)] hover:bg-[var(--glass-bg)]/80 transition-colors flex items-center justify-center overflow-hidden group shadow-sm z-50"
            aria-label="Toggle theme"
            title={titles[theme]}
        >
            <div className="relative w-5 h-5 flex items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                    {theme === 'light' && (
                        <motion.div
                            key="light"
                            initial={{ scale: 0, opacity: 0, rotate: -90 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                            className="absolute text-amber-500 group-hover:text-amber-400"
                        >
                            <Sun size={20} />
                        </motion.div>
                    )}
                    {theme === 'dark' && (
                        <motion.div
                            key="dark"
                            initial={{ scale: 0, opacity: 0, rotate: -90 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                            className="absolute text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300"
                        >
                            <Moon size={20} />
                        </motion.div>
                    )}
                    {theme === 'system' && (
                        <motion.div
                            key="system"
                            initial={{ scale: 0, opacity: 0, rotate: -90 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                            className="absolute text-[var(--text-muted)] group-hover:text-[var(--text-main)]"
                        >
                            <Monitor size={20} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.button>
    );
}
