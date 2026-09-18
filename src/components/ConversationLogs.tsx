import React, { useState } from 'react';
import { Send, MessageSquare, Trash2, Bot, User } from 'lucide-react';
import { VoiceLog } from '../types';

interface ConversationLogsProps {
  logs: VoiceLog[];
  onSendMessage: (text: string) => void;
  onClearLogs: () => void;
}

export const ConversationLogs: React.FC<ConversationLogsProps> = ({
  logs,
  onSendMessage,
  onClearLogs,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-4 p-4 rounded-2xl bg-[#170e07]/90 border border-amber-900/50 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold font-bagan text-amber-200">
            စကားပြောဆိုမှုနှင့် အမိန့် မှတ်တမ်းများ (Activity Logs)
          </h2>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ရှင်းလင်းမည်</span>
          </button>
        )}
      </div>

      {/* Message Stream */}
      <div className="mt-4 space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="p-6 text-center text-xs text-amber-400/60 font-myanmar bg-black/30 rounded-xl border border-amber-950">
            စကားပြောဆိုမှု မှတ်တမ်း မရှိသေးပါ။ မိုက်ခရိုဖုန်းကို နှိပ်၍ သို့မဟုတ် အောက်ပါ input မှတစ်ဆင့် မြန်မာလို စာရိုက်၍ စတင်နိုင်ပါသည်။
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-xl text-xs font-myanmar leading-relaxed flex gap-2.5 ${
                log.sender === 'user'
                  ? 'bg-amber-950/40 border border-amber-800/40 ml-4 text-amber-100'
                  : log.sender === 'agent'
                  ? 'bg-[#22130b] border border-amber-600/40 mr-4 text-amber-200 shadow-md'
                  : 'bg-stone-900/80 border border-stone-800 text-stone-300'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {log.sender === 'user' ? (
                  <div className="w-6 h-6 rounded-full bg-amber-700/60 flex items-center justify-center text-amber-200">
                    <User className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-500/30 flex items-center justify-center text-amber-400 border border-amber-500/50">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between text-[10px] text-amber-400/60 mb-1">
                  <span className="font-semibold">
                    {log.sender === 'user' ? 'အသုံးပြုသူ (User)' : 'Bagan AI Agent'}
                  </span>
                  <span>{log.timestamp}</span>
                </div>

                <p className="text-xs">{log.text}</p>

                {log.actionExecuted && (
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                    <span>⚡ Action: {log.actionExecuted}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual Input Form for text-based typing fallback */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 pt-3 border-t border-amber-950">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="မြန်မာဘာသာဖြင့် မေးခွန်း သို့မဟုတ် အမိန့် ရိုက်ထည့်ပါ (ဥပမာ- Wi-Fi ပိတ်ပါ)..."
          className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-amber-950 text-xs text-amber-100 font-myanmar outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>ပို့မည်</span>
        </button>
      </form>
    </div>
  );
};
