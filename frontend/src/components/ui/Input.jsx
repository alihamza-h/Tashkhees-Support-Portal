import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Input = ({
    label,
    error,
    icon: Icon,
    type = 'text',
    className = '',
    ...props
}) => {
    const [focused, setFocused] = useState(false);

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-brown-700 dark:text-neutral-300 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-beige-500 dark:text-neutral-400">
                        <Icon size={20} />
                    </div>
                )}
                <motion.input
                    type={type}
                    className={`input-field ${Icon ? 'pl-12' : ''} ${error ? 'border-critical-500 focus:ring-critical-500' : ''} ${className}`}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    {...props}
                />
                {focused && (
                    <motion.div
                        layoutId="input-border"
                        className="absolute inset-0 border-2 border-peach-400 dark:border-primary-500 rounded-xl pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </div>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-critical-500"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};

export default Input;
