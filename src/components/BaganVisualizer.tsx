import React from 'react';
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface BaganVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel: number; // 0 to 100
  recognizedText: string;
  agentReply: string;
  onToggleMic: () => void;
  disabled?: boolean;
}

export const BaganVisualizer: React.FC<BaganVisualizerProps> = ({
  isListening,
  isSpeaking,
  audioLevel,
  recognizedText,
  agentReply,
  onToggleMic,
  disabled = false,
}) => {
  // Scaling factor for mandala ripples based on audio level
  const scaleValue = 1 + (audioLevel / 100) * 0.35;
  const glowOpacity = Math.max(0.2, audioLevel / 100);

  return (
    <div className="flex flex-col items-center justify-center w-full py-6 px-4">
      {/* Central Bagan Lotus Voice Mandala */}
      <div className="relative flex items-center justify-center w-56 h-56 sm:w-64 sm:h-64 select-none">
        {/* Background Terracotta Arch Rings */}
        <div className="absolute inset-0 rounded-full border border-amber-800/20 bg-amber-950/20" />

        {/* Outer Animated Mandala Ring */}
        <motion.div
          animate={{
            rotate: isListening || isSpeaking ? 360 : 0,
            scale: isListening || isSpeaking ? scaleValue : 1,
          }}
          transition={{
            rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
            scale: { type: 'spring', stiffness: 300, damping: 20 },
          }}
          className="absolute inset-2 rounded-full border border-dashed border-amber-600/40 opacity-70 pointer-events-none"
        />

        {/* Bagan Lotus Petal Ring (SVG) */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full text-amber-600/30 animate-spin-slow pointer-events-none"
          style={{ animationDuration: '60s' }}
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = i * 30;
            return (
              <g key={i} transform={`rotate(${angle} 100 100)`}>
                {/* Traditional Myanmar Lotus Petal outline */}
                <path
                  d="M100 20 C95 45, 80 65, 100 85 C120 65, 105 45, 100 20 Z"
                  fill="rgba(217, 119, 6, 0.08)"
                  stroke="#d97706"
                  strokeWidth="0.75"
                />
                <circle cx="100" cy="18" r="1.5" fill="#f59e0b" />
              </g>
            );
          })}
        </svg>

        {/* Secondary Pulsing Halo when active */}
        {(isListening || isSpeaking) && (
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [glowOpacity * 0.5, glowOpacity, glowOpacity * 0.5],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-6 rounded-full bg-gradient-to-tr from-amber-600/30 via-yellow-500/20 to-amber-700/30 blur-md pointer-events-none"
          />
        )}

        {/* Primary Interactive Gold Leaf Microphone Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleMic}
          disabled={disabled}
          className={`relative z-20 flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full cursor-pointer shadow-2xl transition-all ${
            isListening
              ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-stone-950 shadow-[0_0_35px_rgba(245,158,11,0.6)] ring-4 ring-amber-300'
              : isSpeaking
              ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-[0_0_35px_rgba(16,185,129,0.5)] ring-4 ring-emerald-300'
              : 'bg-gradient-to-br from-[#2a170c] via-[#3a2012] to-[#1a0e07] text-amber-300 border-2 border-amber-600/60 hover:border-amber-400 shadow-[0_0_20px_rgba(146,64,14,0.3)]'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isSpeaking ? (
            <Volume2 className="w-10 h-10 animate-bounce text-white" />
          ) : isListening ? (
            <Mic className="w-10 h-10 animate-pulse text-stone-950" />
          ) : (
            <MicOff className="w-10 h-10 text-amber-400/90" />
          )}

          <span className="text-[11px] font-bold mt-1 font-myanmar tracking-tight">
            {isSpeaking ? 'အေဂျင့်ဖြေဆိုနေ' : isListening ? 'နားထောင်နေသည်' : 'အသံဖြင့်ခိုင်းရန်'}
          </span>
        </motion.button>
      </div>

      {/* Voice Status Indicator Pill */}
      <div className="mt-4 flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isListening
              ? 'bg-amber-400 animate-ping'
              : isSpeaking
              ? 'bg-emerald-400 animate-pulse'
              : 'bg-stone-600'
          }`}
        />
        <span className="text-xs text-amber-300/80 font-myanmar">
          {isListening
            ? 'မိုက်ခရိုဖုန်း ဖွင့်ထားပါသည် - မြန်မာလို အသံဖြင့် ပြောပါ...'
            : isSpeaking
            ? 'အေဂျင့်က အသံဖြင့် ပြန်လည်ဖြေကြားနေပါသည်...'
            : 'မိုက်ကို နှိပ်၍ မြန်မာဘာသာဖြင့် အမိန့်ပေးပါ'}
        </span>
      </div>

      {/* Live Speech Recognition & Response Stream Box */}
      <div className="w-full max-w-lg mt-4 p-4 rounded-xl bg-[#1c1109]/90 border border-amber-900/60 shadow-lg relative overflow-hidden">
        {/* Subtle corner accents */}
        <div className="absolute top-1 left-1 text-amber-700/40 text-[10px] select-none">
          ❖ ပုဂံ
        </div>
        <div className="absolute top-1 right-1 text-amber-700/40 text-[10px] select-none">
          ❖ Victor Geek
        </div>

        {/* User live speech transcript */}
        <div className="mb-2">
          <div className="flex items-center gap-1.5 text-xs text-amber-400/70 font-semibold mb-1">
            <Mic className="w-3.5 h-3.5 text-amber-400" />
            <span>သင်ပြောသောစကား (Recognized Speech):</span>
          </div>
          <p className="text-sm font-myanmar min-h-[24px] text-amber-100/90 bg-black/30 p-2 rounded-lg border border-amber-950/60">
            {recognizedText || (
              <span className="text-stone-500 italic">
                (စကားပြောလိုက်ပါက ဤနေရာတွင် မြန်မာစာသား ပေါ်လာပါမည်...)
              </span>
            )}
          </p>
        </div>

        {/* Agent voice response */}
        {agentReply && (
          <div className="mt-3 pt-3 border-t border-amber-950">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>အေဂျင့် အဖြေ (Agent Voice Output):</span>
            </div>
            <p className="text-sm font-myanmar text-amber-200/95 leading-relaxed bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/40">
              {agentReply}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
