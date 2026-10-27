import React, { useEffect, useRef, useState } from 'react';

interface GamesPageProps {
    onComplete: () => void;
}

/* ---------- Tunables ---------- */
const HOLD_MS = 1500; // long-press duration needed to catch the heart
const HINT_AFTER_DODGES = 5; // show the teasing popup at this many dodges
const MOVE_TOLERANCE_PX = 12; // finger jitter allowed during a hold
const POS_MIN = 10; // % (safe padding from screen edges)
const POS_MAX = 80; // %
const GLIDE_EASING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const ENERGY_GOAL = 5000; // battery counts as "charged" at this value
const ENERGY_PER_TAP = 35; // ~143 taps (use 45 for ~111 taps)
const CHARGE_FX_MS = 3200;

const getStatusMessage = (val: number) => {
    if (val < 500) return 'Warm Love Spark 💕';
    if (val < 1200) return 'Heart Overload Warning! ⚡';
    if (val < 2500) return 'Breaking Laws of Physics 🚀';
    if (val < 3800) return 'Galaxy-Level Devotion 🌌';
    if (val < 5000) return 'Cosmic Infinity 👑';
    return 'Beyond Measure & Eternity 💍';
};

const randomPercent = () =>
    Math.floor(Math.random() * (POS_MAX - POS_MIN + 1)) + POS_MIN;

/* Small burst when the heart is caught */
const BURST_EMOJIS = ['💖', '✨', '💘', '⭐', '💕'];
const BURST_PARTICLES = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const dist = 90 + (i % 3) * 30;
    return {
        emoji: BURST_EMOJIS[i % BURST_EMOJIS.length],
        dx: `${Math.round(Math.cos(angle) * dist)}px`,
        dy: `${Math.round(Math.sin(angle) * dist)}px`,
    };
});

/* Full-screen explosion when the battery is full */
const CONFETTI_COLORS = ['#fbbf24', '#f59e0b', '#fde68a', '#fb7185', '#fcd34d'];
const CHARGE_PARTICLES = Array.from({ length: 36 }, (_, i) => {
    const angle = (i / 36) * Math.PI * 2 + (i % 2) * 0.12;
    const dist = 140 + ((i * 53) % 220);
    const isEmoji = i % 3 === 0;
    return {
        isEmoji,
        emoji: ['💖', '✨', '👑', '💛'][i % 4],
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        dx: `${Math.round(Math.cos(angle) * dist)}px`,
        dy: `${Math.round(Math.sin(angle) * dist)}px`,
        delay: `${(i % 6) * 40}ms`,
    };
});

