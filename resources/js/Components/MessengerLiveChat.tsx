import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePage } from '@inertiajs/react';
import { 
    X, Minus, Send, Image as ImageIcon, Paperclip, Headphones, 
    Check, CheckCheck, RefreshCw, ThumbsUp, Smile, Mic, Share2, 
    ChevronDown, Play, Pause, Trash2, StopCircle, User, Mail, Phone, ShieldCheck, Lock
} from 'lucide-react';
import axios from 'axios';
import { playNotificationSound } from '@/lib/notificationSound';

interface Message {
    id: number;
    sender_type: 'customer' | 'admin';
    sender_name: string;
    message: string;
    attachment_url?: string | null;
    attachment_type?: string | null;
    is_read: boolean;
    time: string;
    created_at: string;
}

interface MessengerLiveChatProps {
    isOpen: boolean;
    onClose: () => void;
}

const QUICK_QUESTIONS = [
    '🚚 ডেলিভারি চার্জ ও সময় কত?',
    '💳 কী কী পেমেন্ট মেথড আছে?',
    '🔄 রিটার্ন বা ওয়ারেন্টি সুবিধা কীভাবে পাবো?',
    '🏬 আমি একজন সেলার হতে চাই',
];

// 🎙️ Messenger Voice Note Player Component with Animated Moving Waveform
function VoicePlayer({ url, isCustomer }: { url: string; isCustomer: boolean }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Resolve WebM duration issue in Chrome / modern browsers
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const checkDuration = () => {
            if (isFinite(audio.duration) && !isNaN(audio.duration) && audio.duration > 0) {
                setDuration(audio.duration);
            } else if (audio.duration === Infinity) {
                // Seek trick to force browser to calculate true duration of WebM
                const onTimeUpdate = () => {
                    audio.removeEventListener('timeupdate', onTimeUpdate);
                    audio.currentTime = 0;
                    if (isFinite(audio.duration) && !isNaN(audio.duration)) {
                        setDuration(audio.duration);
                    }
                };
                audio.addEventListener('timeupdate', onTimeUpdate);
                audio.currentTime = 1e10;
            }
        };

        audio.addEventListener('loadedmetadata', checkDuration);
        audio.addEventListener('durationchange', checkDuration);

        return () => {
            audio.removeEventListener('loadedmetadata', checkDuration);
            audio.removeEventListener('durationchange', checkDuration);
        };
    }, [url]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(err => {
                console.error('Audio play error:', err);
                setIsPlaying(false);
            });
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const cur = audioRef.current.currentTime;
            setCurrentTime(cur);

            // If duration was unknown or Infinity, keep updating duration
            if (isFinite(audioRef.current.duration) && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
                setDuration(audioRef.current.duration);
            } else {
                setDuration(prev => Math.max(prev, cur));
            }
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    };

    const formatTime = (secs: number) => {
        if (isNaN(secs) || !isFinite(secs) || secs < 0) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Calculate progress (0 to 100)
    const effectiveDuration = duration > 0 ? duration : (currentTime > 0 ? currentTime + 1 : 1);
    const progressPercent = Math.min(100, (currentTime / effectiveDuration) * 100);

    // Waveform pattern with realistic bar heights
    const barHeights = [35, 60, 25, 80, 50, 95, 40, 70, 45, 85, 90, 55, 35, 75, 50, 30, 65, 85, 40, 20];
    const totalBars = barHeights.length;

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, clickX / rect.width));
        const seekTime = percent * effectiveDuration;
        audioRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    return (
        <div className={`flex items-center gap-2.5 p-2.5 rounded-2xl min-w-[210px] max-w-[270px] select-none transition-all ${
            isCustomer 
                ? 'bg-[#0084FF] text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
        }`}>
            <audio 
                ref={audioRef} 
                src={url} 
                onTimeUpdate={handleTimeUpdate} 
                onEnded={handleEnded} 
                preload="auto"
                className="hidden" 
            />

            {/* Play/Pause Button */}
            <button
                type="button"
                onClick={togglePlay}
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 cursor-pointer shadow-xs ${
                    isCustomer 
                        ? 'bg-white text-[#0084FF] hover:bg-slate-100' 
                        : 'bg-[#0084FF] text-white hover:bg-blue-600'
                }`}
                title={isPlaying ? 'থামান' : 'শুনুন'}
            >
                {isPlaying ? (
                    <Pause size={16} className="fill-current" />
                ) : (
                    <Play size={16} className="fill-current translate-x-0.5" />
                )}
            </button>

            {/* Audio Waveform & Scrubber */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                {/* Waveform graphic bars */}
                <div 
                    className="relative flex items-center gap-[3px] h-5 cursor-pointer group py-0.5"
                    onClick={handleSeek}
                    title="ক্লিক করে অডিও এগিয়ে বা পিছিয়ে শুনুন"
                >
                    {barHeights.map((h, i) => {
                        const barPercent = (i / (totalBars - 1)) * 100;
                        const isFilled = barPercent <= progressPercent;
                        
                        // Active dancing wave animation when isPlaying is true
                        const waveDelay = (i % 6) * 0.12;

                        return (
                            <span 
                                key={i} 
                                style={{ 
                                    height: `${h}%`,
                                    animation: isPlaying ? `soundWaveDance 0.75s ease-in-out infinite alternate ${waveDelay}s` : 'none',
                                    transformOrigin: 'bottom',
                                }}
                                className={`w-[3px] rounded-full transition-colors duration-150 ${
                                    isFilled 
                                        ? (isCustomer ? 'bg-white shadow-[0_0_4px_rgba(255,255,255,0.6)]' : 'bg-[#0084FF]') 
                                        : (isCustomer ? 'bg-white/35 group-hover:bg-white/50' : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400')
                                }`}
                            />
                        );
                    })}

                    {/* Moving playhead thumb */}
                    {progressPercent > 0 && progressPercent < 100 && (
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-75"
                            style={{ left: `${progressPercent}%` }}
                        >
                            <span className={`block w-2 h-2 rounded-full ${
                                isCustomer ? 'bg-white ring-2 ring-white/40 shadow-xs' : 'bg-[#0084FF] ring-2 ring-blue-300 shadow-xs'
                            }`} />
                        </div>
                    )}
                </div>

                {/* Duration / Counter */}
                <div className="flex items-center justify-between text-[10px] font-medium leading-none opacity-90 tabular-nums">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration || currentTime || 0)}</span>
                </div>
            </div>

            <style>{`
                @keyframes soundWaveDance {
                    0% {
                        transform: scaleY(0.35);
                    }
                    50% {
                        transform: scaleY(1.3);
                    }
                    100% {
                        transform: scaleY(0.5);
                    }
                }
            `}</style>
        </div>
    );
}

export function MessengerLiveChat({ isOpen, onClose }: MessengerLiveChatProps) {
    const { props } = usePage<any>();
    const user = props.auth?.user ?? null;

    const [sessionId, setSessionId] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMsg, setInputMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    // 📝 Visitor Lead Information Requirement (Name, Gmail, Phone)
    const [hasLeadInfo, setHasLeadInfo] = useState(false);
    const [leadName, setLeadName] = useState('');
    const [leadEmail, setLeadEmail] = useState('');
    const [leadPhone, setLeadPhone] = useState('');
    const [leadError, setLeadError] = useState('');
    const [submittingLead, setSubmittingLead] = useState(false);

    // 🎙️ Voice Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [recordDuration, setRecordDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerIntervalRef = useRef<any>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // 🔒 Customer Isolation & Lead Initialization:
    useEffect(() => {
        if (!isOpen) return;

        // Check sessionStorage for this browser tab's active session
        const sessId = sessionStorage.getItem('guruz_live_chat_session_id');
        const storedName = sessionStorage.getItem('guruz_chat_customer_name');
        const storedEmail = sessionStorage.getItem('guruz_chat_customer_email');
        const storedPhone = sessionStorage.getItem('guruz_chat_customer_phone');

        if (sessId && storedName && storedEmail && storedPhone) {
            setSessionId(sessId);
            setCustomerName(storedName);
            setLeadName(storedName);
            setCustomerEmail(storedEmail);
            setLeadEmail(storedEmail);
            setCustomerPhone(storedPhone);
            setLeadPhone(storedPhone);
            setHasLeadInfo(true);
        } else {
            // New visitor: strictly start clean! No previous messages, form is required!
            setSessionId('');
            setMessages([]);
            setHasLeadInfo(false);
            setLeadName('');
            setLeadEmail('');
            setLeadPhone('');
            setCustomerName('');
            setCustomerEmail('');
            setCustomerPhone('');
            setLeadError('');
        }
    }, [isOpen]);

    // 🔄 Reset / Start New Visitor Chat
    const handleResetChat = () => {
        sessionStorage.removeItem('guruz_live_chat_session_id');
        sessionStorage.removeItem('guruz_chat_customer_name');
        sessionStorage.removeItem('guruz_chat_customer_email');
        sessionStorage.removeItem('guruz_chat_customer_phone');
        localStorage.removeItem('guruz_live_chat_session_id');
        localStorage.removeItem('guruz_chat_customer_name');
        localStorage.removeItem('guruz_chat_customer_email');
        localStorage.removeItem('guruz_chat_customer_phone');

        setSessionId('');
        setMessages([]);
        setHasLeadInfo(false);
        setLeadName('');
        setLeadEmail('');
        setLeadPhone('');
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setLeadError('');
    };

    const fetchThread = async (sess: string) => {
        if (!sess || !hasLeadInfo) return;
        setLoading(true);
        try {
            const res = await axios.get('/api/live-chat/thread?session_id=' + encodeURIComponent(sess));
            if (res.data?.success && res.data.thread) {
                setMessages(res.data.messages || []);
                if (res.data.thread.customer_name) setCustomerName(res.data.thread.customer_name);
                if (res.data.thread.customer_email) setCustomerEmail(res.data.thread.customer_email);
                if (res.data.thread.customer_phone) setCustomerPhone(res.data.thread.customer_phone);
            }
        } catch (err) {
            console.error('Failed to load live chat thread:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterLead = async (e: React.FormEvent) => {
        e.preventDefault();
        setLeadError('');

        if (!leadName.trim() || leadName.trim().length < 2) {
            setLeadError('দয়া করে আপনার সঠিক নাম লিখুন (কমপক্ষে ২ অক্ষর)');
            return;
        }
        if (!leadEmail.trim() || !leadEmail.includes('@') || !leadEmail.includes('.')) {
            setLeadError('দয়া করে একটি সঠিক জিমেইল বা ইমেইল অ্যাড্রেস লিখুন');
            return;
        }
        if (!leadPhone.trim() || leadPhone.trim().length < 6) {
            setLeadError('দয়া করে আপনার সক্রিয় ফোন নম্বর লিখুন');
            return;
        }

        // Generate brand new unique session ID for this visitor session
        const newSid = 'guest_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
        setSessionId(newSid);
        sessionStorage.setItem('guruz_live_chat_session_id', newSid);

        setSubmittingLead(true);
        try {
            const res = await axios.post('/api/live-chat/register-lead', {
                session_id: newSid,
                customer_name: leadName.trim(),
                customer_email: leadEmail.trim(),
                customer_phone: leadPhone.trim(),
                current_page: window.location.href,
            });

            if (res.data?.success) {
                setCustomerName(leadName.trim());
                setCustomerEmail(leadEmail.trim());
                setCustomerPhone(leadPhone.trim());
                setHasLeadInfo(true);
                sessionStorage.setItem('guruz_chat_customer_name', leadName.trim());
                sessionStorage.setItem('guruz_chat_customer_email', leadEmail.trim());
                sessionStorage.setItem('guruz_chat_customer_phone', leadPhone.trim());

                if (res.data.messages && res.data.messages.length > 0) {
                    setMessages(res.data.messages);
                } else {
                    setMessages([]);
                }
            } else {
                setLeadError(res.data?.message || 'তথ্য সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।');
            }
        } catch (err: any) {
            console.error('Lead registration failed:', err);
            const msg = err.response?.data?.message || 'তথ্য সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
            setLeadError(msg);
        } finally {
            setSubmittingLead(false);
        }
    };

    useEffect(() => {
        if (isOpen && sessionId && hasLeadInfo) {
            fetchThread(sessionId);
        }
    }, [isOpen, sessionId, hasLeadInfo]);

    // Polling for new incoming messages from admin every 3.5s (only when lead info is submitted)
    useEffect(() => {
        if (!isOpen || !sessionId || !hasLeadInfo || isMinimized) return;

        const interval = setInterval(async () => {
            const lastMsgId = messages.length > 0 ? messages[messages.length - 1].id : 0;
            try {
                const res = await axios.get('/api/live-chat/poll?session_id=' + encodeURIComponent(sessionId) + '&last_id=' + lastMsgId);
                if (res.data?.success && Array.isArray(res.data.messages) && res.data.messages.length > 0) {
                    setMessages(prev => {
                        const existingIds = new Set(prev.map(m => m.id));
                        const brandNew = res.data.messages.filter((m: Message) => !existingIds.has(m.id));
                        if (brandNew.length > 0) {
                            const hasAdminMsg = brandNew.some((m: Message) => m.sender_type === 'admin');
                            if (hasAdminMsg) {
                                playNotificationSound('messenger');
                            }
                            return [...prev, ...brandNew];
                        }
                        return prev;
                    });
                }
            } catch (err) {}
        }, 3500);

        return () => clearInterval(interval);
    }, [isOpen, sessionId, isMinimized, messages]);

    useEffect(() => {
        if (!isMinimized && messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length, isMinimized]);

    const handleSend = async (textToSend?: string) => {
        const text = (textToSend !== undefined ? textToSend : inputMsg).trim();
        if (!text && !uploading) return;

        const optimisticId = Date.now();
        const optimisticMsg: Message = {
            id: optimisticId,
            sender_type: 'customer',
            sender_name: customerName || (user?.name ?? 'আপনি'),
            message: text,
            is_read: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMsg]);
        if (textToSend === undefined) setInputMsg('');
        setSending(true);

        try {
            const res = await axios.post('/api/live-chat/send', {
                session_id: sessionId,
                message: text,
                customer_name: customerName || leadName || (user?.name ?? undefined),
                customer_email: customerEmail || leadEmail || (user?.email ?? undefined),
                customer_phone: customerPhone || leadPhone || (user?.phone ?? undefined),
                current_page: window.location.href,
            });

            if (res.data?.success && res.data.message) {
                setMessages(prev => prev.map(m => m.id === optimisticId ? res.data.message : m));
            }
        } catch (err) {
            console.error('Failed to send live message:', err);
        } finally {
            setSending(false);
        }
    };

    const handleSendLike = () => {
        handleSend('👍');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !sessionId) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await axios.post('/api/live-chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (uploadRes.data?.success && uploadRes.data.url) {
                const uploadedUrl = uploadRes.data.url;
                const isImg = uploadRes.data.type === 'image';
                const isAudio = uploadRes.data.type === 'audio';
                const optimisticId = Date.now();
                const optimisticMsg: Message = {
                    id: optimisticId,
                    sender_type: 'customer',
                    sender_name: customerName || (user?.name ?? 'আপনি'),
                    message: isImg ? '' : (isAudio ? '🎙️ ভয়েস মেসেজ' : (uploadRes.data.name || 'ফাইল সংযুক্ত করা হয়েছে')),
                    attachment_url: uploadedUrl,
                    attachment_type: uploadRes.data.type,
                    is_read: false,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    created_at: new Date().toISOString(),
                };

                setMessages(prev => [...prev, optimisticMsg]);

                const sendRes = await axios.post('/api/live-chat/send', {
                    session_id: sessionId,
                    message: isImg ? '' : (isAudio ? '🎙️ ভয়েস মেসেজ' : (uploadRes.data.name || 'ফাইল সংযুক্ত করা হয়েছে')),
                    attachment_url: uploadedUrl,
                    attachment_type: uploadRes.data.type,
                    customer_name: customerName || leadName || (user?.name ?? undefined),
                    customer_email: customerEmail || leadEmail || (user?.email ?? undefined),
                    customer_phone: customerPhone || leadPhone || (user?.phone ?? undefined),
                    current_page: window.location.href,
                });

                if (sendRes.data?.success && sendRes.data.message) {
                    setMessages(prev => prev.map(m => m.id === optimisticId ? sendRes.data.message : m));
                }
            }
        } catch (err) {
            console.error('File upload failed:', err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // 🎙️ START VOICE RECORDING
    const startVoiceRecording = async () => {
        if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            alert('আপনার ব্রাউজারে মাইক্রোফোন সাপোর্ট নেই।');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
                ? 'audio/webm' 
                : (MediaRecorder.isTypeSupported('audio/ogg') ? 'audio/ogg' : '');

            const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            recorder.start(100);
            setIsRecording(true);
            setRecordDuration(0);

            timerIntervalRef.current = setInterval(() => {
                setRecordDuration(prev => prev + 1);
            }, 1000);

        } catch (err: any) {
            console.error('Microphone access denied:', err);
            alert('মাইক্রোফোন ব্যবহারের অনুমতি দিন।');
        }
    };

    // 🛑 CANCEL VOICE RECORDING
    const cancelVoiceRecording = () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        audioChunksRef.current = [];
        setIsRecording(false);
        setRecordDuration(0);
    };

    // 🚀 STOP & SEND VOICE RECORDING
    const sendVoiceRecording = () => {
        if (!mediaRecorderRef.current) return;

        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

        mediaRecorderRef.current.onstop = async () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }

            const audioBlob = new Blob(audioChunksRef.current, { 
                type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
            });

            if (audioBlob.size < 100) {
                setIsRecording(false);
                setRecordDuration(0);
                return;
            }

            setUploading(true);
            setIsRecording(false);
            setRecordDuration(0);

            const file = new File([audioBlob], `voice_${Date.now()}.webm`, { 
                type: audioBlob.type || 'audio/webm' 
            });

            const formData = new FormData();
            formData.append('file', file);

            try {
                const uploadRes = await axios.post('/api/live-chat/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (uploadRes.data?.success && uploadRes.data.url) {
                    const uploadedUrl = uploadRes.data.url;
                    const optimisticId = Date.now();
                    const optimisticMsg: Message = {
                        id: optimisticId,
                        sender_type: 'customer',
                        sender_name: customerName || (user?.name ?? 'আপনি'),
                        message: '🎙️ ভয়েস মেসেজ',
                        attachment_url: uploadedUrl,
                        attachment_type: 'audio',
                        is_read: false,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        created_at: new Date().toISOString(),
                    };

                    setMessages(prev => [...prev, optimisticMsg]);

                    const sendRes = await axios.post('/api/live-chat/send', {
                        session_id: sessionId,
                        message: '🎙️ ভয়েস মেসেজ',
                        attachment_url: uploadedUrl,
                        attachment_type: 'audio',
                        customer_name: customerName || leadName || (user?.name ?? undefined),
                        customer_email: customerEmail || leadEmail || (user?.email ?? undefined),
                        customer_phone: customerPhone || leadPhone || (user?.phone ?? undefined),
                        current_page: window.location.href,
                    });

                    if (sendRes.data?.success && sendRes.data.message) {
                        setMessages(prev => prev.map(m => m.id === optimisticId ? sendRes.data.message : m));
                    }
                }
            } catch (err) {
                console.error('Voice upload failed:', err);
                alert('ভয়েস মেসেজ পাঠানো সম্ভব হয়নি। আবার চেষ্টা করুন।');
            } finally {
                setUploading(false);
            }
        };

        if (mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    };

    const formatTimer = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!isOpen) return null;

    const modalContent = (
        <div 
            id="guruz-live-messenger-chat"
            className={`fixed z-[999999999] bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)] border border-slate-200 dark:border-slate-800 transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in flex flex-col overflow-hidden ${
                isMinimized 
                    ? 'bottom-[75px] sm:bottom-5 right-2 sm:right-6 left-2 sm:left-auto w-auto sm:w-[380px] h-[56px]' 
                    : 'bottom-[75px] sm:bottom-6 right-2 sm:right-6 left-2 sm:left-auto w-auto sm:w-[380px] h-[520px] sm:h-[580px] max-h-[78vh] sm:max-h-[84vh]'
            }`}
            style={{
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.08)',
                boxSizing: 'border-box',
                zIndex: 999999999,
            }}
        >
            {/* ─── 1. MESSENGER HEADER ─── */}
            <div className="shrink-0 h-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-3.5 flex items-center justify-between select-none shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-xs overflow-hidden">
                            <img 
                                src="/storage/favicons/qfo7b0fPqqpPH2d7jwskKeJVdo0e0ht6JtOB315S.png" 
                                alt="Guruz" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <span className="text-white font-black text-xs">G</span>
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    </div>
                    <div className="min-w-0 flex items-center gap-1 cursor-pointer">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            Guruz Support
                        </h3>
                        <ChevronDown size={15} className="text-purple-600 stroke-[2.5]" />
                    </div>
                </div>

                {/* Top Actions: Reset/New Chat, Minimize & Close */}
                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                    <button
                        type="button"
                        onClick={handleResetChat}
                        className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer text-slate-500 hover:text-blue-600"
                        title="নতুন চ্যাট শুরু করুন (রিসেট)"
                    >
                        <RefreshCw size={14} className="stroke-[2.2]" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsMinimized(prev => !prev)}
                        className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
                        title={isMinimized ? 'Expand' : 'Minimize'}
                    >
                        <Minus size={18} className="stroke-[2.5]" />
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
                        title="Close Chat"
                    >
                        <X size={18} className="stroke-[2.5]" />
                    </button>
                </div>
            </div>

            {/* ─── 2. SCROLLABLE MESSENGER CHAT BODY ─── */}
            {!isMinimized && (
                <div 
                    className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 bg-white dark:bg-slate-900"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {hasLeadInfo && loading && messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 py-10">
                            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">চ্যাট লোড হচ্ছে...</p>
                        </div>
                    ) : hasLeadInfo ? (
                        messages.map((m) => {
                            const isCustomer = m.sender_type === 'customer';
                            const isAudio = m.attachment_type === 'audio' || (m.attachment_url && m.attachment_url.match(/\.(mp3|wav|ogg|webm|m4a)(\?.*)?$/i));
                            const isImage = !isAudio && (m.attachment_type === 'image' || (m.attachment_url && m.attachment_url.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i)));
                            const isUrlMessage = m.message && m.message.match(/^https?:\/\/[^\s]+$/i);
                            const fullAttachmentUrl = m.attachment_url ? (m.attachment_url.startsWith('http') || m.attachment_url.startsWith('/') ? m.attachment_url : ('/' + m.attachment_url)) : null;

                            return (
                                <div key={m.id} className="space-y-1">
                                    {/* Centered Messenger Timestamp */}
                                    <div className="text-center my-1">
                                        <span className="text-[11px] font-medium text-slate-400">
                                            {m.time}
                                        </span>
                                    </div>

                                    {/* ── Rich Link Preview Message ── */}
                                    {isUrlMessage && (
                                        <div className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
                                            <a 
                                                href={m.message} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="max-w-[85%] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm block hover:opacity-95 transition"
                                            >
                                                <div className="bg-gradient-to-r from-[#9333ea] to-[#a855f7] p-2.5 text-white font-bold text-xs underline break-all">
                                                    {m.message}
                                                </div>
                                                <div className="bg-slate-100 dark:bg-slate-800 p-2.5">
                                                    <p className="font-bold text-xs text-slate-800 dark:text-slate-100">
                                                        ওয়েবসাইট লিঙ্ক
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                                        {m.message.replace(/^https?:\/\//i, '')}
                                                    </p>
                                                </div>
                                            </a>
                                        </div>
                                    )}

                                    {/* ── 🎙️ Messenger Voice Note Player ── */}
                                    {fullAttachmentUrl && isAudio && (
                                        <div className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-1.5">
                                                {isCustomer && (
                                                    <a 
                                                        href={fullAttachmentUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition"
                                                        title="ভয়েস ডাউনলোড করুন"
                                                    >
                                                        <Share2 size={15} />
                                                    </a>
                                                )}
                                                <VoicePlayer url={fullAttachmentUrl} isCustomer={isCustomer} />
                                            </div>
                                            {isCustomer && (
                                                <span className="text-[10px] text-slate-400 font-medium mr-2 mt-0.5">
                                                    {m.is_read ? 'Seen' : 'Sent'}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* ── 🖼️ Clean Messenger Image Card ── */}
                                    {fullAttachmentUrl && isImage && (
                                        <div className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2">
                                                {isCustomer && (
                                                    <a 
                                                        href={fullAttachmentUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition"
                                                        title="ছবিটি ওপেন করুন"
                                                    >
                                                        <Share2 size={16} />
                                                    </a>
                                                )}

                                                <div className="rounded-3xl overflow-hidden max-w-[220px] sm:max-w-[260px] border border-slate-200/80 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-800">
                                                    <a 
                                                        href={fullAttachmentUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="block cursor-pointer group"
                                                    >
                                                        <img 
                                                            src={fullAttachmentUrl} 
                                                            alt="Sent Image" 
                                                            className="w-full max-h-[220px] sm:max-h-[260px] object-cover rounded-3xl hover:scale-102 transition-transform duration-200" 
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                const target = e.currentTarget;
                                                                target.style.display = 'none';
                                                                const parent = target.parentElement;
                                                                if (parent) {
                                                                    parent.className = 'p-4 bg-slate-100 dark:bg-slate-800 rounded-3xl text-xs font-bold flex items-center gap-2 text-blue-600 underline';
                                                                    parent.innerHTML = '🖼️ ছবিটি সম্পূর্ণ দেখতে ক্লিক করুন';
                                                                }
                                                            }}
                                                        />
                                                    </a>
                                                </div>
                                            </div>

                                            {isCustomer && (
                                                <span className="text-[10px] text-slate-400 font-medium mr-2 mt-0.5">
                                                    {m.is_read ? 'Seen' : 'Sent'}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* ── Regular Text Message Bubbles ── */}
                                    {!isUrlMessage && !isAudio && m.message && (
                                        <div className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
                                            <div
                                                className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-[13px] font-medium leading-relaxed ${
                                                    isCustomer
                                                        ? m.message === '👍' 
                                                            ? 'text-3xl bg-transparent shadow-none p-0'
                                                            : 'bg-[#0084FF] text-white rounded-tr-xs shadow-xs'
                                                        : 'bg-[#f0f2f5] dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                                                }`}
                                            >
                                                {!isCustomer && (
                                                    <p className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 mb-0.5">
                                                        {m.sender_name || 'Guruz Support'}
                                                    </p>
                                                )}
                                                <p className="whitespace-pre-wrap break-words">
                                                    {m.message}
                                                </p>
                                            </div>

                                            {isCustomer && m.message !== '👍' && (
                                                <span className="text-[10px] text-slate-400 font-medium mr-1 mt-0.5">
                                                    {m.is_read ? 'Seen' : 'Sent'}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : null}

                    {/* 📝 VISITOR LEAD REGISTRATION FORM: (Name, Gmail, Phone) */}
                    {!hasLeadInfo && (
                        <div className="space-y-3">
                            {/* Official Welcome Message Bubble */}
                            <div className="flex flex-col items-start animate-in fade-in duration-200">
                                <div className="rounded-2xl px-4 py-2.5 max-w-[90%] text-[13px] font-medium leading-relaxed bg-[#f0f2f5] dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs">
                                    <p className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 mb-0.5">
                                        Guruz Support
                                    </p>
                                    <p className="whitespace-pre-wrap break-words">
                                        👋 স্বাগতম! Guruz কাস্টমার সাপোর্টে আপনাকে স্বাগতম। আমাদের সাথে সরাসরি চ্যাট করতে অনুগ্রহ করে আপনার নাম, জিমেইল ও ফোন নম্বর দিন।
                                    </p>
                                </div>
                            </div>

                            {/* Lead Form Card */}
                            <div className="p-4 bg-gradient-to-b from-blue-50/70 via-indigo-50/40 to-white dark:from-slate-800 dark:to-slate-900 rounded-3xl border border-blue-200/80 dark:border-slate-700 shadow-md animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#0084FF] to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 shrink-0">
                                        <Headphones size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                                            লাইভ চ্যাটে মেসেজ করতে তথ্য দিন
                                        </h4>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                            সাপোর্ট টিমের সাথে যুক্ত হতে নিচের ৩টি তথ্য দিন
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleRegisterLead} className="space-y-2.5">
                                    {leadError && (
                                        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold">
                                            ⚠️ {leadError}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            আপনার নাম <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={leadName}
                                                onChange={(e) => setLeadName(e.target.value)}
                                                placeholder="আপনার পূর্ণ নাম লিখুন"
                                                required
                                                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            জিমেইল / ইমেইল <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="email"
                                                value={leadEmail}
                                                onChange={(e) => setLeadEmail(e.target.value)}
                                                placeholder="example@gmail.com"
                                                required
                                                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            ফোন নম্বর <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="tel"
                                                value={leadPhone}
                                                onChange={(e) => setLeadPhone(e.target.value)}
                                                placeholder="017XXXXXXXX"
                                                required
                                                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingLead}
                                        className="w-full mt-1 py-2.5 bg-gradient-to-r from-[#0084FF] to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                        {submittingLead ? (
                                            <>
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                <span>যাচাই হচ্ছে...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>চ্যাট শুরু করুন</span>
                                                <Send size={13} className="translate-x-0.5" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-[10px] text-center text-slate-400 font-medium pt-1 flex items-center justify-center gap-1">
                                        <Lock size={10} /> আপনার তথ্য আমাদের কাছে সম্পূর্ণ নিরাপদ ও সুরক্ষিত
                                    </p>
                                </form>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            )}

            {/* ─── 3. QUICK SUGGESTION CHIPS ─── */}
            {!isMinimized && hasLeadInfo && messages.length <= 3 && !isRecording && (
                <div 
                    className="shrink-0 px-3 py-1.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {QUICK_QUESTIONS.map((q, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSend(q)}
                            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-[#0084FF] text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-full whitespace-nowrap transition cursor-pointer border border-slate-200 dark:border-slate-700 active:scale-95"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}

            {/* ─── 4. EXACT MESSENGER BOTTOM BAR WITH REAL VOICE RECORDING ─── */}
            {!isMinimized && (
                <div 
                    className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-2.5 py-2 shadow-xs z-30"
                    style={{ minHeight: '56px', boxSizing: 'border-box' }}
                >
                    {!hasLeadInfo ? (
                        <div className="flex items-center justify-center py-2.5 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center">
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                <Lock size={13} className="text-[#0084FF] dark:text-blue-400 shrink-0" />
                                মেসেজ করতে উপরের ফর্মে নাম, জিমেইল ও ফোন দিন
                            </p>
                        </div>
                    ) : isRecording ? (
                        <div className="flex items-center justify-between gap-2 w-full animate-in fade-in duration-200 py-1">
                            {/* Cancel Button */}
                            <button
                                type="button"
                                onClick={cancelVoiceRecording}
                                className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/50 hover:bg-red-200 text-red-600 flex items-center justify-center transition cursor-pointer shrink-0 active:scale-90"
                                title="রেকর্ডিং বাতিল করুন"
                            >
                                <Trash2 size={16} />
                            </button>

                            {/* Pulsing Timer & Audio Wave */}
                            <div className="flex-1 flex items-center justify-center gap-2.5 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-full border border-red-200/50 dark:border-red-900/40">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block" />
                                <span className="font-bold text-xs text-red-600 dark:text-red-400">
                                    {formatTimer(recordDuration)}
                                </span>
                                <div className="flex items-center gap-0.5 h-3">
                                    {[60, 100, 40, 80, 50, 90, 30, 70].map((h, i) => (
                                        <span 
                                            key={i} 
                                            style={{ height: `${h}%` }}
                                            className="w-0.5 bg-red-500 rounded-full animate-pulse" 
                                        />
                                    ))}
                                </div>
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                    রেকর্ড হচ্ছে...
                                </span>
                            </div>

                            {/* Send Voice Note Button */}
                            <button
                                type="button"
                                onClick={sendVoiceRecording}
                                className="w-8 h-8 rounded-full bg-[#0084FF] hover:bg-blue-600 text-white flex items-center justify-center transition cursor-pointer shrink-0 active:scale-90 shadow-md shadow-blue-500/30"
                                title="ভয়েস মেসেজ পাঠান"
                            >
                                <Send size={16} className="translate-x-0.5" />
                            </button>
                        </div>
                    ) : (
                        /* STANDARD MESSENGER INPUT CONTROLS */
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex items-center gap-1.5 w-full"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,audio/*,.pdf,.doc,.docx"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            
                            {/* 1. Messenger Voice / Mic Icon (Starts Real Audio Recording) */}
                            <button
                                type="button"
                                onClick={startVoiceRecording}
                                disabled={uploading}
                                className="w-8 h-8 rounded-full hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-center text-[#0084FF] transition cursor-pointer shrink-0 active:scale-90"
                                title="ভয়েস রেকর্ড করুন"
                            >
                                <Mic size={20} className="stroke-[2.2]" />
                            </button>

                            {/* 2. Messenger Image / Gallery Icon */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-[#0084FF] transition cursor-pointer shrink-0"
                                title="ছবি পাঠান"
                            >
                                <ImageIcon size={20} className="stroke-[2.2]" />
                            </button>

                            {/* Clean Rounded Pill Input Field */}
                            <div className="flex-1 relative flex items-center">
                                <input
                                    type="text"
                                    value={inputMsg}
                                    onChange={(e) => setInputMsg(e.target.value)}
                                    placeholder={uploading ? 'আপলোড হচ্ছে...' : 'Aa'}
                                    disabled={uploading}
                                    className="w-full px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 border-none rounded-full text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-0 focus:outline-none transition"
                                />
                            </div>

                            {/* Permanent Send Button */}
                            <button
                                type="submit"
                                disabled={(!inputMsg.trim() && !uploading) || sending}
                                className="w-8 h-8 rounded-full bg-[#0084FF] hover:bg-blue-600 disabled:opacity-40 text-white transition cursor-pointer flex items-center justify-center shrink-0 active:scale-95 shadow-xs"
                                title="মেসেজ পাঠান"
                            >
                                <Send size={16} className="translate-x-0.5" />
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
