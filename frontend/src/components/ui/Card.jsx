import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = false, ...props }) => {
    const cardClass = hover ? 'glass-card-hover' : 'glass-card';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`${cardClass} p-6 ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
