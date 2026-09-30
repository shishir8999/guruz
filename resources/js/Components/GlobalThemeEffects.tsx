import React, { useEffect, useRef, useCallback } from 'react';

export type EffectType = 
    | 'Stars' | 'Rain' | 'Petals' | 'Snow' | 'Fireworks' | 'Confetti' | 'Leaves' | 'Lanterns' | 'MoonStars'
    | 'Boishakh' | 'Joishtho' | 'Ashar' | 'Shrabon' | 'Bhadro' | 'Ashwin' | 'Kartik' | 'Agrahayan' | 'Poush' | 'Magh' | 'Falgun' | 'Chaitra'
    | 'Grishmo' | 'Borsha' | 'Sharat' | 'Hemanta' | 'Sheet' | 'Bosonto'
    | 'RojarEid' | 'QurbaniEid' | 'EidMiladunnabi' | 'DurgaPuja' | 'Deepavali' | 'Christmas' | 'NewYear' | 'VictoryDay' | 'Valentines';

interface Particle {
    x: number; y: number; vx: number; vy: number;
    size: number; opacity: number; color: string;
    rotation: number; rotationSpeed: number;
    life: number; maxLife: number;
    type: EffectType;
    shape?: string;
    trail?: {x: number, y: number}[];
    wobble?: number;
    wobbleSpeed?: number;
    depth?: number;
}