export const GamesPage: React.FC<GamesPageProps> = ({ onComplete }) => {
    // Game 1: Dodging Heart
    const [heartPos, setHeartPos] = useState({ top: 40, left: 45 });
    const [dodgeCount, setDodgeCount] = useState(0);
    const [isHeartCaught, setIsHeartCaught] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [hintSeen, setHintSeen] = useState(false);

    // Game 2: Love Battery
    const [energy, setEnergy] = useState(0);
    const [showChargeFx, setShowChargeFx] = useState(false);
    const isCharged = energy >= ENERGY_GOAL;

    const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const holdFired = useRef(false);
    const pressStart = useRef<{ x: number; y: number } | null>(null);
    const audioCtx = useRef<AudioContext | null>(null);

    useEffect(() => {
        return () => {
            if (holdTimer.current) clearTimeout(holdTimer.current);
            audioCtx.current?.close().catch(() => undefined);
        };
    }, []);

    // Trigger the full-screen celebration once the battery fills up
    useEffect(() => {
        if (!isCharged) return;
        setShowChargeFx(true);
        playChime();
        const t = setTimeout(() => setShowChargeFx(false), CHARGE_FX_MS);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCharged]);

    /* ---------- Audio / haptics ---------- */
    const ensureAudio = () => {
        try {
            const Ctx =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext })
                    .webkitAudioContext;
            if (!Ctx) return;
            if (!audioCtx.current) audioCtx.current = new Ctx();
            if (audioCtx.current.state === 'suspended') {
                void audioCtx.current.resume();
            }
        } catch {
            /* audio unavailable – ignore */
        }
    };

    function playChime() {
        try {
            const ctx = audioCtx.current;
            if (ctx) {
                [659.25, 783.99, 1046.5].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const t = ctx.currentTime + i * 0.12;
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.0001, t);
                    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
                    osc.connect(gain).connect(ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.4);
                });
            }
        } catch {
            /* ignore */
        }
        if ('vibrate' in navigator) navigator.vibrate?.([40, 40, 80]);
    }

    /* ---------- Game 1 logic ---------- */
    const clearHold = () => {
        if (holdTimer.current) {
            clearTimeout(holdTimer.current);
            holdTimer.current = null;
        }
    };

    const teleportHeart = () => {
        setHeartPos({ top: randomPercent(), left: randomPercent() });
        const next = dodgeCount + 1;
        setDodgeCount(next);
        if (next >= HINT_AFTER_DODGES && !hintSeen) {
            setShowHint(true);
            setHintSeen(true);
        }
    };

    const handleHeartPressStart = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (isHeartCaught || showHint) return;
        ensureAudio();
        holdFired.current = false;
        pressStart.current = { x: e.clientX, y: e.clientY };
        clearHold();
        holdTimer.current = setTimeout(() => {
            holdFired.current = true;
            holdTimer.current = null;
            setIsHeartCaught(true);
            playChime();
        }, HOLD_MS);
    };

    // Finger lifted before 1.5s => it was only a tap, so the heart glides away.
    const handleHeartPressEnd = () => {
        if (isHeartCaught || holdFired.current) return;
        if (!holdTimer.current) return; // hold was already cancelled (moved / left)
        clearHold();
        teleportHeart();
    };

    // Drifting finger cancels the hold without counting as a dodge.
    const handleHeartMove = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (!holdTimer.current || !pressStart.current) return;
        const dx = e.clientX - pressStart.current.x;
        const dy = e.clientY - pressStart.current.y;
        if (Math.hypot(dx, dy) > MOVE_TOLERANCE_PX) clearHold();
    };

    const handleHeartCancel = () => clearHold();

    /* ---------- Game 2 logic ---------- */
    const addEnergy = () => {
        if (isCharged) return;
        ensureAudio();
        setEnergy((prev) => Math.min(ENERGY_GOAL, prev + ENERGY_PER_TAP));
        if ('vibrate' in navigator) navigator.vibrate?.(8);
    };

    const isPageReady = isHeartCaught && isCharged;
    const batteryFill = Math.min(100, (energy / ENERGY_GOAL) * 100);

    return (
        <div
            className="relative w-full min-h-[100dvh] mx-auto max-w-md px-4 text-center select-none"
            style={{
                paddingTop: 'max(1.25rem, env(safe-area-inset-top))',
                paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
                WebkitTapHighlightColor: 'transparent',
            }}
        >
            <style>{`
                @keyframes gp-burst { 0% { transform: translate(-50%,-50%) scale(.4); opacity: 1; }
                    100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.2); opacity: 0; } }
                @keyframes gp-confetti { 0% { transform: translate(-50%,-50%) scale(.2) rotate(0deg); opacity: 1; }
                    70% { opacity: 1; }
                    100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.7) rotate(540deg); opacity: 0; } }
                @keyframes gp-border { 0%,100% { opacity: 0; } 35% { opacity: 1; } 70% { opacity: .25; } }
                @keyframes gp-flash { 0% { opacity: .55; transform: translate(-50%,-50%) scale(.2); }
                    100% { opacity: 0; transform: translate(-50%,-50%) scale(5); } }
                @keyframes gp-aura { 0%,100% { box-shadow: 0 0 40px rgba(245,158,11,.6); } 50% { box-shadow: 0 0 70px rgba(245,158,11,.95); } }
                @keyframes gp-pop { 0% { transform: scale(.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                @keyframes gp-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
                .gp-burst { animation: gp-burst 1.2s ease-out forwards; }
                .gp-confetti { animation: gp-confetti 1.8s cubic-bezier(.2,.7,.3,1) forwards; }
                .gp-border { animation: gp-border 1s ease-out 3; }
                .gp-flash { animation: gp-flash 1.1s ease-out forwards; }
                .gp-aura { animation: gp-aura 1.4s ease-in-out infinite; }
                .gp-pop { animation: gp-pop .22s ease-out both; }
                .gp-bob { animation: gp-bob 1.2s ease-in-out infinite; }
                @media (prefers-reduced-motion: reduce) {
                    .gp-burst, .gp-confetti, .gp-border, .gp-flash, .gp-aura, .gp-pop, .gp-bob { animation: none; }
                }
            `}</style>

            {/* Header */}
            <header className="space-y-2 pb-5">
                <h2 className="text-3xl font-serif text-amber-300 font-bold leading-tight">
                    Love Arena &amp; Heart Dodge
                </h2>
                <p className="text-sm text-slate-300 font-light">
                    Finish both challenges to unlock the Grand Prize Reveal.
                </p>
            </header>

            <div className="space-y-5">
                {/* GAME 1 – status card (the heart itself roams the whole screen) */}
                <section className="w-full rounded-3xl border-2 border-amber-400/40 bg-slate-900/90 p-5 shadow-2xl text-left space-y-2">
                    <span className="text-xs tracking-wide text-amber-400 font-bold">
                        Challenge 1
                    </span>
                    <h3 className="text-xl font-serif text-amber-200 font-bold">
                        Catch My Heart 💖
                    </h3>
                    <p className="text-sm text-slate-300 min-h-[2.5rem]" aria-live="polite">
                        {isHeartCaught
                            ? '🎉 You caught it! My heart was yours all along.'
                            : dodgeCount === 0
                                ? 'A heart is floating on your screen. Try to tap it!'
                                : `It dodged you ${dodgeCount} ${dodgeCount === 1 ? 'time' : 'times'}! Keep trying 🏃‍♂️💨`}
                    </p>
                    {isHeartCaught && (
                        <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold">
                            <span className="text-2xl gp-bob">💘</span> Caught – 100% secured
                        </div>
                    )}
                </section>

                {/* GAME 2 – Love Battery */}
                <section
                    className={`w-full rounded-3xl border-2 bg-slate-900/90 p-5 space-y-4 text-left transition-all duration-500 ${isCharged
                        ? 'border-amber-300 shadow-[0_0_50px_rgba(245,158,11,0.8)] gp-aura'
                        : 'border-amber-400/40 shadow-2xl'
                        }`}
                >
                    <div className="space-y-1">
                        <span className="text-xs tracking-wide text-amber-400 font-bold">
                            Challenge 2: Charge the Love Battery ⚡
                        </span>
                        <h3
                            className="text-xl font-serif text-amber-200 font-bold min-h-[1.75rem]"
                            aria-live="polite"
                        >
                            {getStatusMessage(energy)}
                        </h3>
                        <p className="text-sm text-slate-300">
                            Keep tapping. It takes real effort to fill this one.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-amber-300 font-bold">Love power</span>
                            <span className="text-2xl font-bold text-amber-200 tabular-nums">
                                {energy.toLocaleString()}
                                <span className="text-sm text-amber-400"> / {ENERGY_GOAL.toLocaleString()}</span>
                            </span>
                        </div>
                        <div
                            className="w-full h-5 bg-slate-950 rounded-full p-1 border border-amber-500/20 overflow-hidden"
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={ENERGY_GOAL}
                            aria-valuenow={energy}
                        >
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400 rounded-full transition-[width] duration-150 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                                style={{ width: `${batteryFill}%` }}
                            />
                        </div>
                    </div>

                    <button
                        onPointerDown={(e) => {
                            if (e.pointerType !== 'mouse' || e.button === 0) addEnergy();
                        }}
                        onClick={(e) => {
                            // Keyboard activation (Enter/Space) has detail === 0
                            if (e.detail === 0) addEnergy();
                        }}
                        disabled={isCharged}
                        style={{ touchAction: 'manipulation' }}
                        className={`w-full min-h-[56px] py-4 rounded-2xl font-bold text-base transition-transform shadow-md ${isCharged
                            ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 cursor-default'
                            : 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 active:scale-95'
                            }`}
                    >
                        {isCharged ? '⚡ Battery fully charged!' : '⚡ Tap to charge'}
                    </button>
                </section>

                {/* Unlock */}
                <div className="pt-1">
                    <button
                        onClick={onComplete}
                        disabled={!isPageReady}
                        className={`w-full min-h-[56px] px-6 py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-xl ${isPageReady
                            ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.4)] cursor-pointer'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                    >
                        {isPageReady
                            ? 'Unlock Grand Prize Reveal →'
                            : 'Finish both challenges to continue 🔒'}
                    </button>
                </div>
            </div>

            {/* ===== Full-screen roaming heart (viewport-relative) ===== */}
            {!isHeartCaught && (
                <button
                    type="button"
                    aria-label="Floating heart. Press and hold for 1.5 seconds to catch it."
                    onPointerDown={handleHeartPressStart}
                    onPointerUp={handleHeartPressEnd}
                    onPointerMove={handleHeartMove}
                    onPointerCancel={handleHeartCancel}
                    onPointerLeave={handleHeartCancel}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{
                        position: 'fixed',
                        top: `${heartPos.top}%`,
                        left: `${heartPos.left}%`,
                        transform: 'translate(-50%, -50%)',
                        transition: `top 0.4s ${GLIDE_EASING}, left 0.4s ${GLIDE_EASING}`,
                        width: 72,
                        height: 72,
                        zIndex: 40,
                        touchAction: 'none',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                    }}
                    className="flex items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-3xl shadow-[0_0_24px_rgba(244,63,94,0.65)] cursor-pointer outline-none"
                >
                    💖
                </button>
            )}

            {/* Celebration burst where the heart was caught */}
            {isHeartCaught && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none"
                    style={{
                        position: 'fixed',
                        top: `${heartPos.top}%`,
                        left: `${heartPos.left}%`,
                        zIndex: 40,
                    }}
                >
                    {BURST_PARTICLES.map((p, i) => (
                        <span
                            key={i}
                            className="gp-burst absolute text-2xl"
                            style={
                                {
                                    top: 0,
                                    left: 0,
                                    '--dx': p.dx,
                                    '--dy': p.dy,
                                } as React.CSSProperties
                            }
                        >
                            {p.emoji}
                        </span>
                    ))}
                </div>
            )}

            {/* Full-bar explosion: border pulse, flash, gold/heart particles, confetti */}
            {showChargeFx && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none fixed inset-0 overflow-hidden"
                    style={{ zIndex: 45 }}
                >
                    <div
                        className="gp-border absolute inset-0"
                        style={{
                            boxShadow:
                                'inset 0 0 0 6px rgba(251,191,36,0.95), inset 0 0 90px 20px rgba(245,158,11,0.7)',
                        }}
                    />
                    <div
                        className="gp-flash absolute rounded-full"
                        style={{
                            top: '50%',
                            left: '50%',
                            width: 160,
                            height: 160,
                            background:
                                'radial-gradient(circle, rgba(253,230,138,0.9), rgba(245,158,11,0) 70%)',
                        }}
                    />
                    <div className="absolute" style={{ top: '50%', left: '50%' }}>
                        {CHARGE_PARTICLES.map((p, i) => (
                            <span
                                key={i}
                                className="gp-confetti absolute"
                                style={
                                    {
                                        top: 0,
                                        left: 0,
                                        '--dx': p.dx,
                                        '--dy': p.dy,
                                        animationDelay: p.delay,
                                        ...(p.isEmoji
                                            ? { fontSize: 26 }
                                            : {
                                                width: 10,
                                                height: 16,
                                                borderRadius: 2,
                                                background: p.color,
                                            }),
                                    } as unknown as React.CSSProperties
                                }
                            >
                                {p.isEmoji ? p.emoji : null}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Teasing popup */}
            {showHint && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="gp-hint-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-6"
                >
                    <div className="gp-pop w-full max-w-sm rounded-3xl border-2 border-amber-400/50 bg-slate-900 p-6 text-center space-y-5 shadow-2xl">
                        <h3
                            id="gp-hint-title"
                            className="text-xl font-serif font-bold text-amber-300"
                        >
                            Only Saba can catch your heart! 😜
                        </h3>
                        <button
                            onClick={() => setShowHint(false)}
                            className="w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold active:scale-95 transition-transform"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

