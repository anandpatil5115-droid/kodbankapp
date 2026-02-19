import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const PAGE_VARIANTS = {
    initial: { opacity: 0, y: 30, scale: 0.97, filter: 'blur(4px)' },
    animate: {
        opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
    },
    exit: {
        opacity: 0, scale: 1.03, filter: 'blur(6px)',
        transition: { duration: 0.35, ease: [0.55, 0, 1, 0.45] }
    },
};

const formatBalance = (n) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n);

const fireCelebration = () => {
    // 🎉 Big celebration confetti
    const duration = 2200;
    const end = Date.now() + duration;
    const colors = ['#6366f1', '#f5c842', '#10b981', '#fde68a', '#a5b4fc', '#6ee7b7'];

    (function frame() {
        confetti({
            particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.65 }, colors,
        });
        confetti({
            particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
    })();

    // Center burst
    setTimeout(() => {
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.55 }, colors, scalar: 1.2 });
    }, 300);
};

const spawnSparkles = () => {
    const symbols = ['✦', '★', '✧', '✶', '⬟', '◆'];
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'sparkle';
            el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            el.style.cssText = `
        left:${20 + Math.random() * 60}vw;
        top:${20 + Math.random() * 50}vh;
        font-size:${14 + Math.random() * 18}px;
        color:${['#f5c842', '#6366f1', '#10b981', '#a5b4fc'][Math.floor(Math.random() * 4)]};
      `;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 800);
        }, i * 80);
    }
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(null);
    const [loadingBalance, setLoadingBalance] = useState(false);
    const [balanceRevealed, setBalanceRevealed] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [feedback, setFeedback] = useState(null);

    // Verify JWT on mount
    useEffect(() => {
        fetch('/api/me', { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                if (!data.success) navigate('/login');
                else setUser(data.user);
            })
            .catch(() => navigate('/login'))
            .finally(() => setCheckingAuth(false));
    }, [navigate]);

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

    const handleCheckBalance = async (e) => {
        addRipple(e);
        setFeedback(null);
        setLoadingBalance(true);
        try {
            const res = await fetch('/api/balance', { credentials: 'include' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setBalance(data.balance);
            setBalanceRevealed(true);

            // 🎉 Celebration!
            fireCelebration();
            spawnSparkles();

        } catch (err) {
            setFeedback({ type: 'error', message: err.message });
            if (err.message.includes('auth') || err.message.includes('log in')) navigate('/login');
        } finally {
            setLoadingBalance(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        navigate('/login');
    };

    if (checkingAuth) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="kb-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            </div>
        );
    }

    return (
        <motion.div
            className="dashboard-page page"
            variants={PAGE_VARIANTS}
            initial="initial" animate="animate" exit="exit"
        >
            {/* Topbar */}
            <div className="kb-topbar">
                <span className="kb-topbar-brand">🏦 Kodbank</span>
                <button className="kb-logout-btn" onClick={handleLogout}>Sign out</button>
            </div>

            <div className="dashboard-content">
                <motion.div
                    className="dashboard-card"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Welcome */}
                    <div className="dash-welcome">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35, duration: 0.5 }}
                        >
                            Welcome, {user?.username}! 👋
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.45, duration: 0.5 }}
                        >
                            Your secure digital banking dashboard
                        </motion.p>
                        <motion.span
                            className="dash-role-badge"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.55, duration: 0.4, type: 'spring' }}
                        >
                            🛡 {user?.role?.toUpperCase()}
                        </motion.span>
                    </div>

                    {/* Stats row */}
                    <motion.div
                        className="dash-stats"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.5 }}
                    >
                        <div className="stat-card">
                            <div className="stat-label">Account</div>
                            <div className="stat-value">{user?.username}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Status</div>
                            <div className="stat-value" style={{ color: '#6ee7b7' }}>● Active</div>
                        </div>
                    </motion.div>

                    {/* Balance display */}
                    <AnimatePresence>
                        {balanceRevealed && balance !== null && (
                            <motion.div
                                className="balance-display"
                                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="balance-label">💰 Your Available Balance</div>
                                <motion.div
                                    className="balance-amount"
                                    initial={{ opacity: 0, scale: 0.6, filter: 'blur(8px)' }}
                                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                    transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <span className="balance-currency">₹</span>
                                    {formatBalance(balance)}
                                </motion.div>
                                <div className="balance-hint">Kodbank Savings Account</div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Check balance button */}
                    <motion.button
                        className={`kb-btn kb-btn--gold${balanceRevealed ? ' kb-btn--success' : ''}`}
                        onClick={handleCheckBalance}
                        disabled={loadingBalance}
                        whileHover={!loadingBalance ? { scale: 1.012, y: -2 } : {}}
                        whileTap={!loadingBalance ? { scale: 0.98 } : {}}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.5 }}
                    >
                        <span className="kb-btn-content">
                            {loadingBalance ? (
                                <><span className="kb-spinner kb-spinner--gold" />Checking balance…</>
                            ) : balanceRevealed ? (
                                <motion.span className="kb-btn-check"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                                >✓ Balance Revealed!</motion.span>
                            ) : '💰 Check Balance'}
                        </span>
                    </motion.button>

                    {feedback && (
                        <motion.div
                            className={`kb-feedback ${feedback.type}`}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.28 }}
                            role="alert"
                        >
                            <span>{feedback.type === 'error' ? '⚠ ' : '✓ '}{feedback.message}</span>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
