import React from 'react';
import { KanoteOrnament } from './KanoteOrnament';
import { Radio, Cpu, HardDrive, Sparkles } from 'lucide-react';
import { LiveKitState } from '../types';

interface HeaderProps {
  livekitState: LiveKitState;
  isDriveConnected: boolean;
  onOpenLiveKitModal: () => void;
  onOpenDriveModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  livekitState,
  isDriveConnected,
  onOpenLiveKitModal,
  onOpenDriveModal,
}) => {
  return (
    <header className="relative w-full pt-4 pb-2 px-4 border-b border-amber-900/40 bg-gradient-to-b from-[#1c1007] to-[#120a05]">
      {/* Bagan Stupa Spire Motif at the top */}
      <KanoteOrnament variant="stupa" className="-mb-2" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/40 text-amber-300 text-xs tracking-wider uppercase font-semibold shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Develop by Victor Geek</span>
        </div>

        <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide font-bagan bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-md">
          Bagan Voice Agent
        </h1>

        <p className="text-xs sm:text-sm text-amber-200/80 font-myanmar mt-0.5">
          ပုဂံခေတ် လက်ရာ မြန်မာမှု အနုပညာ အသံသုံး AI & Android ဖုန်းထိန်းချုပ်မှု စနစ်
        </p>

        {/* Divider Kanote */}
        <KanoteOrnament variant="divider" className="my-1" />

        {/* Quick status bar optimized for 6GB RAM mobile device display */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          {/* LiveKit Status Chip */}
          <button
            onClick={onOpenLiveKitModal}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              livekitState.isConnected
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-amber-950/40 border-amber-800/40 text-amber-300/80 hover:border-amber-600'
            }`}
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                livekitState.isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-500'
              }`}
            />
            <span>
              LiveKit: {livekitState.isConnected ? 'ချိတ်ဆက်ပြီး' : 'Cloud အသင့်ရှိ'}
            </span>
          </button>

          {/* 6GB RAM Optimization Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/40 border border-amber-700/40 text-amber-200/90">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>RAM 6GB ချောမွေ့မှု စနစ်</span>
          </div>

          {/* Google Drive Status Chip */}
          <button
            onClick={onOpenDriveModal}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              isDriveConnected
                ? 'bg-blue-950/60 border-blue-500/50 text-blue-300'
                : 'bg-stone-900/80 border-stone-700/60 text-stone-300 hover:border-amber-600'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span>Drive: {isDriveConnected ? 'ချိတ်ဆက်ထားသည်' : 'သိမ်းဆည်းရန်'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