export function useParticleEffect(
    canvasRef: React.RefObject<HTMLCanvasElement>,
    effectType: EffectType | null,
    intensity: number = 50,
    opacityLevel: number = 100,
    speedLevel: number = 5,
    active: boolean = true
) {
    const particlesRef = useRef<Particle[]>([]);
    const animFrameRef = useRef<number>(0);
    const lastFireworkRef = useRef<number>(0);

    const COLORS: Record<string, string[]> = {
        Stars:        ['#ffffff', '#fffde7', '#fff9c4', '#e3f2fd', '#bbdefb'],
        Rain:         ['#90caf9', '#64b5f6', '#bbdefb', '#e3f2fd', '#4fc3f7'],
        Petals:       ['#ff80ab', '#ff4081', '#f50057', '#ffb2ff', '#ffc1e3', '#ffffff'],
        Snow:         ['#ffffff', '#e3f2fd', '#f3e5f5', '#e0f7fa'],
        Fireworks:    ['#ff1744', '#00e676', '#2979ff', '#ffea00', '#d500f9', '#ff9100', '#00e5ff'],
        Confetti:     ['#f44336', '#4caf50', '#2196f3', '#ffeb3b', '#9c27b0', '#ff9800', '#00bcd4'],
        Leaves:       ['#d84315', '#e65100', '#f57c00', '#ffb300', '#827717', '#558b2f', '#a1887f'],
        Lanterns:     ['#ffb74d', '#ff9800', '#f57c00', '#ef6c00', '#ffe082'],
        MoonStars:    ['#fff9c4', '#fff59d', '#ffeb3b', '#ffffff'],
        Boishakh:     ['#d50000', '#ff1744', '#ff5252', '#ffffff', '#ffd600', '#ff9100'],
        Joishtho:     ['#ff9800', '#ffc107', '#ff5722', '#4caf50', '#8bc34a'],
        Ashar:        ['#0288d1', '#03a9f4', '#4fc3f7', '#e0f7fa', '#ffffff'],
        Shrabon:      ['#01579b', '#0288d1', '#00b0ff', '#80d8ff', '#ffffff'],
        Bhadro:       ['#ffffff', '#f5f5f5', '#e0e0e0', '#bbdefb', '#e3f2fd'],
        Ashwin:       ['#ff1744', '#ff9100', '#ffea00', '#ffffff', '#e040fb'],
        Kartik:       ['#ffd600', '#ffab00', '#ff6d00', '#ff3d00', '#ffffff'],
        Agrahayan:    ['#ffd54f', '#ffca28', '#ffb300', '#ffa000', '#8d6e63'],
        Poush:        ['#e0f7fa', '#b2ebf2', '#80deea', '#ffffff', '#ffecb3'],
        Magh:         ['#fff59d', '#ffee58', '#ffeb3b', '#ffffff', '#b388ff'],
        Falgun:       ['#ff4081', '#ff1744', '#ff9100', '#ffd600', '#e040fb'],
        Chaitra:      ['#ff5722', '#ff9800', '#ffeb3b', '#00e676', '#00b0ff'],
        Grishmo:      ['#ff6d00', '#ff9100', '#ffd600', '#ff3d00', '#4caf50'],
        Borsha:       ['#0288d1', '#00b0ff', '#80d8ff', '#e0f7fa', '#ffffff'],
        Sharat:       ['#ffffff', '#f5f5f5', '#e3f2fd', '#bbdefb', '#ff4081'],
        Hemanta:      ['#e65100', '#f57c00', '#ffb300', '#827717', '#d84315'],
        Sheet:        ['#ffffff', '#e0f7fa', '#b2ebf2', '#80deea'],
        Bosonto:      ['#ff4081', '#f50057', '#ff80ab', '#ffd600', '#76ff03'],
        RojarEid:     ['#00e676', '#69f0ae', '#b9f6ca', '#fff59d', '#ffffff'],
        QurbaniEid:   ['#00c853', '#64dd17', '#a7ffeb', '#fff9c4', '#ffffff'],
        EidMiladunnabi: ['#00e676', '#1DE9B6', '#69F0AE', '#004D40', '#ffffff'],
        DurgaPuja:    ['#ff1744', '#ff9100', '#ffd600', '#d500f9', '#ffffff'],
        Deepavali:    ['#ffd600', '#ffab00', '#ff6d00', '#ff1744', '#00e5ff'],
        Christmas:    ['#d50000', '#2e7d32', '#ffffff', '#ffd600', '#a7ffeb'],
        NewYear:      ['#ff1744', '#00e676', '#2979ff', '#ffea00', '#d500f9', '#00e5ff'],
        VictoryDay:   ['#00c853', '#d50000', '#ff1744', '#b9f6ca', '#ffd600'],
        Valentines:   ['#ff1744', '#f50057', '#ff4081', '#ff80ab', '#ffffff'],
    };

    const EMOJIS: Record<string, string[]> = {
        Stars:        ['⭐', '🌟'],
        Rain:         ['💧', '🌧️'],
        Petals:       ['🌸', '🌺', '💮', '🏵️'],
        Snow:         ['❄️', '🌨️', '⛄'],
        Fireworks:    ['🎆', '💥', '🎇'],
        Confetti:     ['🎊', '🎉', '🎈'],
        Leaves:       ['🍁', '🍂', '🍃'],
        Lanterns:     ['🏮', '🪔'],
        MoonStars:    ['🌙', '⭐', '🌟'],
        Boishakh:     ['🪘', '🌸', '🪁', '🏵️', '🕊️', '🎊'],
        Joishtho:     ['🥭', '🍉', '☀️', '🍃', '🌸'],
        Ashar:        ['🌧️', '☔', '💧', '🌸', '⚡'],
        Shrabon:      ['☔', '🌧️', '💧', '⚡', '🐸'],
        Bhadro:       ['🌾', '☁️', '🪷', '🍃'],
        Ashwin:       ['🪔', '🌺', '🔱', '🌾', '🌸'],
        Kartik:       ['🪔', '🏮', '🕯️', '🎆'],
        Agrahayan:    ['🌾', '🌾', '🍂', '🥣', '🍃'],
        Poush:        ['❄️', '☕', '♨️', '❄️'],
        Magh:         ['🪕', '🪷', '📚', '🌸', '🌼'],
        Falgun:       ['🌺', '🌸', '🦋', '🌼', '🐦'],
        Chaitra:      ['🪁', '🪁', '🎡', '🍃', '🌸'],
        Grishmo:      ['☀️', '🔆', '🌟', '🥭', '🍃', '🌱', '🍉', '🍹'],
        Borsha:       ['🌧️', '☔', '💧', '⚡', '🐸'],
        Sharat:       ['🌾', '🌸', '🏵️', '☁️', '🪷'],
        Hemanta:      ['🌾', '🍁', '🍂', '🍃'],
        Sheet:        ['❄️', '☃️', '☕', '❄️'],
        Bosonto:      ['🌸', '🌺', '🦋', '🐝', '🌿'],
        RojarEid:     ['🕌', '🌙', '⭐', '📿'],
        QurbaniEid:   ['🕋', '🌙', '⭐', '🕊️'],
        EidMiladunnabi: ['💚', '🕌', '🌙', '⭐', '🟢'],
        DurgaPuja:    ['🪔', '🌺', '🔱', '🕉️', '🏮'],
        Deepavali:    ['🪔', '🎆', '🕯️', '🌟', '🎇'],
        Christmas:    ['🎄', '🎁', '🎅', '🦌', '🔔', '❄️'],
        NewYear:      ['🎆', '🎉', '🎊', '🥂', '🥳', '🎈'],
        VictoryDay:   ['🔴', '🟢', '⭐', '🕊️'],
        Valentines:   ['💖', '❤️', '🌹', '💕', '💐'],
    };

    const createParticle = useCallback((canvas: HTMLCanvasElement, type: EffectType, isBurst: boolean = false, burstX = 0, burstY = 0): Particle => {
        const colors = COLORS[type] || COLORS.Stars;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const depth = Math.random() * 0.8 + 0.2;
        const speedMult = (speedLevel / 5);
        
        const base: Particle = {
            x: 0, y: 0, vx: 0, vy: 0, size: 4,
            opacity: 1, color, rotation: 0, rotationSpeed: 0,
            life: 0, maxLife: 200, type, depth,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: (Math.random() - 0.5) * 0.1,
            trail: []
        };

        // Explosive Fireworks/NewYear/Deepavali/Kartik
        if (type === 'Fireworks' || type === 'NewYear' || type === 'Deepavali' || type === 'Kartik') {
            if (isBurst) {
                const angle = Math.random() * Math.PI * 2;
                const speed = (Math.random() * 12 + 2) * speedMult;
                return { ...base,
                    x: burstX, y: burstY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: Math.random() * 4 + 2,
                    maxLife: 60 + Math.random() * 50,
                };
            }
            return { ...base,
                x: Math.random() * canvas.width,
                y: canvas.height + 10,
                vx: (Math.random() - 0.5) * 3 * speedMult,
                vy: -(Math.random() * 7 + 10) * speedMult,
                size: 5,
                maxLife: 50 + Math.random() * 30,
                shape: 'rocket',
                color: '#ffea00'
            };
        }

        const lowerType = String(type).toLowerCase();

        // PURE 100% Realistic Falling Rain Drop Streaks ONLY (Borsha / Ashar / Shrabon / Rain)
        if (lowerType === 'rain' || lowerType === 'ashar' || lowerType === 'shrabon' || lowerType === 'borsha') {
            return { ...base,
                x: Math.random() * canvas.width,
                y: -60,
                vx: (0.8 + Math.random() * 0.5) * speedMult,
                vy: (Math.random() * 24 + 20) * depth * speedMult,
                size: (Math.random() * 2.5 + 1.2) * depth,
                maxLife: 120,
                opacity: 0.65 + Math.random() * 0.35,
                shape: 'raindrop',
                color: ['#74b9ff', '#0984e3', '#81ecec', '#a0c4ff', '#e0f7fa', '#ffffff'][Math.floor(Math.random() * 6)]
            };
        }

        // Sacred Om (🕉️), Pradip / Diya (🪔) & Flowers (🌺 🌸 🏵️) (DurgaPuja / Durga Puja)
        if (lowerType === 'durgapuja' || lowerType === 'durga_puja' || lowerType === 'durga') {
            const pujaEmojis = EMOJIS.DurgaPuja;
            return { ...base,
                x: Math.random() * canvas.width,
                y: -30,
                vx: (Math.random() - 0.5) * 2.5 * speedMult,
                vy: (Math.random() * 2 + 1) * depth * speedMult,
                size: (Math.random() * 34 + 22) * depth,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 3,
                maxLife: 400,
                shape: pujaEmojis[Math.floor(Math.random() * pujaEmojis.length)]
            };
        }

        // RISING FIREWORKS & DIYAS/PRADIPS FROM BOTTOM UPWARDS (Deepavali / Diwali / Deepaboli)
        if (lowerType === 'deepavali' || lowerType === 'diwali' || lowerType === 'kartik') {
            const deepavaliEmojis = EMOJIS.Deepavali;
            return { ...base,
                x: Math.random() * canvas.width,
                y: canvas.height + 40,
                vx: (Math.random() - 0.5) * 2.2 * speedMult,
                vy: -(Math.random() * 3.8 + 2.2) * depth * speedMult,
                size: (Math.random() * 36 + 22) * depth,
                rotation: (Math.random() - 0.5) * 15,
                rotationSpeed: (Math.random() - 0.5) * 1.5,
                maxLife: 450,
                shape: deepavaliEmojis[Math.floor(Math.random() * deepavaliEmojis.length)],
                color: ['#ffd600', '#ffab00', '#ff6d00', '#ff1744', '#00e5ff', '#ffffff'][Math.floor(Math.random() * 6)]
            };
        }

        // BURSTING FIREWORKS, SPARKLERS & ROCKETS (NewYear / Happy New Year / Fireworks)
        if (lowerType === 'newyear' || lowerType === 'new_year' || lowerType === 'fireworks') {
            const nyEmojis = EMOJIS.NewYear;
            const isRocket = Math.random() > 0.45;
            return { ...base,
                x: Math.random() * canvas.width,
                y: isRocket ? canvas.height + 30 : Math.random() * (canvas.height * 0.7),
                vx: isRocket ? (Math.random() - 0.5) * 3 * speedMult : (Math.random() - 0.5) * 4 * speedMult,
                vy: isRocket ? -(Math.random() * 5 + 3) * depth * speedMult : (Math.random() - 0.5) * 4 * speedMult,
                size: (Math.random() * 38 + 24) * depth,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 4,
                maxLife: isRocket ? 180 : 350,
                shape: nyEmojis[Math.floor(Math.random() * nyEmojis.length)],
                color: ['#ff1744', '#00e676', '#2979ff', '#ffea00', '#d500f9', '#ff9100', '#00e5ff', '#ffffff'][Math.floor(Math.random() * 8)]
            };
        }

        // Upward Floating Lanterns & Crescent Moons (RojarEid / QurbaniEid / EidMiladunnabi / Lanterns)
        if (type === 'RojarEid' || type === 'QurbaniEid' || type === 'EidMiladunnabi' || type === 'Lanterns') {
            const emojis = EMOJIS[type];
            return { ...base,
                x: Math.random() * canvas.width,
                y: canvas.height + 40,
                vx: (Math.random() - 0.5) * 1.5 * speedMult,
                vy: -(Math.random() * 2.5 + 1) * depth * speedMult,
                size: (Math.random() * 36 + 22) * depth,
                rotation: (Math.random() - 0.5) * 15,
                rotationSpeed: (Math.random() - 0.5) * 0.5,
                maxLife: 500,
                shape: emojis[Math.floor(Math.random() * emojis.length)]
            };
        }

        // Upward Swirling Kites (Chaitra)
        if (type === 'Chaitra') {
            const emojis = EMOJIS.Chaitra;
            return { ...base,
                x: Math.random() * canvas.width,
                y: canvas.height + 30,
                vx: (Math.random() - 0.2) * 4 * speedMult,
                vy: -(Math.random() * 3 + 2) * depth * speedMult,
                size: (Math.random() * 38 + 24) * depth,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 6,
                maxLife: 450,
                shape: emojis[Math.floor(Math.random() * emojis.length)]
            };
        }

        // Upward Floating Valentines Hearts
        if (type === 'Valentines') {
            const valEmojis = EMOJIS.Valentines;
            return { ...base,
                x: Math.random() * canvas.width,
                y: canvas.height + 30,
                vx: (Math.random() - 0.5) * 2 * speedMult,
                vy: -(Math.random() * 3 + 1.5) * depth * speedMult,
                size: (Math.random() * 34 + 20) * depth,
                rotation: (Math.random() - 0.5) * 20,
                rotationSpeed: (Math.random() - 0.5) * 2,
                maxLife: 400,
                shape: valEmojis[Math.floor(Math.random() * valEmojis.length)]
            };
        }

        // Downward Drifting Sunburst & Mango/Leaf Motifs (Grishmo / Summer)
        if (type === 'Grishmo') {
            const summerEmojis = EMOJIS.Grishmo;
            return { ...base,
                x: Math.random() * canvas.width,
                y: -30,
                vx: (Math.random() - 0.5) * 2 * speedMult,
                vy: (Math.random() * 2.5 + 1.2) * depth * speedMult,
                size: (Math.random() * 32 + 20) * depth,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 4,
                maxLife: 380,
                shape: summerEmojis[Math.floor(Math.random() * summerEmojis.length)]
            };
        }

        // Drifting Kashful Grass & Shiuli Flowers Across Screen (Sharat / Autumn)
        if (type === 'Sharat') {
            const autumnEmojis = EMOJIS.Sharat;
            return { ...base,
                x: Math.random() * canvas.width,
                y: -30,
                vx: (Math.random() - 0.5) * 3 * speedMult,
                vy: (Math.random() * 1.8 + 0.8) * depth * speedMult,
                size: (Math.random() * 32 + 20) * depth,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 3,
                maxLife: 420,
                shape: autumnEmojis[Math.floor(Math.random() * autumnEmojis.length)]
            };
        }

        // Downward Drifting Petals, Leaves, Flowers, Snow, Confetti
        const defaultEmojis = EMOJIS[type] || ['⭐'];
        const isEmoji = Math.random() > 0.1;

        return { ...base,
            x: Math.random() * canvas.width,
            y: -30,
            vx: (Math.random() - 0.5) * 3 * speedMult,
            vy: (Math.random() * 3 + 1.5) * depth * speedMult,
            size: (Math.random() * 34 + 20) * depth,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 5,
            maxLife: 350,
            shape: isEmoji ? defaultEmojis[Math.floor(Math.random() * defaultEmojis.length)] : undefined
        };
    }, [speedLevel]);

    const lastLightningRef = useRef<number>(0);
    const lightningPathRef = useRef<{x: number, y: number}[]>([]);
    const rocketsRef = useRef<any[]>([]);
    const sparksRef = useRef<any[]>([]);

    const drawParticle = useCallback((ctx: CanvasRenderingContext2D, p: Particle) => {
        const fadeRatio = Math.max(0, Math.min(1, p.life < 20 ? p.life / 20 : (p.maxLife - p.life) / 40));
        ctx.save();
        ctx.globalAlpha = p.opacity * fadeRatio * (opacityLevel / 100);

        const drawEmoji = (emoji: string) => {
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            const scale = Math.sin(p.wobble || 0) * 0.25 + 0.75;
            ctx.scale(1, scale);
            ctx.font = `${p.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 14;
            ctx.shadowColor = p.color || '#ffffff';
            ctx.fillText(emoji, 0, 0);
        };

        if (p.shape === 'raindrop') {
            // 🌧️ Diagonal Raindrop Line
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size;
            ctx.lineCap = 'round';
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            const dropLength = p.vy * 1.8;
            ctx.lineTo(p.x + p.vx * 1.5, p.y + dropLength);
            ctx.stroke();

            // 💧 Bottom Border Water Ripple Effect
            if (p.y >= ctx.canvas.height - 60) {
                const rippleProgress = (p.y - (ctx.canvas.height - 60)) / 60;
                ctx.save();
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 1.4;
                ctx.globalAlpha = Math.max(0, (1 - rippleProgress) * p.opacity);
                ctx.beginPath();
                const rx = rippleProgress * 22 + 5;
                const ry = rx * 0.35;
                ctx.ellipse(p.x + p.vx * 1.5, ctx.canvas.height - 8, rx, ry, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        } else if (p.shape && p.shape !== 'rocket') {
            drawEmoji(p.shape);
        } else if (p.shape === 'rocket') {
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffea00';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }, [opacityLevel]);

    useEffect(() => {
        if (!active || !effectType) {
            cancelAnimationFrame(animFrameRef.current);
            particlesRef.current = [];
            rocketsRef.current = [];
            sparksRef.current = [];
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const maxParticles = Math.floor((intensity / 100) * 120) + 20;
        let frameCount = 0;

        const createBurst = (x: number, y: number) => {
            // 🎨 High-visibility vivid colors matching user image media_1787761502638.png
            const palettes = [
                ['#e0e7ff', '#c084fc', '#a855f7', '#d946ef', '#ec4899', '#ffffff'], // Neon Magenta & Violet
                ['#bae6fd', '#38bdf8', '#0284c7', '#2563eb', '#06b6d4', '#ffffff'], // Electric Cyan & Blue
                ['#fef08a', '#fbbf24', '#f59e0b', '#dc2626', '#ffffff'],             // Golden Crimson
                ['#e9d5ff', '#8b5cf6', '#7c3aed', '#6366f1', '#ffffff']              // Deep Purple Royal
            ];

            const palette = palettes[Math.floor(Math.random() * palettes.length)];
            const count = 100 + Math.floor(Math.random() * 50); // 100-150 radial ray sparks per burst!

            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
                const speed = Math.random() * 8.5 + 2.5;
                const color = palette[Math.floor(Math.random() * palette.length)];

                sparksRef.current.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1,
                    decay: Math.random() * 0.012 + 0.009,
                    color,
                    size: Math.random() * 3.5 + 2.0,
                    gravity: 0.07,
                    friction: 0.962
                });
            }
        };

        // 🎆 Spawn 4 Immediate Explosions on Load
        const initWidth = window.innerWidth;
        const initHeight = window.innerHeight;
        createBurst(initWidth * 0.25, initHeight * 0.3);
        createBurst(initWidth * 0.5, initHeight * 0.2);
        createBurst(initWidth * 0.75, initHeight * 0.35);

        // 🖱️ Interactive Fireworks Burst on Click Anywhere (Filtered so UI buttons are never delayed!)
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (target && (target.closest('button') || target.closest('a') || target.closest('nav') || target.closest('input') || target.closest('form') || target.closest('.cursor-pointer'))) {
                return;
            }
            requestAnimationFrame(() => createBurst(e.clientX, e.clientY));
        };
        window.addEventListener('click', handleGlobalClick);

        const generateLightningBolt = (width: number, height: number) => {
            const startX = Math.random() * (width * 0.6) + width * 0.2;
            const points: {x: number, y: number}[] = [{ x: startX, y: 0 }];
            let curX = startX;
            let curY = 0;
            const steps = 8;
            const stepY = (height * 0.65) / steps;

            for (let i = 0; i < steps; i++) {
                curX += (Math.random() - 0.5) * 80;
                curY += stepY;
                points.push({ x: curX, y: curY });
            }
            return points;
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        const animate = (timestamp: number) => {
            if (document.hidden) {
                animFrameRef.current = requestAnimationFrame(animate);
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const lowerType = String(effectType).toLowerCase();
            const isMonsoon = lowerType === 'rain' || lowerType === 'ashar' || lowerType === 'shrabon' || lowerType === 'borsha';
            const isFirework = lowerType === 'fireworks' || lowerType === 'newyear' || lowerType === 'new_year' || lowerType === 'deepavali' || lowerType === 'diwali';

            // ⚡ 15-SECOND LIGHTNING FLASH & BOLT SYSTEM
            if (isMonsoon) {
                if (timestamp - lastLightningRef.current > 15000) {
                    lastLightningRef.current = timestamp;
                    lightningPathRef.current = generateLightningBolt(canvas.width, canvas.height);
                }

                const elapsed = timestamp - lastLightningRef.current;
                if (elapsed < 200) {
                    ctx.save();
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * (1 - elapsed / 200)})`;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    if (lightningPathRef.current.length > 0) {
                        ctx.strokeStyle = '#e0f7fa';
                        ctx.lineWidth = 3;
                        ctx.shadowColor = '#00e5ff';
                        ctx.shadowBlur = 30;
                        ctx.beginPath();
                        ctx.moveTo(lightningPathRef.current[0].x, lightningPathRef.current[0].y);
                        for (let pt of lightningPathRef.current) {
                            ctx.lineTo(pt.x, pt.y);
                        }
                        ctx.stroke();
                    }
                    ctx.restore();
                }
            }

            // 🎆 REALISTIC RADIAL CANVAS FIREWORKS ENGINE
            if (isFirework) {
                // Launch rockets automatically every ~20 frames
                if (frameCount % Math.max(18, 45 - Math.floor(intensity / 3)) === 0) {
                    rocketsRef.current.push({
                        x: Math.random() * (canvas.width * 0.84) + canvas.width * 0.08,
                        y: canvas.height,
                        targetY: Math.random() * (canvas.height * 0.45) + canvas.height * 0.1,
                        vx: (Math.random() - 0.5) * 2.8,
                        vy: -(Math.random() * 5 + 9.5)
                    });
                }

                for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
                    const r = rocketsRef.current[i];
                    r.x += r.vx;
                    r.y += r.vy;

                    ctx.save();
                    ctx.strokeStyle = '#fde047';
                    ctx.lineWidth = 3.5;
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = '#fbbf24';
                    ctx.beginPath();
                    ctx.moveTo(r.x - r.vx * 3, r.y - r.vy * 3);
                    ctx.lineTo(r.x, r.y);
                    ctx.stroke();
                    ctx.restore();

                    if (r.y <= r.targetY || r.vy >= 0) {
                        createBurst(r.x, r.y);
                        rocketsRef.current.splice(i, 1);
                    }
                }

                for (let i = sparksRef.current.length - 1; i >= 0; i--) {
                    const s = sparksRef.current[i];
                    s.vx *= s.friction;
                    s.vy *= s.friction;
                    s.vy += s.gravity;
                    s.x += s.vx;
                    s.y += s.vy;
                    s.alpha -= s.decay;

                    if (s.alpha <= 0) {
                        sparksRef.current.splice(i, 1);
                        continue;
                    }

                    ctx.save();
                    ctx.globalAlpha = Math.max(0, s.alpha) * (opacityLevel / 100);
                    ctx.strokeStyle = s.color;
                    ctx.lineWidth = s.size;
                    ctx.lineCap = 'round';
                    ctx.shadowBlur = 22;
                    ctx.shadowColor = s.color;

                    ctx.beginPath();
                    ctx.moveTo(s.x - s.vx * 2.8, s.y - s.vy * 2.8);
                    ctx.lineTo(s.x, s.y);
                    ctx.stroke();

                    // Glowing tip dot
                    ctx.fillStyle = s.color;
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.size * 0.8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }

                if (timestamp - lastFireworkRef.current > (150 - intensity) * 12) {
                    lastFireworkRef.current = timestamp;
                    particlesRef.current.push(createParticle(canvas, effectType));
                }
            } else {
                const spawnRate = 3;
                if (frameCount % spawnRate === 0) {
                    const batch = Math.ceil(intensity / 35);
                    for (let i = 0; i < batch; i++) {
                        if (particlesRef.current.length < maxParticles) {
                            particlesRef.current.push(createParticle(canvas, effectType));
                        }
                    }
                }
            }

            const activeParticles: Particle[] = [];
            for (let i = 0; i < particlesRef.current.length; i++) {
                const p = particlesRef.current[i];
                p.life++;
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
                if (p.wobble !== undefined && p.wobbleSpeed !== undefined) {
                    p.wobble += p.wobbleSpeed;
                }

                const time = Date.now() / 1000;
                const wind = Math.sin(time * 0.5) * 1.2;
                const isUpward = p.type === 'RojarEid' || p.type === 'QurbaniEid' || p.type === 'EidMiladunnabi' || p.type === 'DurgaPuja' || p.type === 'Lanterns' || p.type === 'Chaitra' || p.type === 'Valentines';

                if (!isFirework && p.type !== 'Rain' && p.type !== 'Ashar' && p.type !== 'Shrabon' && p.type !== 'Borsha') {
                    p.vx = Math.sin(p.wobble || p.life * 0.05) * 1.5 + wind * (p.depth || 1);
                    if (!isUpward) {
                        p.vy += 0.008;
                    }
                }

                drawParticle(ctx, p);

                if (p.life < p.maxLife && p.x > -150 && p.x < canvas.width + 150 && p.y > -150 && p.y < canvas.height + 150) {
                    activeParticles.push(p);
                }
            }
            
            particlesRef.current = activeParticles;
            frameCount++;
            animFrameRef.current = requestAnimationFrame(animate);
        };

        animFrameRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('click', handleGlobalClick);
            cancelAnimationFrame(animFrameRef.current);
            particlesRef.current = [];
            rocketsRef.current = [];
            sparksRef.current = [];
        };
    }, [active, effectType, intensity, opacityLevel, speedLevel, createParticle, drawParticle]);
}

export default function GlobalThemeEffects({ activeTheme }: { activeTheme: any }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const isThemeActive = !!activeTheme && activeTheme.active !== false && activeTheme.visibleOnSite !== false;

    useParticleEffect(
        canvasRef,
        activeTheme?.effectType || null,
        activeTheme?.intensity || 50,
        activeTheme?.opacity !== undefined ? activeTheme.opacity : 90,
        activeTheme?.speed || 5,
        isThemeActive
    );

    if (!isThemeActive) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[100]"
        />
    );
}
