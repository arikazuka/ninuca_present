import React, { useState, useEffect, useRef } from 'react';
import { SABA_GEORGIAN_LETTER, REASONS_20, QUIZ_QUESTIONS } from './data';
import { GamesPage } from './GamesPage';
// --- Web Audio API Sound Effects ---
const playPopSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) { }
};

const playWhooshSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) { }
};

// --- Cute Bear SVGs ---
const BearPumpingHeart = () => (
  <div className="relative w-32 h-32 sm:w-52 sm:h-52 mx-auto flex items-center justify-center cursor-pointer group">
    {/* Subtle glow effect behind the bear */}
    <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl group-hover:bg-rose-500/30 transition-all duration-300" />

    {/* Your downloaded GIF */}
    <img
      src="/image/I Love You alone.gif"
      alt="Cute Bear"
      className="w-full h-full object-contain relative z-10 drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
    />
  </div>
);

// --- Falling Confetti Rain Effect ---
const ConfettiRain = () => {
  const colors = ['#FACC15', '#F43F5E', '#38BDF8', '#A855F7', '#EC4899', '#10B981', '#FB923C'];
  const confettiItems = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: `${(i * 3.4) % 100}%`,
    color: colors[i % colors.length],
    size: Math.floor(Math.random() * 8) + 6,
    delay: `${(i * 0.11).toFixed(2)}s`,
    duration: `${(2.2 + (i % 5) * 0.35).toFixed(2)}s`,
    isCircle: i % 3 === 0,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {confettiItems.map((item) => (
        <div
          key={item.id}
          className="absolute animate-confetti top-0"
          style={{
            left: item.left,
            width: `${item.size}px`,
            height: `${item.size * (item.isCircle ? 1 : 1.7)}px`,
            backgroundColor: item.color,
            borderRadius: item.isCircle ? '50%' : '2px',
            animationDelay: item.delay,
            animationDuration: item.duration,
          }}
        />
      ))}
    </div>
  );
};

