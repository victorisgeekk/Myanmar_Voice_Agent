import React, { useState } from 'react';
import {
  Wifi,
  Bluetooth,
  Flashlight,
  Volume2,
  VolumeX,
  PhoneCall,
  MessageSquare,
  Battery,
  Camera,
  Youtube,
  Compass,
  CheckCircle,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import { AndroidPhoneState } from '../types';

interface VoiceCommandControllerProps {
  phoneState: AndroidPhoneState;
  onToggleWifi: () => void;
  onToggleBluetooth: () => void;
  onToggleFlashlight: () => void;
  onAdjustVolume: (delta: number) => void;
  onQuickCommand: (commandText: string) => void;
  onLaunchApp: (appName: string, urlScheme: string) => void;
  onDialPhone: (number: string) => void;
  onSendSms: (number: string, message: string) => void;
}

export const VoiceCommandController: React.FC<VoiceCommandControllerProps> = ({
  phoneState,
  onToggleWifi,
  onToggleBluetooth,
  onToggleFlashlight,
  onAdjustVolume,
  onQuickCommand,
  onLaunchApp,
  onDialPhone,
  onSendSms,
}) => {
  const [dialNumber, setDialNumber] = useState('09789123456');
  const [smsMsg, setSmsMsg] = useState('မင်္ဂလာပါ');
  const [showDialer, setShowDialer] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto my-4 p-4 rounded-2xl bg-[#180f08]/90 border border-amber-900/50 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold font-bagan text-amber-200">
            Android ဖုန်း ထိန်းချုပ်မှု စနစ် (Phone Control Hub)
          </h2>
        </div>
        <span className="text-xs text-amber-400/80 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800/40">
          Ram 6GB Android Optimized
        </span>
      </div>

      {/* Action status notification banner */}
      {phoneState.lastAction && (
        <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-600/40 flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-myanmar font-medium">
            လုပ်ဆောင်ချက် အောင်မြင်ပါသည်: {phoneState.lastAction}
          </span>
        </div>
      )}

      {/* Grid of Core Hardware Toggles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {/* Wi-Fi Toggle */}
        <button
          onClick={onToggleWifi}
          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
            phoneState.wifi
              ? 'bg-amber-900/40 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-[#120a05] border-stone-800 text-stone-400 hover:border-amber-800'
          }`}
        >
          <Wifi className={`w-6 h-6 ${phoneState.wifi ? 'text-amber-400' : 'text-stone-500'}`} />
          <span className="text-xs font-bold font-myanmar">
            Wi-Fi {phoneState.wifi ? 'ဖွင့်ထား' : 'ပိတ်ထား'}
          </span>
          <span className="text-[10px] text-amber-400/70 font-mono">
            "ဝိုင်ဖိုင် {phoneState.wifi ? 'ပိတ်ပါ' : 'ဖွင့်ပါ'}"
          </span>
        </button>

        {/* Bluetooth Toggle */}
        <button
          onClick={onToggleBluetooth}
          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
            phoneState.bluetooth
              ? 'bg-blue-950/50 border-blue-500 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
              : 'bg-[#120a05] border-stone-800 text-stone-400 hover:border-amber-800'
          }`}
        >
          <Bluetooth
            className={`w-6 h-6 ${phoneState.bluetooth ? 'text-blue-400' : 'text-stone-500'}`}
          />
          <span className="text-xs font-bold font-myanmar">
            Bluetooth {phoneState.bluetooth ? 'ချိတ်ပြီး' : 'ပိတ်ထား'}
          </span>
          <span className="text-[10px] text-blue-400/70 font-mono">
            "ဘလူးတုသ် {phoneState.bluetooth ? 'ပိတ်ပါ' : 'ဖွင့်ပါ'}"
          </span>
        </button>

        {/* Flashlight / Torch */}
        <button
          onClick={onToggleFlashlight}
          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
            phoneState.flashlight
              ? 'bg-yellow-950/60 border-yellow-400 text-yellow-200 shadow-[0_0_18px_rgba(234,179,8,0.3)]'
              : 'bg-[#120a05] border-stone-800 text-stone-400 hover:border-amber-800'
          }`}
        >
          <Flashlight
            className={`w-6 h-6 ${
              phoneState.flashlight ? 'text-yellow-300 animate-pulse' : 'text-stone-500'
            }`}
          />
          <span className="text-xs font-bold font-myanmar">
            ဓာတ်မီး {phoneState.flashlight ? 'လင်းနေသည်' : 'ပိတ်ထား'}
          </span>
          <span className="text-[10px] text-yellow-400/70 font-mono">
            "မီး {phoneState.flashlight ? 'ပိတ်ပါ' : 'ဖွင့်ပါ'}"
          </span>
        </button>

        {/* Battery Monitor */}
        <div className="p-3 rounded-xl border border-amber-900/40 bg-[#120a05] flex flex-col items-center justify-center gap-1.5 text-amber-300">
          <div className="relative">
            <Battery className="w-6 h-6 text-emerald-400" />
            {phoneState.batteryCharging && (
              <span className="absolute -top-1 -right-1 text-[10px] text-yellow-400">⚡</span>
            )}
          </div>
          <span className="text-xs font-bold font-myanmar">
            Battery: {phoneState.batteryLevel !== null ? `${phoneState.batteryLevel}%` : '85%'}
          </span>
          <span className="text-[10px] text-stone-400 font-mono">"ဘက်ထရီ စစ်ပါ"</span>
        </div>
      </div>

      {/* Volume Slider & Controls */}
      <div className="mt-4 p-3 rounded-xl bg-[#120a05] border border-amber-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
          {phoneState.volume === 0 ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-amber-400" />
          )}
          <span>အသံပမာဏ (Volume): {phoneState.volume}%</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onAdjustVolume(-10)}
            className="px-2.5 py-1 text-xs rounded bg-stone-800 text-stone-200 hover:bg-stone-700 active:scale-95 cursor-pointer"
          >
            အသံတိုး (-10)
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={phoneState.volume}
            onChange={(e) => onAdjustVolume(Number(e.target.value) - phoneState.volume)}
            className="w-full sm:w-36 accent-amber-500 cursor-pointer"
          />
          <button
            onClick={() => onAdjustVolume(10)}
            className="px-2.5 py-1 text-xs rounded bg-amber-900/80 text-amber-200 hover:bg-amber-800 active:scale-95 cursor-pointer"
          >
            အသံချဲ့ (+10)
          </button>
        </div>
      </div>

      {/* Quick Myanmar Voice Command Pills */}
      <div className="mt-4">
        <div className="text-xs font-semibold text-amber-400/80 mb-2 flex items-center justify-between">
          <span>နမူနာ အသံအမိန့်များ (Click to simulate Myanmar Voice Command):</span>
          <button
            onClick={() => setShowDialer(!showDialer)}
            className="text-amber-400 underline hover:text-amber-300 cursor-pointer"
          >
            {showDialer ? 'ဖုန်းခေါ်စနစ် ဖျောက်ရန်' : 'ဖုန်းခေါ် / SMS စမ်းသပ်ရန်'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            'Wi-Fi ဖွင့်ပေးပါ',
            'Wi-Fi ပိတ်ပေးပါ',
            'ဖုန်း မီးဖွင့်ပေးပါ',
            'မီးပိတ်ပါ',
            'အချိန် ဘယ်လောက်ရှိပြီလဲ',
            'ပုဂံသမိုင်း အကျဉ်းပြောပြပါ',
            'YouTube ဖွင့်ပါ',
            'ကင်မရာဖွင့်ပါ',
            'Google Drive မှာ မှတ်တမ်းသိမ်းပါ',
          ].map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => onQuickCommand(cmd)}
              className="px-3 py-1.5 rounded-full text-xs font-myanmar bg-amber-950/60 border border-amber-800/40 text-amber-200 hover:bg-amber-900/80 hover:border-amber-500 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              💬 "{cmd}"
            </button>
          ))}
        </div>
      </div>

      {/* Dialer & SMS Panel (Collapsible) */}
      {showDialer && (
        <div className="mt-4 p-3 rounded-xl bg-[#140b06] border border-amber-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Phone Call Form */}
          <div className="p-2.5 rounded-lg bg-black/40 border border-amber-950">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-2">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>ဖုန်းခေါ်ဆိုခြင်း (Dialer Launcher)</span>
            </div>
            <div className="flex gap-2">
              <input
                type="tel"
                value={dialNumber}
                onChange={(e) => setDialNumber(e.target.value)}
                placeholder="ဖုန်းနံပါတ် ရိုက်ထည့်ပါ"
                className="flex-1 px-2.5 py-1 text-xs rounded bg-stone-900 border border-stone-700 text-stone-100"
              />
              <button
                onClick={() => onDialPhone(dialNumber)}
                className="px-3 py-1 rounded bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-600 cursor-pointer flex items-center gap-1"
              >
                <PhoneCall className="w-3 h-3" />
                ခေါ်မည်
              </button>
            </div>
          </div>

          {/* SMS Sender */}
          <div className="p-2.5 rounded-lg bg-black/40 border border-amber-950">
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold mb-2">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>SMS မက်ဆေ့ခ်ျ ပို့ခြင်း (SMS Launcher)</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={smsMsg}
                onChange={(e) => setSmsMsg(e.target.value)}
                placeholder="မက်ဆေ့ခ်ျ စာသား"
                className="flex-1 px-2.5 py-1 text-xs rounded bg-stone-900 border border-stone-700 text-stone-100"
              />
              <button
                onClick={() => onSendSms(dialNumber, smsMsg)}
                className="px-3 py-1 rounded bg-blue-700 text-white text-xs font-semibold hover:bg-blue-600 cursor-pointer flex items-center gap-1"
              >
                <MessageSquare className="w-3 h-3" />
                ပို့မည်
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Android App Launchers */}
      <div className="mt-4 pt-3 border-t border-amber-900/40">
        <span className="text-xs text-amber-400/80 font-semibold block mb-2">
          ဖုန်းတွင်းရှိ Apps များ ဖွင့်လှစ်ရန် (App Launchers):
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onLaunchApp('YouTube', 'https://youtube.com')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-xs hover:bg-red-900/60 cursor-pointer"
          >
            <Youtube className="w-3.5 h-3.5 text-red-400" />
            <span>YouTube</span>
            <ExternalLink className="w-2.5 h-2.5 text-red-500" />
          </button>

          <button
            onClick={() => onLaunchApp('Camera', '')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-300 text-xs hover:bg-stone-800 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Camera</span>
          </button>

          <button
            onClick={() => onLaunchApp('Google Maps', 'https://maps.google.com')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs hover:bg-emerald-900/60 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Maps</span>
            <ExternalLink className="w-2.5 h-2.5 text-emerald-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
