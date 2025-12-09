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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon size={20} />
                    </div>
                )}
                <motion.input
                    type={type}
                    className={`input-field ${Icon ? 'pl-12' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    {...props}
                />
                {focused && (
                    <motion.div
                        layoutId="input-border"
                        className="absolute inset-0 border-2 border-purple-500 rounded-xl pointer-events-none"
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
                    className="mt-2 text-sm text-red-400"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};

export default Input;
