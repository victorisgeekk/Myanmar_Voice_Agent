import React, { useState } from 'react';
import { Radio, Mic, MicOff, Server, Users, ShieldCheck, Activity, Terminal } from 'lucide-react';
import { LiveKitState } from '../types';

interface LiveKitPanelProps {
  state: LiveKitState;
  onConnect: (roomName: string, identity: string) => void;
  onDisconnect: () => void;
  onToggleMic: (enabled: boolean) => void;
  isMicMuted: boolean;
}

export const LiveKitPanel: React.FC<LiveKitPanelProps> = ({
  state,
  onConnect,
  onDisconnect,
  onToggleMic,
  isMicMuted,
}) => {
  const [roomName, setRoomName] = useState(state.roomName || 'bagan-voice-room');
  const [identity, setIdentity] = useState(state.identity || 'android-user-bagan');
  const [showDocs, setShowDocs] = useState(false);

  const handleConnectClick = () => {
    if (state.isConnected) {
      onDisconnect();
    } else {
      onConnect(roomName, identity);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-4 p-4 rounded-2xl bg-[#170e07]/90 border border-amber-900/50 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold font-bagan text-amber-200">
            LiveKit Cloud WebRTC Voice Engine
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              state.isConnected
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                : 'bg-stone-900 text-stone-400 border border-stone-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                state.isConnected ? 'bg-emerald-400 animate-ping' : 'bg-stone-500'
              }`}
            />
            {state.isConnected ? 'Connected' : 'Disconnected'}
          </span>

          <button
            onClick={() => setShowDocs(!showDocs)}
            className="text-xs text-amber-400 underline hover:text-amber-300 cursor-pointer"
          >
            {showDocs ? 'Doc ဖျောက်ရန်' : 'LiveKit Docs & Setup'}
          </button>
        </div>
      </div>

      {/* Connection Info */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold text-amber-400/80 block mb-1">
            Server Endpoint (LiveKit Cloud):
          </label>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/40 border border-amber-950 text-xs text-amber-300/90 font-mono">
            <Server className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">wss://mcp-9dd5r4aj.livekit.cloud</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-amber-400/80 block mb-1">
            Room အမည် (Room Name):
          </label>
          <input
            type="text"
            value={roomName}
            disabled={state.isConnected}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-amber-950 text-xs text-amber-200 font-mono focus:border-amber-500 outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-amber-400/80 block mb-1">
            Participant Identity:
          </label>
          <input
            type="text"
            value={identity}
            disabled={state.isConnected}
            onChange={(e) => setIdentity(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-amber-950 text-xs text-amber-200 font-mono focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Buttons & LiveKit Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-950">
        <div className="flex items-center gap-3">
          <button
            onClick={handleConnectClick}
            disabled={state.isConnecting}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-2 ${
              state.isConnected
                ? 'bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-500/40'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-extrabold border border-amber-400'
            }`}
          >
            <Radio className="w-4 h-4" />
            {state.isConnecting
              ? 'ချိတ်ဆက်နေသည်...'
              : state.isConnected
              ? 'အခန်းမှ ထွက်မည် (Disconnect)'
              : 'LiveKit Room သို့ ချိတ်ဆက်မည်'}
          </button>

          {state.isConnected && (
            <button
              onClick={() => onToggleMic(isMicMuted)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer ${
                isMicMuted
                  ? 'bg-amber-950 border-amber-700 text-amber-300'
                  : 'bg-stone-800 border-stone-700 text-stone-300'
              }`}
            >
              {isMicMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isMicMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
            </button>
          )}
        </div>

        {/* Live Audio Level Meter */}
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-amber-950">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-amber-300/80">Audio Level:</span>
          <div className="w-24 h-2 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-75"
              style={{ width: `${Math.min(100, state.audioLevel)}%` }}
            />
          </div>
          <span className="text-xs font-mono text-amber-400">{state.audioLevel}%</span>
        </div>
      </div>

      {/* Error Message if any */}
      {state.error && (
        <div className="mt-3 p-2 rounded-lg bg-rose-950/50 border border-rose-600/40 text-rose-300 text-xs">
          ⚠️ {state.error}
        </div>
      )}

      {/* LiveKit Documentation Helper (Collapsible) */}
      {showDocs && (
        <div className="mt-4 p-3 rounded-xl bg-black/60 border border-amber-900/40 text-xs text-amber-200/90 font-myanmar space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Terminal className="w-4 h-4" />
            <span>Termux / Cloud Agent ချိတ်ဆက်ပုံ လမ်းညွှန်:</span>
          </div>
          <p>
            ဖုန်းထဲရှိ Termux (သို့မဟုတ် VPS) တွင် အောက်ပါ Command ဖြင့် Voice Agent ကို စတင် Run ပါ:
          </p>
          <pre className="p-2.5 rounded bg-[#0d0704] text-amber-300 font-mono overflow-x-auto text-[11px] border border-amber-950">
{`LIVEKIT_URL=wss://mcp-9dd5r4aj.livekit.cloud
LIVEKIT_API_KEY=APIyYCFRAenC96B
LIVEKIT_API_SECRET=0iDtdCeXJtRPdPeq3QnLefeSfTA77QxKjzjv4rqF3ZsF

# Run python agent with Gemma 4 31B or OpenAI
python agent.py dev`}
          </pre>
          <p className="text-[11px] text-amber-400/70">
            * ဤ Bagan Voice Agent Client သည် LiveKit Cloud သို့ တိုက်ရိုက် ချိတ်ဆက်ထားသဖြင့် Python Agent ဘက်မှ စကားပြောလိုက်ပါက ဖုန်းစပီကာမှ တိုက်ရိုက် ကြားရမည် ဖြစ်ပါသည်။
          </p>
        </div>
      )}
    </div>
  );
};
