import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  Zap,
  ShieldCheck,
  Globe,
  Radio,
  Sliders,
  Volume2,
  Bell,
  Vibrate,
  Code2,
  Copy,
  Check,
  Flame,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

export type AiProvider = 'offline' | 'gemini' | 'livekit' | 'openai' | 'openrouter';
export type VoiceTone = 'royal' | 'modern' | 'tactical';

interface AiModelUpgradeHubProps {
  currentProvider: AiProvider;
  currentTone: VoiceTone;
  onSelectProvider: (provider: AiProvider) => void;
  onSelectTone: (tone: VoiceTone) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  hapticEnabled: boolean;
  onToggleHaptic: (enabled: boolean) => void;
  onCleanRam: () => void;
  onTestChime: () => void;
}

export const AiModelUpgradeHub: React.FC<AiModelUpgradeHubProps> = ({
  currentProvider,
  currentTone,
  onSelectProvider,
  onSelectTone,
  soundEnabled,
  onToggleSound,
  hapticEnabled,
  onToggleHaptic,
  onCleanRam,
  onTestChime,
}) => {
  const [copiedPython, setCopiedPython] = useState(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'overclock' | 'script'>('matrix');

  const pythonScript = `# Bagan Voice AI Agent - Termux / LiveKit Runner
# Developer: Victor Geek (Optimized for 6GB RAM Android)
import os
import requests
from livekit import rtc

LIVEKIT_URL = "${typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:3000'}/api/livekit/token"
MCP_CALL_URL = "${typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:3000'}/api/mcp/call"

def handle_voice_command(user_text: str):
    print(f"[User Voice]: {user_text}")
    
    # 1. Dispatch to Built-in MCP Server
    if "မီး" in user_text:
        res = requests.post(MCP_CALL_URL, json={
            "name": "android_control_flashlight",
            "arguments": {"enabled": "ဖွင့်" in user_text}
        })
        print("MCP Flashlight State:", res.json())
        
    elif "wifi" in user_text or "ဝိုင်ဖိုင်" in user_text:
        res = requests.post(MCP_CALL_URL, json={
            "name": "android_control_wifi",
            "arguments": {"action": "disable" if "ပိတ်" in user_text else "enable"}
        })
        print("MCP Wi-Fi State:", res.json())

    elif "ram" in user_text or "ရှင်း" in user_text:
        res = requests.post(MCP_CALL_URL, json={
            "name": "android_clean_ram",
            "arguments": {}
        })
        print("MCP 6GB RAM Clean:", res.json())

if __name__ == "__main__":
    print("Bagan Voice Agent Engine Active with Built-in Android MCP!")
`;

  const copyScript = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopiedPython(true);
    setTimeout(() => setCopiedPython(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-4 p-4 sm:p-6 rounded-2xl bg-[#170e07]/95 border border-amber-900/60 shadow-[0_0_35px_rgba(245,158,11,0.15)] backdrop-blur-md">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
            <h2 className="text-base sm:text-xl font-bold font-bagan text-amber-200">
              Maximum Level AI Engine & Brain Upgrade Hub
            </h2>
          </div>
          <p className="text-xs text-amber-300/80 font-myanmar mt-1">
            Gemini, OpenRouter, OpenAI, LiveKit Gemma 4 နှင့် Built-in Offline Engine စွမ်းဆောင်ရည် နှိုင်းယှဉ်ချက်
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-inner flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Overclocked Level: MAX</span>
          </span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 mt-4 p-1 rounded-xl bg-black/40 border border-amber-950">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'matrix'
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-bold shadow-md'
              : 'text-stone-400 hover:text-amber-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Model Matrix (လိုအပ်/မလိုအပ် ရှင်းလင်းချက်)</span>
        </button>

        <button
          onClick={() => setActiveTab('overclock')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'overclock'
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-bold shadow-md'
              : 'text-stone-400 hover:text-amber-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Maximum Energy Controls (ကြေးစည်၊ တုန်ခါမှု၊ ဟန်ပန်)</span>
        </button>

        <button
          onClick={() => setActiveTab('script')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'script'
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-bold shadow-md'
              : 'text-stone-400 hover:text-amber-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Termux / Python Script (1-Click)</span>
        </button>
      </div>

      {/* TAB 1: AI Model Matrix & Selection */}
      {activeTab === 'matrix' && (
        <div className="mt-4 space-y-4">
          {/* Quick Answer Banner */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 space-y-1.5 font-myanmar leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>အဖြေတို: အခြား Paid API Key များ မဖြစ်မနေ ဝယ်ယူထည့်သွင်းရန် မလိုပါ!</span>
            </div>
            <p className="text-[11px] text-emerald-100/80">
              အက်ပ်တွင် Built-in အဖြစ် <strong>Autonomous Bagan Offline Engine</strong> ပါဝင်သောကြောင့် API မလိုဘဲ 0ms Latency ဖြင့် ဖုန်း Hardware အားလုံးကို အသံဖြင့် ထိန်းချုပ်နိုင်ပါသည်။ အကယ်၍ Advanced Reasoning လိုအပ်ပါက အောက်ပါ Model များကို စိတ်ကြိုက် ရွေးချယ်နိုင်ပါသည်:
            </p>
          </div>

          {/* Model Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 1. Offline Engine */}
            <div
              onClick={() => onSelectProvider('offline')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                currentProvider === 'offline'
                  ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-black/30 border-amber-950/80 hover:border-amber-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">Autonomous Offline</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono">
                    0 API Key / 0ms
                  </span>
                </div>
                <p className="text-xs text-stone-300 font-myanmar mt-2 leading-relaxed">
                  ဖုန်းတွင်းရှိ Wi-Fi, Bluetooth, Flashlight, Battery, Volume, Apps နှင့် ပုဂံဗဟုသုတများကို တိုက်ရိုက် မောင်းနှင်သည်။
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-amber-950 flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-400">100% Free & Offline</span>
                {currentProvider === 'offline' && <span className="text-amber-300 font-bold">Active Brain</span>}
              </div>
            </div>

            {/* 2. Gemini 2.5 Flash */}
            <div
              onClick={() => onSelectProvider('gemini')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                currentProvider === 'gemini'
                  ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-black/30 border-amber-950/80 hover:border-amber-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">Gemini 2.5 Flash</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 font-mono">
                    Google DeepMind
                  </span>
                </div>
                <p className="text-xs text-stone-300 font-myanmar mt-2 leading-relaxed">
                  မြန်မာဘာသာစကား သဘာဝကျကျ တွေးခေါ်နိုင်ပြီး ပုဂံသမိုင်း၊ ဗိသုကာနှင့် ရှုပ်ထွေးသော မေးခွန်းများကို ဖြေဆိုပေးနိုင်သည်။
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-amber-950 flex items-center justify-between text-[11px] font-mono">
                <span className="text-amber-400">AI Studio Server-side</span>
                {currentProvider === 'gemini' && <span className="text-amber-300 font-bold">Active Brain</span>}
              </div>
            </div>

            {/* 3. LiveKit Cloud Inference */}
            <div
              onClick={() => onSelectProvider('livekit')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                currentProvider === 'livekit'
                  ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-black/30 border-amber-950/80 hover:border-amber-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-sky-300">LiveKit Gemma 4</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 font-mono">
                    31B / WebRTC
                  </span>
                </div>
                <p className="text-xs text-stone-300 font-myanmar mt-2 leading-relaxed">
                  LiveKit Cloud ၏ Built-in Inference ဖြင့် အသံတိုက်ရိုက် အပြန်အလှန်ပြောဆိုနိုင်သည်။ ပြင်ပ Key သီးခြားထပ်မလိုပါ။
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-amber-950 flex items-center justify-between text-[11px] font-mono">
                <span className="text-sky-400">Zero-Key LiveKit Cloud</span>
                {currentProvider === 'livekit' && <span className="text-amber-300 font-bold">Active Brain</span>}
              </div>
            </div>

            {/* 4. OpenAI / ChatGPT */}
            <div
              onClick={() => onSelectProvider('openai')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                currentProvider === 'openai'
                  ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-black/30 border-amber-950/80 hover:border-amber-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">OpenAI (GPT-4o Mini)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-900 text-stone-300 font-mono">
                    Optional API Key
                  </span>
                </div>
                <p className="text-xs text-stone-300 font-myanmar mt-2 leading-relaxed">
                  OpenAI API Key ရှိပါက GPT-4o Mini သို့မဟုတ် GPT-4o ကို Proxy Route ဖြင့် လုံခြုံစွာ ခေါ်ယူအသုံးပြုနိုင်သည်။
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-amber-950 flex items-center justify-between text-[11px] font-mono">
                <span className="text-stone-400">.env / Settings Key</span>
                {currentProvider === 'openai' && <span className="text-amber-300 font-bold">Active Brain</span>}
              </div>
            </div>

            {/* 5. OpenRouter */}
            <div
              onClick={() => onSelectProvider('openrouter')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                currentProvider === 'openrouter'
                  ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-black/30 border-amber-950/80 hover:border-amber-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-purple-300">OpenRouter</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 font-mono">
                    DeepSeek R1 / Llama 3.3
                  </span>
                </div>
                <p className="text-xs text-stone-300 font-myanmar mt-2 leading-relaxed">
                  DeepSeek R1, Llama 3.3, Qwen 2.5, Claude 3.5 Sonnet စသည့် ကမ္ဘာ့ထိပ်တန်း Open-source မော်ဒယ်အားလုံး ချိတ်ဆက်နိုင်သည်။
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-amber-950 flex items-center justify-between text-[11px] font-mono">
                <span className="text-purple-400">Multi-Model Aggregator</span>
                {currentProvider === 'openrouter' && <span className="text-amber-300 font-bold">Active Brain</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Maximum Energy Controls (Tones, Bronze Chime, Haptics, 6GB RAM Clean) */}
      {activeTab === 'overclock' && (
        <div className="mt-4 space-y-4">
          {/* Tone Selector */}
          <div className="p-4 rounded-xl bg-black/40 border border-amber-950 space-y-3">
            <span className="text-xs font-bold text-amber-300 font-myanmar block">
              ပုဂံအသံလက်ထောက်၏ တုံ့ပြန်ဟန်ပန် ရွေးချယ်မှု (Voice Tone & Persona):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => onSelectTone('royal')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  currentTone === 'royal'
                    ? 'bg-amber-950/80 border-amber-400 text-amber-200 ring-1 ring-amber-400'
                    : 'bg-black/30 border-amber-950/70 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="font-bold text-xs text-amber-300 font-myanmar">
                  👑 ပုဂံနန်းတွင်း ရိုသေယဉ်ကျေးသံ
                </div>
                <div className="text-[11px] text-stone-300/80 font-myanmar mt-1">
                  "မှန်လှပါ ဘုရား/ခင်ဗျာ၊ အမိန့်တော်အတိုင်း ချက်ချင်း ဆောင်ရွက်ပြီးပါပြီ ဘုရား။"
                </div>
              </button>

              <button
                onClick={() => onSelectTone('modern')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  currentTone === 'modern'
                    ? 'bg-amber-950/80 border-amber-400 text-amber-200 ring-1 ring-amber-400'
                    : 'bg-black/30 border-amber-950/70 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="font-bold text-xs text-amber-300 font-myanmar">
                  ⚡ Victor Geek နည်းပညာသွက်လက်သံ
                </div>
                <div className="text-[11px] text-stone-300/80 font-myanmar mt-1">
                  "ဟုတ်ကဲ့ မင်္ဂလာပါခင်ဗျာ! အခုပဲ အဆင်ပြေအောင် လုပ်ဆောင်ပေးလိုက်ပါမယ်။"
                </div>
              </button>

              <button
                onClick={() => onSelectTone('tactical')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  currentTone === 'tactical'
                    ? 'bg-amber-950/80 border-amber-400 text-amber-200 ring-1 ring-amber-400'
                    : 'bg-black/30 border-amber-950/70 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="font-bold text-xs text-amber-300 font-myanmar">
                  🎯 တိုတိုရှင်းရှင်း အမိန့်နာခံသံ
                </div>
                <div className="text-[11px] text-stone-300/80 font-myanmar mt-1">
                  "လုပ်ဆောင်ပြီးပါပြီ။ Wi-Fi ဖွင့်ထားပါသည်။"
                </div>
              </button>
            </div>
          </div>

          {/* Sensory Overclock Grid: Kye-Zee Chime, Haptic, 6GB RAM Clean */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Bronze Kye-Zee Synthesizer */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-amber-950 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs font-myanmar">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>ပုဂံကြေးစည် သံစဥ် (Acoustic Chime)</span>
                </div>
                <p className="text-[11px] text-stone-400 font-myanmar mt-1">
                  အသံအမိန့်ပေးချိန်နှင့် လုပ်ဆောင်ချက်ပြီးဆုံးချိန်တွင် ရှေးဟောင်း ကြေးစည်သံ (784Hz + 1568Hz) မြည်စေသည်။
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={onTestChime}
                  className="px-2.5 py-1 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-800 text-[11px] font-mono text-amber-200 cursor-pointer flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>စမ်းသပ်မြည်ရန်</span>
                </button>
                <button
                  onClick={() => onToggleSound(!soundEnabled)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    soundEnabled
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {soundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Mobile Haptic Vibration */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-amber-950 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs font-myanmar">
                  <Vibrate className="w-4 h-4 text-rose-400" />
                  <span>Haptic Tactile Pulse (ဖုန်းတုန်ခါမှု)</span>
                </div>
                <p className="text-[11px] text-stone-400 font-myanmar mt-1">
                  အမိန့်အောင်မြင်စွာ ပြီးမြောက်သည့်အခါ ဖုန်း ဟာ့ဒ်ဝဲ တုန်ခါမှုဖြင့် အသိပေးသည်။
                </p>
              </div>
              <div className="mt-3 flex items-center justify-end">
                <button
                  onClick={() => onToggleHaptic(!hapticEnabled)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    hapticEnabled
                      ? 'bg-rose-500 text-stone-950'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {hapticEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* 6GB RAM Cache Cleaner */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-amber-950 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs font-myanmar">
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>6GB RAM Cache Booster</span>
                </div>
                <p className="text-[11px] text-stone-400 font-myanmar mt-1">
                  Android Memory နှင့် Background Cache များကို 1-Tap ဖြင့် ရှင်းလင်းပေးသည်။
                </p>
              </div>
              <div className="mt-3 flex items-center justify-end">
                <button
                  onClick={onCleanRam}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-stone-950 font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Boost RAM Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Termux / Python Script */}
      {activeTab === 'script' && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-300 font-myanmar font-semibold">
              Android ဖုန်း Termux တွင် LiveKit + Built-in MCP တိုက်ရိုက် Run နိုင်သော Python Script:
            </span>
            <button
              onClick={copyScript}
              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {copiedPython ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPython ? 'Copied!' : 'Copy Script'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-[#090503] border border-amber-950 text-amber-300 text-xs font-mono overflow-x-auto leading-relaxed max-h-72">
            {pythonScript}
          </pre>
        </div>
      )}
    </div>
  );
};
