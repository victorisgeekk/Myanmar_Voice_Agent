import React, { useState } from 'react';
import {
  Cpu,
  Terminal,
  Play,
  CheckCircle2,
  Wifi,
  Bluetooth,
  Flashlight,
  Battery,
  Volume2,
  Smartphone,
  PhoneCall,
  MessageSquare,
  Vibrate,
  Code2,
  Radio,
  Server,
  Zap,
  Sun,
  RefreshCw,
  Info,
  Copy,
  Activity,
} from 'lucide-react';
import { McpRelayConfig } from '../types';
import { BUILT_IN_ANDROID_MCP_TOOLS, androidMcpClient, McpToolDefinition } from '../services/mcpClient';

interface McpIntegrationPanelProps {
  config: McpRelayConfig;
  onConnect: (url: string, token: string) => void;
  onDisconnect: () => void;
  onRunCommand: (cmd: string) => void;
  onExecuteTool?: (toolName: string, args: Record<string, any>) => Promise<any>;
}

export const McpIntegrationPanel: React.FC<McpIntegrationPanelProps> = ({
  config,
  onConnect,
  onDisconnect,
  onRunCommand,
  onExecuteTool,
}) => {
  const [activeMode, setActiveMode] = useState<'builtin' | 'local' | 'relay'>('builtin');
  const [url, setUrl] = useState(config.url || 'wss://mcp.turin.my/agent');
  const [token, setToken] = useState(config.token || '');
  const [customCmd, setCustomCmd] = useState('dumpsys battery');
  const [selectedTool, setSelectedTool] = useState<McpToolDefinition>(BUILT_IN_ANDROID_MCP_TOOLS[0]);
  const [toolArgsJson, setToolArgsJson] = useState('{\n  "action": "enable"\n}');
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showCodeGuide, setShowCodeGuide] = useState(false);

  const getToolIcon = (name: string) => {
    switch (name) {
      case 'android_control_wifi':
        return <Wifi className="w-4 h-4 text-amber-400" />;
      case 'android_control_bluetooth':
        return <Bluetooth className="w-4 h-4 text-blue-400" />;
      case 'android_control_flashlight':
        return <Flashlight className="w-4 h-4 text-yellow-400" />;
      case 'android_get_battery_status':
        return <Battery className="w-4 h-4 text-emerald-400" />;
      case 'android_adjust_volume':
        return <Volume2 className="w-4 h-4 text-amber-400" />;
      case 'android_launch_app':
        return <Smartphone className="w-4 h-4 text-indigo-400" />;
      case 'android_dial_phone':
        return <PhoneCall className="w-4 h-4 text-emerald-400" />;
      case 'android_send_sms':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'android_device_vibrate':
        return <Vibrate className="w-4 h-4 text-purple-400" />;
      case 'android_screen_brightness':
        return <Sun className="w-4 h-4 text-amber-300" />;
      case 'android_clean_ram':
        return <RefreshCw className="w-4 h-4 text-emerald-300" />;
      case 'android_device_info':
        return <Info className="w-4 h-4 text-sky-400" />;
      case 'android_clipboard_copy':
        return <Copy className="w-4 h-4 text-yellow-300" />;
      case 'android_haptic_pulse':
        return <Activity className="w-4 h-4 text-rose-400" />;
      default:
        return <Terminal className="w-4 h-4 text-rose-400" />;
    }
  };

  const handleSelectTool = (tool: McpToolDefinition) => {
    setSelectedTool(tool);
    // Generate default sample arguments based on schema
    if (tool.name === 'android_control_wifi' || tool.name === 'android_control_bluetooth') {
      setToolArgsJson('{\n  "action": "enable"\n}');
    } else if (tool.name === 'android_control_flashlight') {
      setToolArgsJson('{\n  "enabled": true\n}');
    } else if (tool.name === 'android_get_battery_status') {
      setToolArgsJson('{}');
    } else if (tool.name === 'android_adjust_volume') {
      setToolArgsJson('{\n  "level": 80\n}');
    } else if (tool.name === 'android_launch_app') {
      setToolArgsJson('{\n  "app_name": "youtube",\n  "uri": "https://youtube.com"\n}');
    } else if (tool.name === 'android_dial_phone') {
      setToolArgsJson('{\n  "phone_number": "09789123456"\n}');
    } else if (tool.name === 'android_send_sms') {
      setToolArgsJson('{\n  "phone_number": "09789123456",\n  "message": "မင်္ဂလာပါ Victor Geek"\n}');
    } else if (tool.name === 'android_device_vibrate') {
      setToolArgsJson('{\n  "duration_ms": 300\n}');
    } else if (tool.name === 'android_screen_brightness') {
      setToolArgsJson('{\n  "level": 85\n}');
    } else if (tool.name === 'android_clean_ram') {
      setToolArgsJson('{}');
    } else if (tool.name === 'android_device_info') {
      setToolArgsJson('{}');
    } else if (tool.name === 'android_clipboard_copy') {
      setToolArgsJson('{\n  "text": "Victor Geek Bagan Voice Agent MCP 2024"\n}');
    } else if (tool.name === 'android_haptic_pulse') {
      setToolArgsJson('{\n  "pattern": "success"\n}');
    } else if (tool.name === 'android_shell_execute') {
      setToolArgsJson('{\n  "command": "dumpsys battery"\n}');
    } else {
      setToolArgsJson('{}');
    }
  };

  const handleExecuteTool = async () => {
    try {
      setIsExecuting(true);
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(toolArgsJson);
      } catch (e) {
        setExecutionOutput(`JSON Arguments parse error: ${e}`);
        setIsExecuting(false);
        return;
      }

      if (onExecuteTool) {
        const res = await onExecuteTool(selectedTool.name, parsedArgs);
        setExecutionOutput(JSON.stringify(res, null, 2));
      } else {
        const res = await androidMcpClient.executeBuiltInTool(selectedTool.name, parsedArgs);
        setExecutionOutput(JSON.stringify(res, null, 2));
      }
    } catch (err: any) {
      setExecutionOutput(`Execution error: ${err?.message || err}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-4 p-4 sm:p-5 rounded-2xl bg-[#170e07]/95 border border-amber-900/50 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-amber-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold font-bagan text-amber-200">
              Built-in Android MCP Server & Runner
            </h2>
          </div>
          <p className="text-xs text-amber-300/70 font-myanmar mt-0.5">
            Android စနစ်သုံး Model Context Protocol (MCP 2024-11-05 Specification) Built-in အင်ဂျင်
          </p>
        </div>

        {/* Built-in Status Badge */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Built-in MCP Active</span>
          </div>

          <button
            onClick={() => setShowCodeGuide(!showCodeGuide)}
            className="text-xs text-amber-400 underline hover:text-amber-300 cursor-pointer flex items-center gap-1"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showCodeGuide ? 'Guide ဖျောက်ရန်' : 'LiveKit / Python ချိတ်ဆက်ပုံ'}</span>
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 mt-4 p-1 rounded-xl bg-black/40 border border-amber-950">
        <button
          onClick={() => setActiveMode('builtin')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeMode === 'builtin'
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-bold shadow-md'
              : 'text-stone-400 hover:text-amber-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Built-in Engine (In-App Direct)</span>
        </button>

        <button
          onClick={() => setActiveMode('local')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeMode === 'local'
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-bold shadow-md'
              : 'text-stone-400 hover:text-amber-200'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Local Shizuku Daemon (ws://127.0.0.1)</span>
        </button>

        <button
          onClick={() => setActiveMode('relay')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeMode === 'relay'
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-bold shadow-md'
              : 'text-stone-400 hover:text-amber-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Remote Relay (rish-mcp)</span>
        </button>
      </div>

      {/* Mode 1: Built-in In-App MCP Tools Studio */}
      {activeMode === 'builtin' && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400/90 font-myanmar">
              Built-in ပါဝင်သော Android MCP Tools များ ({BUILT_IN_ANDROID_MCP_TOOLS.length} ခု):
            </span>
            <span className="text-[11px] text-amber-500/70 font-mono">
              Endpoint: /api/mcp/call &bull; /api/mcp/rpc
            </span>
          </div>

          {/* Grid of Tools */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {BUILT_IN_ANDROID_MCP_TOOLS.map((tool) => {
              const isSelected = selectedTool.name === tool.name;
              return (
                <button
                  key={tool.name}
                  onClick={() => handleSelectTool(tool)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer h-20 ${
                    isSelected
                      ? 'bg-amber-950/70 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                      : 'bg-[#120a05] border-amber-950/80 hover:border-amber-700 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    {getToolIcon(tool.name)}
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-amber-200 truncate">
                    {tool.name.replace('android_', '')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Tool Inspector & Execution Console */}
          <div className="p-4 rounded-xl bg-black/50 border border-amber-900/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {getToolIcon(selectedTool.name)}
                <span className="text-xs font-mono font-bold text-amber-300">
                  {selectedTool.name}
                </span>
              </div>
              <span className="text-[11px] text-stone-400 italic">
                {selectedTool.description}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Arguments JSON Input */}
              <div>
                <label className="text-[11px] font-mono text-amber-400/80 block mb-1">
                  Arguments (JSON Schema):
                </label>
                <textarea
                  value={toolArgsJson}
                  onChange={(e) => setToolArgsJson(e.target.value)}
                  rows={4}
                  className="w-full p-2 rounded-lg bg-[#0d0704] border border-amber-950 text-xs font-mono text-amber-200 outline-none focus:border-amber-500"
                />
              </div>

              {/* Execution Output */}
              <div>
                <label className="text-[11px] font-mono text-emerald-400/80 block mb-1">
                  MCP Tool Execution Result (JSON-RPC Output):
                </label>
                <div className="w-full h-[98px] p-2 rounded-lg bg-[#0d0704] border border-amber-950 text-xs font-mono text-emerald-300 overflow-y-auto whitespace-pre-wrap">
                  {executionOutput || (
                    <span className="text-stone-600 italic">
                      "Execute Built-in Tool" ကို နှိပ်ပါက ရလဒ် ဤနေရာတွင် ပေါ်လာပါမည်...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Run Button */}
            <div className="flex items-center justify-between pt-2 border-t border-amber-950">
              <span className="text-[11px] text-amber-400/70 font-myanmar">
                အသံဖြင့် အမိန့်ပေးသည့်အခါ ဤ Built-in MCP Tools များကို အလိုအလျောက် ခေါ်ယူအသုံးပြုပါသည်။
              </span>

              <button
                onClick={handleExecuteTool}
                disabled={isExecuting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-stone-950 font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecuting ? 'လုပ်ဆောင်နေသည်...' : 'Execute Built-in Tool'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Local Shizuku Daemon */}
      {activeMode === 'local' && (
        <div className="mt-4 p-4 rounded-xl bg-black/40 border border-amber-950 space-y-3 text-xs">
          <p className="text-amber-200 font-myanmar">
            ဖုန်းထဲရှိ Shizuku / rish Local WebSocket Daemon (ဥပမာ <code>ws://127.0.0.1:8765</code>) သို့ တိုက်ရိုက် ချိတ်ဆက်နိုင်ပါသည်။
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value="ws://127.0.0.1:8765/mcp"
              readOnly
              className="flex-1 px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 font-mono text-amber-200"
            />
            <button
              onClick={() => onConnect('ws://127.0.0.1:8765/mcp', '')}
              className="px-4 py-2 rounded-lg bg-amber-600 text-stone-950 font-bold hover:bg-amber-500 cursor-pointer"
            >
              Connect Local
            </button>
          </div>

          <div className="p-3 rounded-lg bg-[#0d0704] border border-amber-950">
            <label className="text-amber-400 font-semibold block mb-1">
              Direct ADB Shell Command Run:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customCmd}
                onChange={(e) => setCustomCmd(e.target.value)}
                placeholder="dumpsys battery or pm list packages"
                className="flex-1 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 font-mono text-amber-200"
              />
              <button
                onClick={() => onRunCommand(customCmd)}
                className="px-3 py-1.5 rounded-lg bg-amber-700 text-stone-950 font-bold hover:bg-amber-600 cursor-pointer"
              >
                Execute
              </button>
            </div>
            {config.lastResponse && (
              <pre className="mt-2 p-2 rounded bg-black text-[11px] font-mono text-emerald-400 border border-stone-800 overflow-x-auto max-h-36">
                {config.lastResponse}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Mode 3: Remote Relay */}
      {activeMode === 'relay' && (
        <div className="mt-4 p-4 rounded-xl bg-black/40 border border-amber-950 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-amber-400 font-semibold block mb-1">
                Relay URL (e.g. wss://mcp.turin.my/agent):
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 font-mono text-amber-200"
              />
            </div>
            <div>
              <label className="text-amber-400 font-semibold block mb-1">Device Token:</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="rish-mcp device token"
                className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 font-mono text-amber-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (config.isConnected) {
                  onDisconnect();
                } else {
                  onConnect(url, token);
                }
              }}
              className={`px-4 py-2 rounded-xl font-bold cursor-pointer ${
                config.isConnected
                  ? 'bg-rose-900 text-rose-100'
                  : 'bg-amber-600 text-stone-950 hover:bg-amber-500'
              }`}
            >
              {config.isConnected ? 'Disconnect Relay' : 'Connect Relay'}
            </button>
            <span className="font-mono text-amber-300/80">Status: {config.status}</span>
          </div>
        </div>
      )}

      {/* Guide Code Snippet for LiveKit Python Agent */}
      {showCodeGuide && (
        <div className="mt-4 p-3.5 rounded-xl bg-black/70 border border-amber-900/40 text-xs font-mono text-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-myanmar">
            <Code2 className="w-4 h-4" />
            <span>Python LiveKit Agent မှ Built-in MCP Tools များကို ခေါ်ယူအသုံးပြုပုံ:</span>
          </div>
          <pre className="p-3 rounded bg-[#0b0603] text-amber-300 text-[11px] overflow-x-auto border border-amber-950 leading-relaxed">
{`# In your LiveKit Voice Agent (agent.py):
import requests

MCP_API = "http://127.0.0.1:3000/api/mcp/call"

# Turn on Flashlight via Built-in MCP
res = requests.post(MCP_API, json={
    "name": "android_control_flashlight",
    "arguments": {"enabled": True}
})
print("Torch State:", res.json())

# Check Battery via Built-in MCP
battery_res = requests.post(MCP_API, json={
    "name": "android_get_battery_status",
    "arguments": {}
})
print("Battery:", battery_res.json())`}
          </pre>
        </div>
      )}
    </div>
  );
};
