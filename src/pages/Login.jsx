import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import InputField from '../components/InputField';
import FeedbackMessage from '../components/FeedbackMessage';

const PAGE_VARIANTS = {
    initial: { opacity: 0, x: 60, filter: 'blur(4px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -60, filter: 'blur(4px)', transition: { duration: 0.3, ease: [0.55, 0, 1, 0.45] } },
};

const fireLoginConfetti = () => {
    const opts = {
        particleCount: 80, spread: 70, origin: { y: 0.6 },
        colors: ['#6366f1', '#f5c842', '#10b981', '#a5b4fc', '#fde68a'],
    };
    confetti({ ...opts, angle: 60, origin: { x: 0.1, y: 0.6 } });
    confetti({ ...opts, angle: 120, origin: { x: 0.9, y: 0.6 } });
    setTimeout(() => {
        confetti({ ...opts, particleCount: 50, angle: 90, origin: { x: 0.5, y: 0.5 } });
    }, 200);
};

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [pageExiting, setPageExiting] = useState(false);
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

        if (!form.username || !form.password) {
            setFeedback({ type: 'error', message: 'Please enter your username and password.' });
            triggerShake(); return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // 🎉 SUCCESS — confetti + morph button
            setLoginSuccess(true);
            setFeedback({ type: 'success', message: data.message });
            fireLoginConfetti();

            // Redirect to dashboard
            setTimeout(() => setPageExiting(true), 900);
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setFeedback({ type: 'error', message: err.message });
            triggerShake();
        } finally {
            if (!loginSuccess) setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {!pageExiting ? (
                <motion.div
                    key="login-page"
                    className="kb-center page"
                    variants={PAGE_VARIANTS}
                    initial="initial" animate="animate" exit="exit"
                >
                    <motion.div
                        className={`kb-card${loginSuccess ? ' kb-card--glow-success' : ''}`}
                        initial={{ opacity: 0, y: 40, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="kb-brand">
                            <div className="kb-logo">🏦</div>
                            <h1>Kodbank</h1>
                            <p>Welcome back — sign in to your account</p>
                        </div>

                        <motion.form
                            key={shakeKey}
                            onSubmit={handleSubmit}
                            noValidate
                            animate={shakeKey > 0 ? { x: [0, -9, 9, -7, 7, -4, 4, 0] } : { x: 0 }}
                            transition={{ duration: 0.45, ease: 'easeInOut' }}
                        >
                            <InputField
                                label="Username" type="text" placeholder="Your username"
                                value={form.username} onChange={set('username')}
                                icon="👤" disabled={loading || loginSuccess} error={inputError}
                            />
                            <InputField
                                label="Password" type="password" placeholder="Your password"
                                value={form.password} onChange={set('password')}
                                icon="🔑" isPassword disabled={loading || loginSuccess} error={inputError}
                            />

                            <motion.button
                                type="submit"
                                className={`kb-btn${loginSuccess ? ' kb-btn--success' : ''}`}
                                disabled={loading || loginSuccess}
                                whileTap={!loading && !loginSuccess ? { scale: 0.98 } : {}}
                                onClick={!loading && !loginSuccess ? addRipple : undefined}
                            >
                                <span className="kb-btn-content">
                                    {loginSuccess ? (
                                        <motion.span className="kb-btn-check"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                                        >✓ Authenticated!</motion.span>
                                    ) : loading ? (
                                        <><span className="kb-spinner" />Signing in…</>
                                    ) : 'Sign In →'}
                                </span>
                            </motion.button>
                        </motion.form>

                        <AnimatePresence mode="wait">
                            {feedback && <FeedbackMessage key={feedback.message} type={feedback.type} message={feedback.message} />}
                        </AnimatePresence>

                        {!loginSuccess && (
                            <p className="kb-footer">
                                No account yet? <button type="button" onClick={() => navigate('/register')}>Create one free →</button>
                            </p>
                        )}
                    </motion.div>
                </motion.div>
            ) : (
                <motion.div
                    key="exit-overlay"
                    className="kb-success-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <motion.div
                        className="kb-redirect-indicator"
                        initial={{ opacity: 0, scale: 0.88 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="kb-redirect-spinner" />
                        <span>Loading your dashboard…</span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
