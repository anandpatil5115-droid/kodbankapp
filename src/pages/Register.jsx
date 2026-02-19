import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import FeedbackMessage from '../components/FeedbackMessage';

const PAGE_VARIANTS = {
    initial: { opacity: 0, x: 60, filter: 'blur(4px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -60, filter: 'blur(4px)', transition: { duration: 0.3, ease: [0.55, 0, 1, 0.45] } },
};

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [shakeKey, setShakeKey] = useState(0);
    const [inputError, setInputError] = useState(false);

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const triggerShake = () => {
        setInputError(true);
        setShakeKey(k => k + 1);
        setTimeout(() => setInputError(false), 900);
    };

    const addRipple = (e) => {
        const btn = e.currentTarget;
        const r = document.createElement('span');
        const d = Math.max(btn.clientWidth, btn.clientHeight);
        const rect = btn.getBoundingClientRect();
        r.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - rect.left - d / 2}px;top:${e.clientY - rect.top - d / 2}px`;
        r.className = 'ripple';
        btn.appendChild(r);
        setTimeout(() => r.remove(), 600);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        addRipple(e);
        setFeedback(null);

        const { username, email, password, phone } = form;
        if (!username || !email || !password) {
            setFeedback({ type: 'error', message: 'Please fill in all required fields.' });
            triggerShake(); return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setFeedback({ type: 'error', message: 'Please enter a valid email address.' });
            triggerShake(); return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, phone }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setSuccess(true);
            setFeedback({ type: 'success', message: data.message });

            // Redirect to login with slide animation after success
            setTimeout(() => navigate('/login'), 1600);
        } catch (err) {
            setFeedback({ type: 'error', message: err.message });
            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div className="kb-center page" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
            <motion.div
                className={`kb-card${success ? ' kb-card--glow-success' : ''}`}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Brand */}
                <div className="kb-brand">
                    <div className="kb-logo">🏦</div>
                    <h1>Kodbank</h1>
                    <p>Open your premium account</p>
                </div>

                <motion.form
                    key={shakeKey}
                    onSubmit={handleSubmit}
                    noValidate
                    animate={shakeKey > 0 ? { x: [0, -9, 9, -7, 7, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                >
                    <InputField
                        label="Username *" type="text" placeholder="e.g. john_doe"
                        value={form.username} onChange={set('username')}
                        icon="👤" disabled={loading || success} error={inputError}
                    />
                    <InputField
                        label="Email *" type="email" placeholder="you@example.com"
                        value={form.email} onChange={set('email')}
                        icon="✉" disabled={loading || success} error={inputError}
                    />
                    <InputField
                        label="Password *" type="password" placeholder="Min 6 characters"
                        value={form.password} onChange={set('password')}
                        icon="🔑" isPassword disabled={loading || success} error={inputError}
                    />
                    <InputField
                        label="Phone" type="tel" placeholder="+91 9000000000 (optional)"
                        value={form.phone} onChange={set('phone')}
                        icon="📱" disabled={loading || success}
                    />

                    <motion.button
                        type="submit"
                        className={`kb-btn${success ? ' kb-btn--success' : ''}`}
                        disabled={loading || success}
                        whileTap={!loading && !success ? { scale: 0.98 } : {}}
                        onClick={!loading && !success ? addRipple : undefined}
                    >
                        <span className="kb-btn-content">
                            {success ? (
                                <motion.span className="kb-btn-check"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                                >✓ Account Created!</motion.span>
                            ) : loading ? (
                                <><span className="kb-spinner" />Creating account…</>
                            ) : 'Create Account →'}
                        </span>
                    </motion.button>
                </motion.form>

                <AnimatePresence mode="wait">
                    {feedback && <FeedbackMessage key={feedback.message} type={feedback.type} message={feedback.message} />}
                </AnimatePresence>

                {!success && (
                    <p className="kb-footer">
                        Already have an account? <button type="button" onClick={() => navigate('/login')}>Sign in →</button>
                    </p>
                )}
            </motion.div>
        </motion.div>
    );
}
