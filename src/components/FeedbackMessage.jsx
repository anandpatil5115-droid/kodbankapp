import React from 'react';
import { motion } from 'framer-motion';

export default function FeedbackMessage({ type, message }) {
    return (
        <motion.div
            className={`kb-feedback ${type}`}
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            role="alert"
            aria-live="polite"
        >
            <span style={{ flexShrink: 0, marginTop: 1 }}>{type === 'success' ? '✓' : '⚠'}</span>
            <span>{message}</span>
        </motion.div>
    );
}
