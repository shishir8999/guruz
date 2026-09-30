// Web Audio API Synthesizer for high-fidelity, zero-lag notifications (Messenger / WhatsApp / Pop Chime)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
    return audioCtx;
}

/**
 * Play a crystal-clear notification chime
 * @param type 'messenger' | 'whatsapp' | 'pop' | 'heart'
 */
export function playNotificationSound(type: 'messenger' | 'whatsapp' | 'pop' | 'heart' = 'messenger') {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        if (type === 'messenger') {
            // Facebook Messenger signature bright two-tone pop-chime (D6 -> A6)
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            const gain2 = ctx.createGain();

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(1174.66, now); // D6
            gain1.gain.setValueAtTime(0.28, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1760.00, now + 0.08); // A6
            gain2.gain.setValueAtTime(0.0, now);
            gain2.gain.setValueAtTime(0.35, now + 0.08);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc1.start(now);
            osc1.stop(now + 0.2);
            osc2.start(now + 0.08);
            osc2.stop(now + 0.4);

        } else if (type === 'whatsapp') {
            // WhatsApp signature water-drop bubble pop (580Hz -> 870Hz smooth chirp)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(620, now);
            osc.frequency.exponentialRampToValueAtTime(980, now + 0.09);

            gain.gain.setValueAtTime(0.32, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.25);

        } else if (type === 'heart') {
            // Sweet soft magical fairy pop when adding to wishlist
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(880, now); // A5
            osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.3);

        } else {
            // Generic pleasant modern UI pop
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(900, now);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.16);
        }
    } catch (e) {
        // Silently ignore if audio context is blocked by strict autoplay policies
    }
}