import React from 'react';
import { motion } from 'framer-motion';
import { FaCircle } from 'react-icons/fa';

const Badge = ({ status, className = '', size = 'md' }) => {
    const statusConfig = {
        'TO DO': {
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/30',
            text: 'text-blue-400',
            dot: '#3b82f6',
            label: 'TO DO'
        },
        'In Progress': {
            bg: 'bg-yellow-500/20',
            border: 'border-yellow-500/30',
            text: 'text-yellow-400',
            dot: '#eab308',
            label: 'In Progress'
        },
        'In Progress QA': {
            bg: 'bg-orange-500/20',
            border: 'border-orange-500/30',
            text: 'text-orange-400',
            dot: '#f97316',
            label: 'In Progress QA'
        },
        'Completed': {
            bg: 'bg-emerald-500/20',
            border: 'border-emerald-500/30',
            text: 'text-emerald-400',
            dot: '#10b981',
            label: 'Completed'
        },
        'Done': {
            bg: 'bg-green-500/20',
            border: 'border-green-500/30',
            text: 'text-green-400',
            dot: '#22c55e',
            label: 'Done'
        },
        // Legacy statuses for backwards compatibility
        'Open': {
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/30',
            text: 'text-blue-400',
            dot: '#3b82f6',
            label: 'TO DO'
        },
        'Resolved': {
            bg: 'bg-green-500/20',
            border: 'border-green-500/30',
            text: 'text-green-400',
            dot: '#22c55e',
            label: 'Resolved'
        },
        'Closed': {
            bg: 'bg-gray-500/20',
            border: 'border-gray-500/30',
            text: 'text-gray-400',
            dot: '#6b7280',
            label: 'Closed'
        },
    };

    const sizeConfig = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    const config = statusConfig[status] || statusConfig['TO DO'];

    return (
        <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
        inline-flex items-center gap-2 rounded-full font-semibold
        ${config.bg} ${config.border} ${config.text} border
        ${sizeConfig[size]}
        ${className}
      `}
        >
            <FaCircle size={6} color={config.dot} className="animate-pulse" />
            {config.label}
        </motion.span>
    );
};

export default Badge;
