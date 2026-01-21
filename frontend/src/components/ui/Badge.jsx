import React from 'react';
import { motion } from 'framer-motion';
import { FaCircle } from 'react-icons/fa';

const Badge = ({ status, className = '', size = 'md' }) => {
    const statusConfig = {
        'TO DO': {
            bg: 'bg-todo-500/20',
            border: 'border-todo-500/30',
            text: 'text-todo-400',
            dot: '#A78BFA', // Violet
            label: 'TO DO'
        },
        'In Progress': {
            bg: 'bg-inprogress-500/20',
            border: 'border-inprogress-500/30',
            text: 'text-inprogress-400',
            dot: '#38BDF8', // Sky
            label: 'In Progress'
        },
        'In Progress QA': {
            bg: 'bg-qa-500/20',
            border: 'border-qa-500/30',
            text: 'text-qa-400',
            dot: '#E879F9', // Pink
            label: 'In Progress QA'
        },
        'Completed': {
            bg: 'bg-completed-500/20',
            border: 'border-completed-500/30',
            text: 'text-completed-400',
            dot: '#34D399', // Emerald
            label: 'Completed'
        },
        'Done': {
            bg: 'bg-done-500/20',
            border: 'border-done-500/30',
            text: 'text-done-400',
            dot: '#2DD4BF', // Teal
            label: 'Done'
        },
        // Legacy statuses
        'Open': {
            bg: 'bg-todo-500/20',
            border: 'border-todo-500/30',
            text: 'text-todo-400',
            dot: '#A78BFA',
            label: 'TO DO'
        },
        'Resolved': {
            bg: 'bg-completed-500/20',
            border: 'border-completed-500/30',
            text: 'text-completed-400',
            dot: '#34D399',
            label: 'Resolved'
        },
        'Closed': {
            bg: 'bg-unassigned-500/20',
            border: 'border-unassigned-500/30',
            text: 'text-unassigned-400',
            dot: '#CBD5E1',
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