// --- Studio Grade Multi-Layer 3D Depth Confetti System ---
const StudioConfettiSystem = () => {
  const confettiParticles = React.useMemo(() => {
    const colors = ['#FACC15', '#F43F5E', '#38BDF8', '#EC4899', '#A855F7', '#10B981', '#FB923C', '#E0E7FF'];
    const shapes = ['rect', 'circle', 'ribbon', 'star'];

    return Array.from({ length: 42 }).map((_, i) => {
      const depth = i % 3; // 0 = Background, 1 = Midground, 2 = Foreground
      const size = depth === 0 ? 6 : depth === 1 ? 10 : 15;
      const blur = depth === 0 ? 'blur(1.5px)' : depth === 2 ? 'blur(0.5px)' : 'none';
      const opacity = depth === 0 ? 0.6 : 0.95;
      const zIndex = depth === 0 ? 0 : depth === 1 ? 10 : 30;

      return {
        id: i,
        left: `${(i * 2.45 + (i % 7) * 3) % 100}%`,
        color: colors[i % colors.length],
        shape: shapes[i % shapes.length],
        size,
        blur,
        opacity,
        zIndex,
        drift: `${(i % 2 === 0 ? 1 : -1) * (20 + (i % 5) * 25)}px`,
        duration: `${(3.2 + (i % 6) * 0.45).toFixed(2)}s`,
        delay: `${((i % 12) * 0.22).toFixed(2)}s`,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
      {confettiParticles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-3d top-0 transform-gpu"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: p.shape === 'ribbon' ? `${p.size * 2.4}px` : `${p.size}px`,
            backgroundColor: p.shape !== 'star' ? p.color : 'transparent',
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'ribbon' ? '3px' : '0px',
            filter: p.blur,
            opacity: p.opacity,
            zIndex: p.zIndex,
            '--drift': p.drift,
            '--fall-duration': p.duration,
            '--fall-delay': p.delay,
          }}
        >
          {p.shape === 'star' && (
            <svg viewBox="0 0 24 24" fill={p.color} className="w-full h-full">
              <path d="M12 0L15 9L24 12L15 15L12 24L9 15L0 12L9 9Z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};

// --- Physics-Driven Interactive Present Box with GIF ---
const BearPresentBox = () => {
  const [isInteractiveBouncing, setIsInteractiveBouncing] = useState(false);

  const triggerRebounce = () => {
    if (isInteractiveBouncing) return;
    try {
      playPopSound();
    } catch (e) { }
    setIsInteractiveBouncing(true);
    setTimeout(() => setIsInteractiveBouncing(false), 800);
  };

  return (
    <div
      onClick={triggerRebounce}
      className="relative w-52 h-52 sm:w-72 sm:h-72 mx-auto cursor-pointer select-none group flex items-center justify-center touch-manipulation"
    >
      {/* Dynamic Floor Shadow beneath Box */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-40 sm:w-48 h-8 bg-black/40 rounded-[100%] blur-md transition-all group-hover:w-52 group-hover:bg-black/50" />

      {/* Confetti Explosion System */}
      <StudioConfettiSystem />

      {/* Replaced SVG Box with your downloaded GIF */}
      <img
        src="/image/Celebrate Happy Birthday GIF by Sappy Seals.gif"
        alt="Cute Birthday Bears"
        className={`w-44 h-44 sm:w-64 sm:h-64 object-contain drop-shadow-2xl relative z-10 transition-transform duration-300 transform-gpu ${isInteractiveBouncing ? 'scale-110 -translate-y-3' : 'group-hover:scale-105'
          }`}
      />
    </div>
  );
};

const BearSparkle = () => (
  <svg viewBox="0 0 160 160" className="w-32 h-32 sm:w-52 sm:h-52 mx-auto drop-shadow-lg">
    <circle cx="45" cy="40" r="14" fill="#FAF5EF" stroke="#332211" strokeWidth="3" />
    <circle cx="115" cy="40" r="14" fill="#FAF5EF" stroke="#332211" strokeWidth="3" />
    <circle cx="80" cy="75" r="45" fill="#FAF5EF" stroke="#332211" strokeWidth="3" />
    <ellipse cx="65" cy="68" rx="5" ry="7" fill="#332211" />
    <circle cx="66" cy="65" r="2" fill="#FFF" />
    <ellipse cx="95" cy="68" rx="5" ry="7" fill="#332211" />
    <circle cx="96" cy="65" r="2" fill="#FFF" />
    <ellipse cx="55" cy="80" rx="8" ry="5" fill="#FF9999" opacity="0.7" />
    <ellipse cx="105" cy="80" rx="8" ry="5" fill="#FF9999" opacity="0.7" />
    <ellipse cx="80" cy="80" rx="10" ry="7" fill="#FFF" />
    <polygon points="80,75 75,81 85,81" fill="#332211" />
    <circle cx="68" cy="112" r="10" fill="#FAF5EF" stroke="#332211" strokeWidth="2.5" />
    <circle cx="92" cy="112" r="10" fill="#FAF5EF" stroke="#332211" strokeWidth="2.5" />
    <path d="M 30 30 Q 30 20 20 20 Q 30 20 30 10 Q 30 20 40 20 Q 30 20 30 30 Z" fill="#FACC15" />
    <path d="M 130 30 Q 130 20 120 20 Q 130 20 130 10 Q 130 20 140 20 Q 130 20 130 30 Z" fill="#FACC15" />
  </svg>
);

const BearHugging = () => (
  <div className="relative w-28 h-28 sm:w-48 sm:h-48 mx-auto flex items-center justify-center cursor-pointer group my-2">
    {/* Subtle pink background glow */}
    <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-2xl group-hover:bg-pink-500/30 transition-all duration-300" />

    {/* Your downloaded GIF */}
    <img
      src="/image/i love you.gif"
      alt="Cute Bears Couple"
      className="w-full h-full object-contain relative z-10 drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
    />
  </div>
);

const BearLove = () => (
  <div className="relative w-28 h-28 sm:w-48 sm:h-48 mx-auto flex items-center justify-center cursor-pointer group my-2">
    {/* Subtle pink background glow */}
    <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-2xl group-hover:bg-pink-500/30 transition-all duration-300" />

    {/* Your downloaded GIF */}
    <img
      src="/image/special.gif"
      alt="Cute Bears Couple"
      className="w-full h-full object-contain relative z-10 drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
    />
  </div>
);

const ConfettiBurstCanvas = ({ burstRef }) => {
  const canvasRef = React.useRef(null);
  const particlesRef = React.useRef([]);
  const animFrameRef = React.useRef(null);

  React.useImperativeHandle(burstRef, () => ({
    burstAt: (x, y) => {
      const colors = ['#F43F5E', '#FACC15', '#38BDF8', '#EC4899', '#A855F7', '#10B981', '#FB923C', '#FFF'];
      const shapes = ['rect', 'circle', 'heart'];
      const newParticles = [];

      // Generate 50 festive burst particles from click coordinates
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 4;
        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3, // Initial upward lift
          gravity: 0.35,
          friction: 0.97,
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 12,
          alpha: 1.0,
          decay: Math.random() * 0.018 + 0.012,
        });
      }

      particlesRef.current = [...particlesRef.current, ...newParticles];

      if (!animFrameRef.current) {
        animate();
      }
    },
  }));

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resize canvas if needed
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const activeParticles = [];

    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.rotation += p.vRot;
      p.alpha -= p.decay;

      if (p.alpha > 0) {
        activeParticles.push(p);
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'heart') {
          ctx.font = `${p.size * 1.5}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💖', 0, 0);
        }

        ctx.restore();
      }
    });

    particlesRef.current = activeParticles;

    if (particlesRef.current.length > 0) {
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      animFrameRef.current = null;
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};

const FallingHearts = () => {
  const hearts = React.useMemo(() => {
    const symbols = ['💖', '💕', '❤️', '💗', '✨', '🌸', '💝', '🌹'];
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      symbol: symbols[i % symbols.length],
      left: `${(i * 2.8 + (i % 5) * 2) % 98}%`,
      size: Math.floor(16 + (i % 6) * 6),
      duration: `${(5.5 + (i % 7) * 0.8).toFixed(2)}s`,
      delay: `${((i % 10) * 0.5).toFixed(2)}s`,
      drift: `${(i % 2 === 0 ? 1 : -1) * (20 + (i % 4) * 25)}px`,
      opacity: (0.4 + (i % 4) * 0.15).toFixed(2),
    }));
  }, []);

  return (
    <>
      <style>{`
        @keyframes continuousHeartFall {
          0% {
            transform: translateY(-10vh) rotate(-15deg) scale(0.7);
            opacity: 0;
          }
          15% {
            opacity: var(--heart-opacity, 0.7);
          }
          85% {
            opacity: var(--heart-opacity, 0.7);
          }
          100% {
            transform: translateY(105vh) rotate(35deg) scale(1.1) translateX(var(--heart-drift, 20px));
            opacity: 0;
          }
        }
        .falling-heart-item {
          position: fixed;
          top: 0;
          pointer-events: none;
          user-select: none;
          z-index: 50;
          will-change: transform, opacity;
          animation: continuousHeartFall var(--heart-duration, 6s) linear var(--heart-delay, 0s) infinite;
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50 select-none">
        {hearts.map((h) => (
          <div
            key={h.id}
            className="falling-heart-item"
            style={{
              left: h.left,
              fontSize: `${h.size}px`,
              filter: 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.45))',
              '--heart-duration': h.duration,
              '--heart-delay': h.delay,
              '--heart-drift': h.drift,
              '--heart-opacity': h.opacity,
            }}
          >
            {h.symbol}
          </div>
        ))}
      </div>
    </>
  );
};
export default function App() {
  const burstRef = React.useRef(null); // Add this ref!

  // Function to trigger burst at click position
  const triggerBurst = (e) => {
    {
      reasons.map((reason, idx) => (
        <div
          key={idx}
          onClick={(e) => {
            triggerBurst(e); // 💥 Shoots confetti right out of the clicked door!
            // ... your existing code to open/select the reason card ...
          }}
          className="cursor-pointer ..."
        >
          {/* Your reason card or door content */}
        </div>
      ))
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    if (burstRef.current) {
      burstRef.current.burstAt(x, y);
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [letterOpen, setLetterOpen] = useState(false);
  const [unlockedReasons, setUnlockedReasons] = useState({});
  const unlockedCount = Object.keys(unlockedReasons).length;

  // Candles & Smoke State
  const [candles, setCandles] = useState(Array(20).fill(true));
  const [activeSmoke, setActiveSmoke] = useState({});
  const [showWishModal, setShowWishModal] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState(null);

  const canvasRef = useRef(null);

  const triggerFireworks = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const colors = ['#FACC15', '#F43F5E', '#EC4899', '#A855F7', '#38BDF8'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        dx: (Math.random() - 0.5) * 14,
        dy: (Math.random() - 0.5) * 14,
        size: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        p.alpha -= 0.015;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      particles = particles.filter((p) => p.alpha > 0);
      if (particles.length > 0) requestAnimationFrame(animate);
    };
    animate();
  };

  const handlePasscodeSubmit = (e) => {
    e?.preventDefault();
    if (passcode.trim().toUpperCase() === 'NINI' || passcode.trim() === '20') {
      setPassError(false);
      setCurrentPage(2);
    } else {
      setPassError(true);
    }
  };

  useEffect(() => {
    if (currentPage === 2) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setCurrentPage(3), 400);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [currentPage]);

  // Interactive Candle Blow Logic with sound & smoke
  const toggleCandle = (index) => {
    playPopSound();
    const updated = [...candles];
    const willExtinguish = updated[index];
    updated[index] = !willExtinguish;
    setCandles(updated);

    if (willExtinguish) {
      setActiveSmoke((prev) => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setActiveSmoke((prev) => ({ ...prev, [index]: false }));
      }, 900);
    }

    if (updated.every((c) => !c)) {
      triggerFireworks();
      setTimeout(() => setShowWishModal(true), 700);
    }
  };

  const blowAllCandles = () => {
    playWhooshSound();
    setCandles(Array(20).fill(false));

    // Trigger smoke across all candles
    const smokeObj = {};
    for (let i = 0; i < 20; i++) smokeObj[i] = true;
    setActiveSmoke(smokeObj);
    setTimeout(() => setActiveSmoke({}), 900);

    triggerFireworks();
    setTimeout(() => setShowWishModal(true), 700);
  };

  const relightCandles = () => {
    playPopSound();
    setCandles(Array(20).fill(true));
  };

  const flipReason = (idx) => {
    const newUnlocked = { ...unlockedReasons, [idx]: true };
    setUnlockedReasons(newUnlocked);
    if (Object.keys(newUnlocked).length === 20) {
      triggerFireworks();
    }
  };

  const scratchCanvasRef = useRef(null);
  const [isScratched, setIsScratched] = useState(false);

  useEffect(() => {
    if (currentPage === 8) {
      const canvas = scratchCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#D97706';
      ctx.fillRect(0, 0, width, height);

      ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText('Scratch here with finger or mouse!', width / 2, height / 2);

      let isDrawing = false;

      const scratch = (x, y) => {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 26, 0, Math.PI * 2);
        ctx.fill();

        const imageData = ctx.getImageData(0, 0, width, height);
        let clearPixels = 0;
        for (let i = 3; i < imageData.data.length; i += 4) {
          if (imageData.data[i] === 0) clearPixels++;
        }
        if (clearPixels / (width * height) > 0.45 && !isScratched) {
          setIsScratched(true);
          triggerFireworks();
        }
      };

      const handleMouseDown = (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        scratch(e.clientX - rect.left, e.clientY - rect.top);
      };

      const handleMouseMove = (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        scratch(e.clientX - rect.left, e.clientY - rect.top);
      };

      const handleMouseUp = () => (isDrawing = false);

      const handleTouchStart = (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        scratch(touch.clientX - rect.left, touch.clientY - rect.top);
      };

      const handleTouchMove = (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        scratch(touch.clientX - rect.left, touch.clientY - rect.top);
      };

      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
      canvas.addEventListener('touchend', handleMouseUp);

      return () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [currentPage]);

  const litCount = candles.filter(Boolean).length;
  useEffect(() => {
    if (currentPage !== 8 || isScratched) return;

    const canvas = scratchCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas scale for HiDPI crispness
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // 1. Draw Gold Metallic Scratch Foil
    const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(0.25, '#fef08a');
    grad.addColorStop(0.5, '#d97706');
    grad.addColorStop(0.75, '#fef08a');
    grad.addColorStop(1, '#b45309');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // 2. Add subtle texture overlay text
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = 'rgba(120, 53, 15, 0.5)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ SCRATCH HERE WITH FINGER OR MOUSE ✨', rect.width / 2, rect.height / 2);

    let isDrawing = false;

    const checkScratchPercentage = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparent = 0;

      for (let i = 3; i < pixels.length; i += 16) {
        if (pixels[i] === 0) transparent++;
      }

      const percent = (transparent / (pixels.length / 16)) * 100;
      if (percent > 45) {
        setIsScratched(true);
        triggerFireworks();
      }
    };

    const getPos = (e) => {
      const cRect = canvas.getBoundingClientRect();
      const isTouch = typeof window !== 'undefined' && 'TouchEvent' in window && e instanceof TouchEvent;

      const clientX = isTouch
        ? e.touches?.[0]?.clientX || 0
        : e.clientX;

      const clientY = isTouch
        ? e.touches?.[0]?.clientY || 0
        : e.clientY;

      return {
        x: clientX - cRect.left,
        y: clientY - cRect.top
      };
    };

    const scratch = (e) => {
      if (!isDrawing) return;
      const pos = getPos(e);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 28, 0, Math.PI * 2);
      ctx.fill();

      checkScratchPercentage();
    };

    const startDrawing = (e) => {
      isDrawing = true;
      scratch(e);
    };

    const stopDrawing = () => {
      isDrawing = false;
    };

    // Attach listeners using native Event types
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing, { passive: true });
    canvas.addEventListener('touchmove', scratch, { passive: true });
    window.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', scratch);
      window.removeEventListener('mouseup', stopDrawing);

      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', scratch);
      window.removeEventListener('touchend', stopDrawing);
    };
  }, [currentPage, isScratched]);

  return (

    <div className="min-h-[100dvh] bg-gradient-to-b from-[#1a0826] via-[#12041d] to-[#0a0212] text-slate-100 font-sans-body flex flex-col justify-between px-4 sm:px-8 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pt-8 sm:pb-8 relative overflow-x-hidden selection:bg-amber-400 selection:text-slate-900">
      {/* ADD THIS SINGLE LINE: */}
      <FallingHearts />
      <ConfettiBurstCanvas burstRef={burstRef} /> {/* Add Canvas here */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:28px_28px]" />

      <main className="max-w-5xl w-full mx-auto my-auto flex-1 flex flex-col justify-center items-center relative z-10 py-4 sm:py-8">

        {/* PAGE 1: PASSCODE GATE */}
        {currentPage === 1 && (
          <div className="w-full max-w-2xl text-center space-y-5 sm:space-y-8 backdrop-blur-md bg-white/5 p-5 sm:p-12 rounded-3xl border border-white/10 shadow-2xl mx-auto">
            <BearPumpingHeart />
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif-header text-amber-300 font-bold tracking-wide [text-wrap:balance]">
                Something is waiting for you...
              </h1>
              <p className="text-slate-300 text-sm sm:text-lg">
                A Journey built for your 20th birthday.
              </p>
            </div>
            <form onSubmit={handlePasscodeSubmit} className="space-y-4 sm:space-y-5 max-w-md mx-auto">
              <div>
                <input
                  type="password"
                  placeholder="Enter Passcode (e.g. NINI or 20)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className={`w-full min-h-[48px] px-4 sm:px-5 py-3 sm:py-4 rounded-2xl bg-slate-900/90 border text-center text-base sm:text-xl font-semibold tracking-wide sm:tracking-widest text-amber-300 focus:outline-none focus:ring-2 transition-all ${passError ? 'border-rose-500 focus:ring-rose-500 animate-bounce' : 'border-amber-400/40 focus:ring-amber-400'
                    }`}
                />
                {passError && <p className="text-rose-400 text-sm mt-2 font-medium">Incorrect code! Try NINI or 20.</p>}
              </div>
              <button type="submit" className="w-full min-h-[52px] touch-manipulation py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-base sm:text-lg shadow-xl hover:brightness-110 active:scale-95 transition-all">
                Open It Up✨
              </button>
            </form>
            <button onClick={() => setCurrentPage(2)} className="min-h-[44px] touch-manipulation text-sm text-amber-300/70 hover:text-amber-300 underline underline-offset-4 transition-colors">
              Quick Demo Pass 🔓
            </button>
          </div>
        )}

        {/* PAGE 2: ANIMATED LOADING */}
        {currentPage === 2 && (
          <div className="w-full max-w-2xl text-center space-y-5 sm:space-y-10 backdrop-blur-md bg-white/5 p-5 sm:p-12 rounded-3xl border border-white/10 shadow-2xl mx-auto">
            <BearSparkle />
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-script text-amber-300 drop-shadow [text-wrap:balance]">Just a little longer</h2>
              <p className="text-slate-200 text-sm sm:text-lg font-medium">Lining up all twenty candles</p>
            </div>
            <div className="w-full bg-slate-900/90 h-4 rounded-full overflow-hidden p-0.5 border border-white/10 max-w-lg mx-auto">
              <div className="h-full bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400 rounded-full transition-all duration-150 ease-out shadow-[0_0_15px_rgba(244,63,94,0.9)]" style={{ width: `${loadingProgress}%` }} />
            </div>
            <p className="text-xs sm:text-sm text-amber-200/90 italic font-light">I was thinking of you while making every page of this</p>
          </div>
        )}

        {/* PAGE 3: HAPPY BIRTHDAY INTRO */}
        {currentPage === 3 && (
          <div className="w-full max-w-2xl text-center space-y-4 sm:space-y-8 backdrop-blur-md bg-white/5 p-5 sm:p-12 rounded-3xl border border-white/10 shadow-2xl mx-auto">
            <BearPresentBox />
            <div className="space-y-1 sm:space-y-2">
              <div className="text-6xl sm:text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-rose-500 via-pink-400 to-amber-400 bg-clip-text text-transparent drop-shadow">20</div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-script text-amber-300">Happy Birthday</h1>
              <h2 className="text-2xl sm:text-4xl font-serif-header text-amber-400 font-bold tracking-wide">Nini</h2>
            </div>
            <p className="text-slate-200 text-sm sm:text-lg leading-relaxed max-w-lg mx-auto">
              Today's the day we get to celebrate you. I made this little page just for you, so take your time, go through it slowly, and let the surprise unfold.
            </p>
            <button onClick={() => setCurrentPage(4)} className="min-h-[52px] touch-manipulation px-8 sm:px-10 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-base sm:text-lg shadow-xl hover:scale-105 active:scale-95 transition-all">
              Let's Begin →
            </button>
          </div>
        )}

        {/* PAGE 4: GEORGIAN LETTER */}
        {currentPage === 4 && (
          <div className="w-full max-w-2xl text-center space-y-4 sm:space-y-8 mx-auto">
            <BearHugging />
            <div className="space-y-1 sm:space-y-2">
              <p className="text-xs uppercase tracking-widest text-amber-400 font-bold">PAGE TWO</p>
              <h2 className="text-2xl sm:text-4xl font-serif-header text-amber-300 font-bold">A Letter For You</h2>
              <p className="text-xs sm:text-sm text-slate-300">Tap the wax seal to open</p>
            </div>
            <div className="relative max-w-xl mx-auto">
              {!letterOpen ? (
                <div onClick={() => setLetterOpen(true)} className="cursor-pointer touch-manipulation bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 p-6 sm:p-12 rounded-3xl shadow-2xl flex flex-col items-center justify-center space-y-4 sm:space-y-5 hover:scale-[1.02] active:scale-98 transition-all border border-amber-300/30">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-400 border-4 border-amber-200 flex items-center justify-center shadow-lg animate-pulse">
                    <span className="text-2xl sm:text-3xl">❤️</span>
                  </div>
                  <p className="text-slate-950 font-bold text-sm sm:text-lg tracking-wide">Unseal Saba's Letter</p>
                </div>
              ) : (
                <div className="bg-[#FAF5EF] text-slate-900 p-5 sm:p-10 rounded-3xl shadow-2xl border-2 border-amber-300 text-left space-y-4 sm:space-y-5 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-amber-900/10 pb-3 sm:pb-4">
                    <span className="text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-wider">Happy 20th Birthday</span>
                    <span className="text-xs sm:text-sm text-amber-800/70 font-serif">Oct 28</span>
                  </div>
                  <div className="whitespace-pre-line text-sm sm:text-lg leading-relaxed font-sans-body text-slate-800 font-medium">
                    {SABA_GEORGIAN_LETTER}
                  </div>
                  <div className="pt-4 border-t border-amber-900/10 text-right">
                    <button onClick={() => setCurrentPage(5)} className="w-full sm:w-auto min-h-[48px] touch-manipulation px-6 sm:px-8 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm sm:text-base shadow hover:bg-amber-400 transition-colors">
                      Continue to 20 Reasons →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAGE 5: 20 REASONS REVEAL */}
        {currentPage === 5 && (
          <div className="w-full text-center space-y-4 px-2 max-w-5xl mx-auto">

            {/* Page Header */}
            <div className="space-y-1">
              <p className="text-pink-400 font-semibold tracking-widest text-xs uppercase">
                PAGE FIVE
              </p>
              <h2 className="text-2xl sm:text-4xl font-serif-header text-amber-300 font-bold drop-shadow-md [text-wrap:balance]">
                20 Reasons Why You Are Special
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm">
                Tap each card to reveal a reason why you're so loved! ✨
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 max-h-[60dvh] sm:max-h-[60vh] overflow-y-auto p-2">
              {REASONS_20.map((reason, idx) => {
                const isOpened = !!unlockedReasons[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => flipReason(idx)}
                    className="relative h-36 sm:h-40 [perspective:1000px] cursor-pointer select-none touch-manipulation"
                  >
                    <div className="absolute inset-0 bg-white text-slate-900 rounded-2xl p-3 sm:p-4 flex items-center justify-center text-center text-xs sm:text-sm font-semibold leading-relaxed shadow-xl border border-slate-200 overflow-hidden z-0">
                      {reason}
                    </div>


                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-pink-600 via-rose-600 to-rose-700 text-white rounded-2xl flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-xl border border-pink-400/30 origin-left transition-all duration-700 ease-in-out z-10 ${isOpened
                        ? '[transform:rotateY(-140deg)] opacity-0 pointer-events-none'
                        : 'hover:brightness-110'
                        }`}
                    >
                      {idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              disabled={unlockedCount < 20}
              onClick={() => setCurrentPage(6)}
              className={`w-full max-w-md min-h-[52px] touch-manipulation py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all mx-auto ${unlockedCount === 20
                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-xl hover:scale-105 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
            >
              {unlockedCount === 20 ? 'Continue to Make a Wish →' : `Unlock All Cards (${unlockedCount}/20)`}
            </button>
          </div>
        )}
        {/* PAGE 6: HIGH-DETAIL BEAUTIFUL 3D CAKE & INTERACTIVE CANDLES */}
        {currentPage === 6 && (
          <div className="w-full max-w-3xl text-center space-y-4 sm:space-y-6 mx-auto px-2">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-serif-header text-amber-300 font-bold">
                Make a Wish & Blow
              </h2>
              <p className="text-sm sm:text-base text-slate-200">
                Tap candles to blow them out, or hit the blow button!
              </p>
              <div className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-semibold text-xs sm:text-sm">
                {litCount > 0 ? `🔥 ${litCount} / 20 Flames Glowing` : '✨ All Wish Candles Extinguished!'}
              </div>
            </div>

            {/* Glowing Cake Presentation Container */}
            <div className={`relative max-w-lg mx-auto bg-slate-900/80 border border-white/10 rounded-3xl p-3 sm:p-8 shadow-2xl transition-all duration-500 ${litCount > 0 ? 'animate-cake-glow' : ''}`}>

              {/* Top Layer 20 Candles Arc */}
              <div className="relative z-20 mb-2 flex flex-wrap justify-center gap-1.5 sm:gap-2 px-2 max-w-md mx-auto">
                {candles.map((isLit, idx) => (
                  <div key={idx} className="relative flex flex-col items-center">

                    {/* Flame & Smoke Container */}
                    <div className="h-9 min-w-[20px] sm:min-w-0 flex items-center justify-center relative cursor-pointer touch-manipulation" onClick={() => toggleCandle(idx)}>
                      {/* Rising Smoke Puff on Extinguish */}
                      {activeSmoke[idx] && (
                        <div className="absolute -top-3 text-lg animate-smoke pointer-events-none select-none">
                          💨
                        </div>
                      )}

                      {/* Flickering SVG Flame */}
                      {isLit ? (
                        <div className="animate-flicker filter drop-shadow-[0_0_12px_rgba(250,204,21,1)]">
                          <svg viewBox="0 0 24 36" className="w-5 h-8 sm:w-6 sm:h-9">
                            {/* Outer Flame Glow */}
                            <path d="M12 0 C18 10 24 18 24 26 C24 31.5 18.6 36 12 36 C5.4 36 0 31.5 0 26 C0 18 6 10 12 0 Z" fill="#F97316" />
                            {/* Inner Flame Core */}
                            <path d="M12 8 C16 15 20 20 20 26 C20 30 16.4 33 12 33 C7.6 33 4 30 4 26 C4 20 8 15 12 8 Z" fill="#FACC15" />
                            {/* White Flame Center */}
                            <path d="M12 16 C14 20 16 23 16 27 C16 29 14.2 31 12 31 C9.8 31 8 29 8 27 C8 23 10 20 12 16 Z" fill="#FFFFFF" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-1.5 h-3 bg-slate-600/80 rounded-t-full" />
                      )}
                    </div>

                    {/* Colored Striped Candle Body */}
                    <button
                      onClick={() => toggleCandle(idx)}
                      className="w-2.5 sm:w-3 h-10 sm:h-12 rounded-t-md transition-all hover:scale-110 shadow-md border border-black/20 overflow-hidden relative touch-manipulation"
                      style={{
                        background: idx % 2 === 0
                          ? 'linear-gradient(135deg, #EC4899 0%, #F43F5E 50%, #E11D48 100%)'
                          : 'linear-gradient(135deg, #38BDF8 0%, #0284C7 50%, #0369A1 100%)'
                      }}
                    >
                      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Multi-Tier SVG Birthday Cake */}
              <div className="relative w-full max-w-sm mx-auto -mt-3 select-none">
                <svg viewBox="0 0 320 220" className="w-full h-auto drop-shadow-2xl">
                  {/* Golden Cake Plate Base */}
                  <ellipse cx="160" cy="205" rx="150" ry="14" fill="#EAB308" />
                  <ellipse cx="160" cy="202" rx="145" ry="12" fill="#FEF08A" />
                  <ellipse cx="160" cy="200" rx="140" ry="10" fill="#CA8A04" />

                  {/* BOTTOM TIER (Vanilla & Velvet Sponge) */}
                  <rect x="35" y="125" width="250" height="70" rx="12" fill="#881337" />
                  <path d="M 35 155 Q 160 165 285 155 L 285 195 C 285 200 270 202 260 202 L 60 202 C 50 202 35 200 35 195 Z" fill="#4C0519" />
                  {/* Bottom Tier Cream Frosting Layer */}
                  <rect x="35" y="125" width="250" height="15" rx="4" fill="#FFF1F2" />

                  {/* Bottom Frosting Drips */}
                  <path d="M 35 135 Q 50 160 65 135 Q 85 165 105 135 Q 125 160 145 135 Q 170 165 195 135 Q 220 160 245 135 Q 265 155 285 135 L 285 125 L 35 125 Z" fill="#FB7185" />

                  {/* TOP TIER (Strawberry Cream Sponge) */}
                  <rect x="65" y="65" width="190" height="65" rx="10" fill="#BE123C" />
                  <rect x="65" y="65" width="190" height="12" rx="4" fill="#FFF1F2" />

                  {/* Top Frosting Dripping Cream */}
                  <path d="M 65 75 Q 80 100 95 75 Q 115 105 135 75 Q 160 100 185 75 Q 210 105 235 75 Q 250 95 255 75 L 255 65 L 65 65 Z" fill="#FFF1F2" />

                  {/* Cake Pearl & Strawberry Decorations */}
                  <circle cx="85" cy="65" r="7" fill="#E11D48" />
                  <circle cx="125" cy="65" r="7" fill="#E11D48" />
                  <circle cx="195" cy="65" r="7" fill="#E11D48" />
                  <circle cx="235" cy="65" r="7" fill="#E11D48" />

                  {/* Shiny Golden "20" Topper Centerpiece */}
                  <g transform="translate(132, 25)">
                    <rect x="0" y="0" width="56" height="36" rx="10" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5" />
                    <text x="28" y="25" textAnchor="middle" fontSize="20" fontWeight="900" fontFamily="Playfair Display" fill="#78350F">20</text>
                  </g>
                </svg>
              </div>

              {/* Interactive Control Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 sm:pt-5">
                <button
                  onClick={blowAllCandles}
                  className="w-full sm:w-auto min-h-[52px] touch-manipulation px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm sm:text-base shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Blow Out All Candles</span>
                  <span className="text-lg">💨</span>
                </button>

                <button
                  onClick={relightCandles}
                  className="w-full sm:w-auto min-h-[52px] touch-manipulation px-6 py-3 sm:py-3.5 rounded-2xl bg-slate-800 text-amber-300 border border-amber-400/30 font-bold text-sm sm:text-base shadow hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <span>Relight Candles</span>
                  <span className="text-lg">✨</span>
                </button>
              </div>
            </div>

            {/* Wish Recorded Modal */}
            {showWishModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                <div className="bg-slate-900 border border-amber-400/40 p-5 sm:p-8 rounded-3xl w-[90vw] max-w-sm max-h-[90dvh] overflow-y-auto text-center space-y-4 sm:space-y-5 shadow-2xl">
                  <span className="text-4xl sm:text-5xl">✨</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-amber-300">Your Wish is Recorded!</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Recorded in the stars forever. Now let's test how well you know yourself!
                  </p>
                  <button onClick={() => { setShowWishModal(false); setCurrentPage(7); }} className="w-full min-h-[52px] touch-manipulation py-3 sm:py-3.5 rounded-2xl bg-amber-400 text-slate-950 font-bold text-base hover:brightness-110">
                    Start Quiz →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PAGE 7: QUIZ & REASONS */}
        {currentPage === 7 && (
          <div className="w-full max-w-2xl text-center space-y-4 sm:space-y-8 mx-auto px-0 sm:px-4 animate-fade-in">
            {/* Header & Bear Section */}
            <div className="w-full text-center space-y-3 sm:space-y-6 backdrop-blur-md bg-white/5 p-4 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
              <BearLove />
              <h2 className="text-2xl sm:text-3xl font-serif text-amber-300 font-bold [text-wrap:balance]">
                A Few Reasons You're Amazing
              </h2>
              <div className="space-y-1 sm:space-y-2 pt-1 sm:pt-2">
                <p className="text-slate-200 text-sm sm:text-xl font-medium">
                  20 Reasons why you're special
                </p>
                <p className="text-amber-300 font-bold text-lg sm:text-2xl">
                  {unlockedCount} of 20 opened
                </p>
              </div>
            </div>

            {/* Quiz Question Box */}
            <div className="w-full space-y-4 sm:space-y-6 backdrop-blur-md bg-white/5 p-4 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                  QUESTION {currentQuestion + 1} OF {QUIZ_QUESTIONS.length}
                </p>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-serif text-amber-300 font-bold [text-wrap:balance]">
                  {QUIZ_QUESTIONS[currentQuestion].question}
                </h2>
              </div>

              <div className="space-y-3 sm:space-y-4 max-w-lg mx-auto">
                {QUIZ_QUESTIONS[currentQuestion].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizFeedback(QUIZ_QUESTIONS[currentQuestion].feedback)}
                    className="w-full min-h-[52px] touch-manipulation p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-amber-400/60 text-left text-sm sm:text-base text-slate-200 hover:text-amber-300 font-medium transition-all hover:scale-[1.01] active:scale-98 shadow-md"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Quiz Answer Feedback Modal */}
            {quizFeedback && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                <div className="bg-slate-900 border border-amber-400/40 p-5 sm:p-8 rounded-3xl w-[90vw] max-w-sm max-h-[90dvh] overflow-y-auto text-center space-y-4 sm:space-y-5 shadow-2xl">
                  <span className="text-3xl sm:text-4xl">👑</span>
                  <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">{quizFeedback}</p>
                  <button
                    onClick={() => {
                      setQuizFeedback(null);
                      if (currentQuestion + 1 < QUIZ_QUESTIONS.length) {
                        setCurrentQuestion(currentQuestion + 1);
                      } else {
                        setCurrentPage(7.5); // Directs to Arcade Games Page
                      }
                    }}
                    className="w-full min-h-[52px] touch-manipulation py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold text-sm sm:text-base hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
                  >
                    {currentQuestion + 1 < QUIZ_QUESTIONS.length ? 'Next Question →' : 'Enter Game Arcade 🎮 →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PAGE 7.5: MINI GAMES ARCADE */}
        {currentPage === 7.5 && (
          <GamesPage onComplete={() => setCurrentPage(8)} />
        )}

        {/* PAGE 8: GRAND PRIZE WATCH SCRATCH CARD */}
        {currentPage === 8 && (
          <div className="w-full max-w-2xl text-center space-y-4 sm:space-y-8 mx-auto px-0 sm:px-4 animate-fade-in">
            {/* Page Header */}
            <div className="space-y-2 sm:space-y-3">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-widest uppercase backdrop-blur-md animate-pulse">
                ✨ Exclusive Reveal
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 font-bold tracking-tight [text-wrap:balance]">
                Prize from fate
              </h2>
              <p className="text-xs sm:text-base text-slate-300 font-light">
                Scratch the golden card below to unveil your birthday present!
              </p>
            </div>

            {/* Scratch Ticket Container */}
            <div className="relative max-w-md mx-auto rounded-3xl overflow-hidden border-2 border-amber-400/50 shadow-[0_0_50px_rgba(245,158,11,0.2)] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-4 sm:p-8 space-y-4 sm:space-y-6 transition-all duration-500 hover:border-amber-400/80">
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

              {/* Hidden Present Content */}
              <div className={`space-y-4 sm:space-y-5 transition-all duration-700 ease-out ${isScratched ? 'scale-100 opacity-100' : 'scale-95 opacity-90'}`}>
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 animate-spin-slow opacity-75 blur-sm" />
                  <div className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 flex items-center justify-center text-5xl sm:text-6xl shadow-[0_10px_25px_rgba(245,158,11,0.4)] border border-amber-200/40 transform transition-transform hover:rotate-6">
                    ⌚
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 [text-wrap:balance]">
                    Your Birthday Gift: An Elegant Watch
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light px-1 sm:px-2">
                    To the girl who turns every simple moment into a masterpiece—may every single second with this timepiece remind you of how deeply precious, appreciated, and cherished you are.
                  </p>
                </div>
              </div>

              {/* Canvas Scratch Foil Overlay */}
              {!isScratched && (
                <div className="absolute inset-0 w-full h-full z-10">
                  <canvas
                    ref={scratchCanvasRef}
                    className="w-full h-full cursor-pointer touch-none select-none rounded-3xl"
                    style={{
                      touchAction: 'none',
                      WebkitUserSelect: 'none',
                      userSelect: 'none',
                      WebkitTouchCallout: 'none',
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              )}
            </div>

            {/* Final Chapter Button */}
            {isScratched && (
              <div className="pt-2 sm:pt-4 animate-bounce-short">
                <button
                  onClick={() => setCurrentPage(9)}
                  className="group relative inline-flex items-center justify-center gap-3 min-h-[52px] touch-manipulation px-8 sm:px-10 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold text-base sm:text-lg shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  <span>Final Chapter</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* PAGE 9: THANK YOU */}
        {currentPage === 9 && (
          <div className="w-full max-w-2xl text-center space-y-4 sm:space-y-6 backdrop-blur-md bg-white/5 p-5 sm:p-10 rounded-3xl border border-white/10 shadow-2xl mx-auto">

            {/* Replaced <BearHugging /> with your downloaded GIF */}
            <div className="relative w-32 h-32 sm:w-52 sm:h-52 mx-auto flex items-center justify-center cursor-pointer group">
              <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl group-hover:bg-rose-500/30 transition-all duration-300" />
              <img
                src="/image/Happy Love You Sticker by milkmochabear.gif"
                alt="Bears Hugging"
                className="w-full h-full object-contain relative z-10 drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif-header text-amber-300 font-bold [text-wrap:balance]">
                Thank You For Being You, Ninuca
              </h1>
              <p className="text-slate-300 text-sm sm:text-lg leading-relaxed max-w-lg mx-auto">
                Here's to your 20th year—full of beauty, poise, softness, and unforgettable memories.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2">
              <button
                onClick={() => triggerFireworks()}
                className="w-full sm:w-auto min-h-[52px] touch-manipulation px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-base shadow hover:scale-105 active:scale-95 transition-all"
              >
                Send a Hug 💖
              </button>
              <button
                onClick={() => {
                  setCurrentPage(1);
                  setUnlockedReasons({});
                  setCandles(Array(20).fill(true));
                  setIsScratched(false);
                }}
                className="w-full sm:w-auto min-h-[52px] touch-manipulation px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-slate-800 text-amber-300 font-bold text-base border border-amber-400/30 hover:bg-slate-700 transition-all"
              >
                Replay Our Journey 🔄
              </button>
            </div>
          </div>
        )}

      </main>

      <footer className="relative z-10 text-center py-3 text-xs text-slate-500">
        Project Nini • Oct 28 • Made with love by Saba
      </footer>
    </div>
  );
}


