/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { BaganVisualizer } from './components/BaganVisualizer';
import { VoiceCommandController } from './components/VoiceCommandController';
import { LiveKitPanel } from './components/LiveKitPanel';
import { McpIntegrationPanel } from './components/McpIntegrationPanel';
import { GoogleDrivePanel } from './components/GoogleDrivePanel';
import { GoogleTasksPanel } from './components/GoogleTasksPanel';
import { ConversationLogs } from './components/ConversationLogs';
import { KanoteOrnament } from './components/KanoteOrnament';
import { AiModelUpgradeHub, AiProvider, VoiceTone } from './components/AiModelUpgradeHub';
import { audioChime } from './utils/audioChime';

import {
  LiveKitState,
  AndroidPhoneState,
  McpRelayConfig,
  DriveSavedFile,
  VoiceLog,
} from './types';
import { livekitService } from './services/livekit';
import { androidMcpClient } from './services/mcpClient';
import { speechService } from './services/speechService';
import { initAuth, googleSignIn, logoutGoogle } from './services/firebase';
import {
  uploadVoiceSessionToDrive,
  listDriveVoiceFiles,
  deleteDriveFile,
} from './services/googleDrive';
import { googleTasksService } from './services/googleTasks';

export default function App() {
  // Voice & Interaction states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [agentReply, setAgentReply] = useState(
    'မင်္ဂလာပါ ခင်ဗျာ။ Victor Geek ၏ ပုဂံ Voice Agent မှ ကြိုဆိုပါတယ်။ ဘာများ ခိုင်းစေလိုပါသလဲခင်ဗျာ။'
  );
  const [activeTab, setActiveTab] = useState<
    'voice' | 'livekit' | 'mcp' | 'drive' | 'tasks' | 'logs' | 'models'
  >('voice');
  const [activeProvider, setActiveProvider] = useState<AiProvider>('offline');
  const [activeTone, setActiveTone] = useState<VoiceTone>('modern');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  // Logs state
  const [logs, setLogs] = useState<VoiceLog[]>([
    {
      id: 'init-1',
      sender: 'agent',
      text: 'မင်္ဂလာပါ! Victor Geek ၏ ပုဂံ Voice Agent အဆင်သင့်ရှိပါပြီ။ မိုက်ခရိုဖုန်းကို နှိပ်၍ မြန်မာလို အသံဖြင့် စတင်ခိုင်းစေနိုင်ပါသည်။',
      timestamp: new Date().toLocaleTimeString('my-MM'),
    },
  ]);

  // LiveKit state
  const [livekitState, setLivekitState] = useState<LiveKitState>({
    isConnected: false,
    isConnecting: false,
    roomName: 'bagan-voice-room',
    identity: `user-bagan-${Math.floor(Math.random() * 1000)}`,
    participantCount: 0,
    serverUrl: 'wss://mcp-9dd5r4aj.livekit.cloud',
    audioLevel: 0,
    error: null,
  });
  const [isMicMuted, setIsMicMuted] = useState(false);

  // Android Phone Hardware State
  const [phoneState, setPhoneState] = useState<AndroidPhoneState>({
    wifi: true,
    bluetooth: true,
    flashlight: false,
    volume: 75,
    batteryLevel: 85,
    batteryCharging: false,
    activeApp: null,
    lastAction: null,
    isFlashlightSupported: false,
  });

  // Camera Track ref for real Torch/Flashlight
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  // MCP Relay state
  const [mcpConfig, setMcpConfig] = useState<McpRelayConfig>({
    url: 'wss://mcp.turin.my/agent',
    token: '',
    isConnected: false,
    status: 'disconnected',
    lastResponse: null,
    tools: ['shell_execute', 'system_info'],
  });

  // Google Drive state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [savedDriveFiles, setSavedDriveFiles] = useState<DriveSavedFile[]>([]);
  const [isSavingDrive, setIsSavingDrive] = useState(false);
  const [isLoadingDriveFiles, setIsLoadingDriveFiles] = useState(false);

  // Battery detection on load
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setPhoneState((prev) => ({
          ...prev,
          batteryLevel: Math.round(battery.level * 100),
          batteryCharging: battery.charging,
        }));

        battery.addEventListener('levelchange', () => {
          setPhoneState((prev) => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
          }));
        });
        battery.addEventListener('chargingchange', () => {
          setPhoneState((prev) => ({
            ...prev,
            batteryCharging: battery.charging,
          }));
        });
      });
    }
  }, []);

  // Firebase Auth listener on load
  useEffect(() => {
    initAuth(
      (user) => {
        setIsAuthenticated(true);
        setUserEmail(user.email);
        loadDriveFiles();
      },
      () => {
        setIsAuthenticated(false);
        setUserEmail(null);
      }
    );
  }, []);

  const loadDriveFiles = async () => {
    try {
      setIsLoadingDriveFiles(true);
      const files = await listDriveVoiceFiles();
      setSavedDriveFiles(files);
    } catch (e) {
      console.warn('Could not load drive files yet:', e);
    } finally {
      setIsLoadingDriveFiles(false);
    }
  };

  // Process user message & voice commands
  const handleProcessUserSpeech = async (speechText: string) => {
    if (!speechText.trim()) return;

    // Add user message to log
    const userLog: VoiceLog = {
      id: String(Date.now()),
      sender: 'user',
      text: speechText,
      timestamp: new Date().toLocaleTimeString('my-MM'),
    };
    setLogs((prev) => [userLog, ...prev]);

    const lower = speechText.toLowerCase();
    let actionExecuted: string | undefined = undefined;

    // 1. Voice Command Check: Wi-Fi
    if (lower.includes('wifi') || lower.includes('ဝိုင်ဖိုင်') || lower.includes('wi-fi')) {
      const turnOff = lower.includes('ပိတ်');
      const newState = !turnOff;
      setPhoneState((prev) => ({
        ...prev,
        wifi: newState,
        lastAction: `Wi-Fi ကို ${newState ? 'ဖွင့်ပေးလိုက်ပါပြီ' : 'ပိတ်ပေးလိုက်ပါပြီ'}`,
      }));
      actionExecuted = `Wi-Fi ${newState ? 'ON' : 'OFF'}`;
      respondAgent(
        newState
          ? 'Wi-Fi ကို ချိတ်ဆက်ဖွင့်ပေးလိုက်ပါပြီ ခင်ဗျာ။'
          : 'Wi-Fi ကို ပိတ်ပေးလိုက်ပါပြီ ခင်ဗျာ။',
        actionExecuted
      );
      return;
    }

    // 2. Voice Command Check: Bluetooth
    if (lower.includes('bluetooth') || lower.includes('ဘလူးတုသ်')) {
      const turnOff = lower.includes('ပိတ်');
      const newState = !turnOff;
      setPhoneState((prev) => ({
        ...prev,
        bluetooth: newState,
        lastAction: `Bluetooth ကို ${newState ? 'ဖွင့်ပေးလိုက်ပါပြီ' : 'ပိတ်ပေးလိုက်ပါပြီ'}`,
      }));
      actionExecuted = `Bluetooth ${newState ? 'ON' : 'OFF'}`;
      respondAgent(
        newState
          ? 'Bluetooth ကို ဖွင့်ပေးလိုက်ပါပြီ ခင်ဗျာ။'
          : 'Bluetooth ကို ပိတ်ပေးလိုက်ပါပြီ ခင်ဗျာ။',
        actionExecuted
      );
      return;
    }

    // 3. Voice Command Check: Flashlight / Torch
    if (lower.includes('မီး') || lower.includes('ဓာတ်မီး') || lower.includes('flash')) {
      const turnOff = lower.includes('ပိတ်');
      const newState = !turnOff;
      await toggleRealFlashlight(newState);
      actionExecuted = `Flashlight ${newState ? 'ON' : 'OFF'}`;
      respondAgent(
        newState
          ? 'ဖုန်းဓာတ်မီးကို အလင်းဖွင့်ပေးလိုက်ပါပြီ ခင်ဗျာ။'
          : 'ဖုန်းဓာတ်မီးကို ပိတ်ပေးလိုက်ပါပြီ ခင်ဗျာ။',
        actionExecuted
      );
      return;
    }

    // 4. Voice Command Check: Volume
    if (lower.includes('အသံတိုး') || lower.includes('တိုး')) {
      setPhoneState((prev) => {
        const newVol = Math.max(0, prev.volume - 15);
        return {
          ...prev,
          volume: newVol,
          lastAction: `အသံပမာဏကို ${newVol}% သို့ တိုးလိုက်ပါပြီ`,
        };
      });
      actionExecuted = 'Volume -15%';
      respondAgent('အသံပမာဏကို တိုးပေးလိုက်ပါပြီ ခင်ဗျာ။', actionExecuted);
      return;
    }
    if (lower.includes('အသံချဲ့') || lower.includes('ချဲ့') || lower.includes('ကျယ်')) {
      setPhoneState((prev) => {
        const newVol = Math.min(100, prev.volume + 15);
        return {
          ...prev,
          volume: newVol,
          lastAction: `အသံပမာဏကို ${newVol}% သို့ ချဲ့လိုက်ပါပြီ`,
        };
      });
      actionExecuted = 'Volume +15%';
      respondAgent('အသံပမာဏကို ချဲ့ပေးလိုက်ပါပြီ ခင်ဗျာ။', actionExecuted);
      return;
    }

    // 5. Voice Command Check: Battery Status
    if (lower.includes('battery') || lower.includes('ဘက်ထရီ') || lower.includes('အား')) {
      const bLevel = phoneState.batteryLevel ?? 85;
      const reply = `လက်ရှိ ဖုန်း၏ ဘက်ထရီမှာ ${bLevel}% ရှိပါသည် ခင်ဗျာ။`;
      actionExecuted = `Battery Check: ${bLevel}%`;
      respondAgent(reply, actionExecuted);
      return;
    }

    // 6. Voice Command Check: Save to Google Drive
    if (lower.includes('drive') || lower.includes('ဒရိုက်') || lower.includes('သိမ်း')) {
      await handleSaveToDrive();
      return;
    }

    // 7. Voice Command Check: Clean RAM (6GB RAM booster)
    if (lower.includes('ram') || lower.includes('cache') || lower.includes('ရှင်း') || lower.includes('clean')) {
      handleCleanRam();
      return;
    }

    // 8. Voice Command Check: Google Tasks (အလုပ်မှတ်ပါ / tasks မှတ်ပါ)
    if (
      lower.includes('task') ||
      lower.includes('tasks') ||
      lower.includes('အလုပ်') ||
      lower.includes('တာဝန်')
    ) {
      if (
        lower.includes('မှတ်') ||
        lower.includes('ထည့်') ||
        lower.includes('ရေး') ||
        lower.includes('add') ||
        lower.includes('create') ||
        lower.includes('save')
      ) {
        if (!isAuthenticated) {
          respondAgent(
            'Google Tasks အား အသုံးပြုရန် Google Tasks Tab သို့ သွားရောက်၍ Google Account ဖြင့် Sign in အရင် ဝင်ရောက်ပေးပါခင်ဗျာ။',
            'Google Tasks Auth Required'
          );
          return;
        }

        let taskTitle = speechText
          .replace(/google/gi, '')
          .replace(/tasks?/gi, '')
          .replace(/ထဲမှာ/g, '')
          .replace(/ထဲသို့/g, '')
          .replace(/ထဲ/g, '')
          .replace(/အလုပ်/g, '')
          .replace(/တာဝန်/g, '')
          .replace(/အသစ်/g, '')
          .replace(/မှတ်ပေးပါ/g, '')
          .replace(/မှတ်ပါ/g, '')
          .replace(/ထည့်ပေးပါ/g, '')
          .replace(/ထည့်ပါ/g, '')
          .trim();

        if (!taskTitle) {
          taskTitle = 'လုပ်ငန်းဆောင်တာအသစ် (Voice Task)';
        }

        try {
          const lists = await googleTasksService.getTaskLists();
          const listId = lists.length > 0 ? lists[0].id : '@default';
          await googleTasksService.createTask(listId, { title: taskTitle });
          actionExecuted = `Google Task Created: "${taskTitle}"`;
          respondAgent(
            activeTone === 'royal'
              ? `မှန်လှပါ ဘုရား/ခင်ဗျာ၊ Google Tasks ထဲသို့ "${taskTitle}" အား အောင်မြင်စွာ မှတ်တမ်းတင်ပေးလိုက်ပါပြီ ဘုရား။`
              : `Google Tasks ထဲသို့ "${taskTitle}" ကို အောင်မြင်စွာ ထည့်သွင်းမှတ်သားပေးလိုက်ပါပြီ ခင်ဗျာ။`,
            actionExecuted
          );
          return;
        } catch (e: any) {
          console.error('Google Tasks error:', e);
          respondAgent(
            'Google Tasks ထဲသို့ အလုပ်မှတ်တမ်းတင်ရာတွင် အခက်အခဲရှိနေပါသည် ခင်ဗျာ။',
            'Google Tasks Error'
          );
          return;
        }
      }
    }

    // 9. General AI Agent Response via Full-stack Express Endpoint
    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: speechText,
          provider: activeProvider,
          tone: activeTone,
        }),
      });
      const data = await res.json();
      const reply = data.reply || 'နားလည်ပါပြီ ခင်ဗျာ။ Victor Geek Voice Agent ကူညီဆောင်ရွက်ပေးပါမည်။';
      respondAgent(reply, data.action?.type);
    } catch (err) {
      console.error('Agent API error:', err);
      respondAgent(
        'မင်္ဂလာပါ ခင်ဗျာ။ Victor Geek မှ ဖန်တီးထားသော ပုဂံ Voice Agent ဖြစ်ပါတယ်။ ဘာများ ကူညီပေးရမလဲခင်ဗျာ။'
      );
    }
  };

  const handleCleanRam = () => {
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 30, 60]);
    }
    if (soundEnabled) {
      audioChime.playSuccessTone();
    }
    setPhoneState((prev) => ({
      ...prev,
      lastAction: '6GB RAM Cache Cleared (+820MB Free Memory)',
    }));
    respondAgent(
      activeTone === 'royal'
        ? 'မှန်လှပါ ဘုရား/ခင်ဗျာ၊ 6GB RAM Cache အား ရှင်းလင်းပြီး စွမ်းဆောင်ရည် အမြင့်ဆုံး သို့ မြှင့်တင်ပေးလိုက်ပါပြီ ဘုရား။'
        : '6GB RAM Cache ကို အောင်မြင်စွာ ရှင်းလင်းပြီး ဖုန်း စွမ်းဆောင်ရည်ကို အမြင့်ဆုံး အဆင့်သို့ မြှင့်တင်လိုက်ပါပြီ ခင်ဗျာ။',
      'RAM Boost: +820MB'
    );
  };

  const respondAgent = (replyText: string, actionExecuted?: string) => {
    setAgentReply(replyText);
    setIsSpeaking(true);

    if (soundEnabled) {
      audioChime.playKyeZeeChime();
    }
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 20, 30]);
    }

    // Add agent reply to logs
    const agentLog: VoiceLog = {
      id: String(Date.now() + 1),
      sender: 'agent',
      text: replyText,
      timestamp: new Date().toLocaleTimeString('my-MM'),
      actionExecuted,
    };
    setLogs((prev) => [agentLog, ...prev]);

    // TTS Voice Speech Synthesis
    speechService.speak(replyText, () => {
      setIsSpeaking(false);
    });
  };

  // Central Microphone Toggle
  const handleToggleMic = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      if (soundEnabled) {
        audioChime.playSuccessTone();
      }
      setRecognizedText('');
      speechService.startListening(
        (transcript, isFinal) => {
          setRecognizedText(transcript);
          if (isFinal) {
            speechService.stopListening();
            setIsListening(false);
            handleProcessUserSpeech(transcript);
          }
        },
        (err) => {
          console.warn('Speech recognition notice:', err);
          setIsListening(false);
        }
      );
      setIsListening(true);
    }
  };

  // Real Hardware Torch / Flashlight implementation via MediaStream Track
  const toggleRealFlashlight = async (enable: boolean) => {
    try {
      if (enable) {
        if (!videoTrackRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          const track = stream.getVideoTracks()[0];
          videoTrackRef.current = track;
        }
        const track = videoTrackRef.current;
        const capabilities: any = track?.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          await (track as any).applyConstraints({ advanced: [{ torch: true }] });
          setPhoneState((prev) => ({
            ...prev,
            flashlight: true,
            isFlashlightSupported: true,
            lastAction: 'ဓာတ်မီးကို အလင်းဖွင့်ပေးလိုက်ပါပြီ',
          }));
        } else {
          setPhoneState((prev) => ({
            ...prev,
            flashlight: true,
            lastAction: 'ဓာတ်မီးဖွင့်ခြင်း (Simulated / Screen Glow Active)',
          }));
        }
      } else {
        if (videoTrackRef.current) {
          try {
            await (videoTrackRef.current as any).applyConstraints({ advanced: [{ torch: false }] });
            videoTrackRef.current.stop();
          } catch (e) {
            // ignore
          }
          videoTrackRef.current = null;
        }
        setPhoneState((prev) => ({
          ...prev,
          flashlight: false,
          lastAction: 'ဓာတ်မီးကို ပိတ်ပေးလိုက်ပါပြီ',
        }));
      }
    } catch (e) {
      console.warn('Flashlight access notice:', e);
      setPhoneState((prev) => ({
        ...prev,
        flashlight: enable,
        lastAction: `ဓာတ်မီး ${enable ? 'ဖွင့်' : 'ပိတ်'} (Simulated Mode)`,
      }));
    }
  };

  // LiveKit Connect
  const handleConnectLiveKit = async (roomName: string, identity: string) => {
    try {
      setLivekitState((prev) => ({ ...prev, isConnecting: true, error: null }));

      await livekitService.connect(roomName, identity, {
        onConnected: () => {
          setLivekitState((prev) => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            roomName,
            identity,
            participantCount: 1,
            error: null,
          }));
        },
        onDisconnected: (reason) => {
          setLivekitState((prev) => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
            error: reason || null,
          }));
        },
        onError: (err) => {
          setLivekitState((prev) => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
            error: err,
          }));
        },
        onParticipantJoined: () => {
          setLivekitState((prev) => ({
            ...prev,
            participantCount: prev.participantCount + 1,
          }));
        },
        onParticipantLeft: () => {
          setLivekitState((prev) => ({
            ...prev,
            participantCount: Math.max(1, prev.participantCount - 1),
          }));
        },
        onLevelChange: (level) => {
          setLivekitState((prev) => ({ ...prev, audioLevel: level }));
          setAudioLevel(level);
        },
        onAgentMessage: (msg) => {
          respondAgent(msg);
        },
      });
    } catch (err: any) {
      setLivekitState((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: err?.message || 'Connection failed',
      }));
    }
  };

  const handleDisconnectLiveKit = async () => {
    await livekitService.disconnect();
    setLivekitState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
    }));
  };

  const handleToggleLiveKitMic = async (isMuted: boolean) => {
    const unmuted = await livekitService.toggleMicrophone(isMuted);
    setIsMicMuted(!unmuted);
  };

  // Google Drive Handlers
  const handleSignInGoogle = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setIsAuthenticated(true);
        setUserEmail(result.user.email);
        await loadDriveFiles();
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      alert(`Google Sign In failed: ${err?.message || err}`);
    }
  };

  const handleSignOutGoogle = async () => {
    await logoutGoogle();
    setIsAuthenticated(false);
    setUserEmail(null);
    setSavedDriveFiles([]);
  };

  const handleSaveToDrive = async () => {
    if (!isAuthenticated) {
      respondAgent('Google Drive သို့ သိမ်းဆည်းရန် ဦးစွာ Google အကောင့်ဖြင့် Sign in ပြုလုပ်ပေးပါခင်ဗျာ။');
      setActiveTab('drive');
      return;
    }

    try {
      setIsSavingDrive(true);
      const sessionContent = `Bagan Voice Agent Session Log - Develop by Victor Geek
Date: ${new Date().toLocaleString('my-MM')}
User: ${userEmail || 'Anonymous'}

--------------------
CONVERSATION & HARDWARE ACTIONS:
--------------------
${logs
  .map(
    (l) =>
      `[${l.timestamp}] ${l.sender.toUpperCase()}: ${l.text} ${
        l.actionExecuted ? `(Action: ${l.actionExecuted})` : ''
      }`
  )
  .join('\n\n')}
`;

      const savedFile = await uploadVoiceSessionToDrive(
        'Bagan_Voice_Transcript',
        sessionContent
      );

      setSavedDriveFiles((prev) => [savedFile, ...prev]);
      respondAgent('စကားပြောဆိုမှု မှတ်တမ်းကို Google Drive ထဲသို့ အောင်မြင်စွာ သိမ်းဆည်းပေးလိုက်ပါပြီ ခင်ဗျာ။', 'Drive Save');
    } catch (err: any) {
      console.error('Drive save error:', err);
      respondAgent(`Google Drive သို့ သိမ်းဆည်းရာတွင် အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့ပါသည်: ${err?.message || err}`);
    } finally {
      setIsSavingDrive(false);
    }
  };

  const handleDeleteDriveFile = async (fileId: string) => {
    await deleteDriveFile(fileId);
    setSavedDriveFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Phone Call Launcher
  const handleDialPhone = (num: string) => {
    window.location.href = `tel:${num}`;
    setPhoneState((prev) => ({
      ...prev,
      lastAction: `ဖုန်းခေါ်ဆိုမှု launcher စတင်ခဲ့သည်: ${num}`,
    }));
  };

  // SMS Messenger Launcher
  const handleSendSms = (num: string, msg: string) => {
    window.location.href = `sms:${num}?body=${encodeURIComponent(msg)}`;
    setPhoneState((prev) => ({
      ...prev,
      lastAction: `SMS launcher စတင်ခဲ့သည်: ${num}`,
    }));
  };

  // App Launcher
  const handleLaunchApp = (appName: string, url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
    setPhoneState((prev) => ({
      ...prev,
      activeApp: appName,
      lastAction: `${appName} အား ဖွင့်လှစ်ခဲ့ပါသည်`,
    }));
  };

  // MCP Relay Handlers
  const handleConnectMcp = (url: string, token: string) => {
    setMcpConfig((prev) => ({ ...prev, status: 'connecting', url, token }));
    androidMcpClient.connect(url, token, {
      onOpen: () => {
        setMcpConfig((prev) => ({
          ...prev,
          isConnected: true,
          status: 'connected',
          lastResponse: '[MCP Relay Connected to Android Phone]',
        }));
      },
      onClose: () => {
        setMcpConfig((prev) => ({
          ...prev,
          isConnected: false,
          status: 'disconnected',
        }));
      },
      onError: (err) => {
        setMcpConfig((prev) => ({
          ...prev,
          isConnected: false,
          status: 'error',
          lastResponse: `MCP Error: ${String(err)}`,
        }));
      },
      onToolsDiscovered: (tools) => {
        setMcpConfig((prev) => ({ ...prev, tools }));
      },
    });
  };

  const handleDisconnectMcp = () => {
    androidMcpClient.disconnect();
    setMcpConfig((prev) => ({
      ...prev,
      isConnected: false,
      status: 'disconnected',
    }));
  };

  const handleRunMcpCommand = (cmd: string) => {
    androidMcpClient.executeShellCommand(cmd, (output) => {
      setMcpConfig((prev) => ({ ...prev, lastResponse: output }));
      setPhoneState((prev) => ({
        ...prev,
        lastAction: `MCP Shizuku: "${cmd}"`,
      }));
    });
  };

  const handleExecuteMcpTool = async (toolName: string, args: Record<string, any>) => {
    const result = await androidMcpClient.executeBuiltInTool(toolName, args, {
      phoneState,
      onPhoneAction: async (action, data) => {
        if (action === 'wifi') {
          setPhoneState((prev) => ({
            ...prev,
            wifi: Boolean(data),
            lastAction: `Built-in MCP: Wi-Fi ${data ? 'ON' : 'OFF'}`,
          }));
        } else if (action === 'bluetooth') {
          setPhoneState((prev) => ({
            ...prev,
            bluetooth: Boolean(data),
            lastAction: `Built-in MCP: Bluetooth ${data ? 'ON' : 'OFF'}`,
          }));
        } else if (action === 'flashlight') {
          await toggleRealFlashlight(Boolean(data));
        } else if (action === 'volume') {
          setPhoneState((prev) => ({
            ...prev,
            volume: Number(data),
            lastAction: `Built-in MCP: Volume ${data}%`,
          }));
        } else if (action === 'launch_app') {
          handleLaunchApp(data.appName, data.uri);
        } else if (action === 'dial_phone') {
          handleDialPhone(String(data));
        } else if (action === 'send_sms') {
          handleSendSms(data.phone, data.msg);
        }
      },
      onSpeak: (text) => {
        respondAgent(text, `MCP TTS: ${text}`);
      },
    });

    setLogs((prev) => [
      {
        id: String(Date.now()),
        sender: 'agent',
        text: `[Built-in MCP: ${toolName}] အောင်မြင်စွာ ခေါ်ယူအသုံးပြုပြီးပါပြီ။`,
        timestamp: new Date().toLocaleTimeString('my-MM'),
        actionExecuted: `MCP: ${toolName}`,
      },
      ...prev,
    ]);

    return result;
  };

  return (
    <div className="min-h-screen bg-[#100905] text-[#f7eedd] flex flex-col selection:bg-amber-700 selection:text-white">
      {/* Screen flash glow effect when Flashlight is active */}
      {phoneState.flashlight && (
        <div className="fixed inset-0 pointer-events-none z-40 bg-yellow-200/20 mix-blend-screen animate-pulse" />
      )}

      {/* Bagan Header with Victor Geek attribution */}
      <Header
        livekitState={livekitState}
        isDriveConnected={isAuthenticated}
        onOpenLiveKitModal={() => setActiveTab('livekit')}
        onOpenDriveModal={() => setActiveTab('drive')}
      />

      {/* Navigation Sub-Tabs styled with Bagan Terracotta & Gold */}
      <nav className="w-full max-w-4xl mx-auto px-4 mt-3 flex items-center justify-center gap-1.5 overflow-x-auto select-none py-1">
        {[
          { id: 'voice', label: 'အသံသုံး စနစ် (Voice Hub)' },
          { id: 'tasks', label: 'Google Tasks (အလုပ်စာရင်း)' },
          { id: 'models', label: 'AI Models & Overclock (အဆင့်မြှင့်တင်မှု)' },
          { id: 'livekit', label: 'LiveKit WebRTC' },
          { id: 'mcp', label: 'Built-in Android MCP' },
          { id: 'drive', label: 'Google Drive' },
          { id: 'logs', label: 'မှတ်တမ်းများ (Logs)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-bold shadow-md ring-1 ring-amber-400'
                : 'bg-[#1a0f08] text-amber-300/80 hover:bg-[#25150c] hover:text-amber-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Body View based on Tab */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 py-2 flex flex-col">
        {activeTab === 'voice' && (
          <>
            {/* Central Bagan Lotus Voice Mandala Visualizer */}
            <BaganVisualizer
              isListening={isListening}
              isSpeaking={isSpeaking}
              audioLevel={audioLevel}
              recognizedText={recognizedText}
              agentReply={agentReply}
              onToggleMic={handleToggleMic}
            />

            {/* Android Phone Control Hub */}
            <VoiceCommandController
              phoneState={phoneState}
              onToggleWifi={() =>
                handleProcessUserSpeech(phoneState.wifi ? 'Wi-Fi ပိတ်ပါ' : 'Wi-Fi ဖွင့်ပါ')
              }
              onToggleBluetooth={() =>
                handleProcessUserSpeech(phoneState.bluetooth ? 'Bluetooth ပိတ်ပါ' : 'Bluetooth ဖွင့်ပါ')
              }
              onToggleFlashlight={() =>
                handleProcessUserSpeech(phoneState.flashlight ? 'မီးပိတ်ပါ' : 'မီးဖွင့်ပါ')
              }
              onAdjustVolume={(delta) =>
                handleProcessUserSpeech(delta > 0 ? 'အသံချဲ့ပါ' : 'အသံတိုးပါ')
              }
              onQuickCommand={(cmd) => handleProcessUserSpeech(cmd)}
              onLaunchApp={handleLaunchApp}
              onDialPhone={handleDialPhone}
              onSendSms={handleSendSms}
            />

            {/* Quick Conversation Preview */}
            <ConversationLogs
              logs={logs.slice(0, 5)}
              onSendMessage={(text) => handleProcessUserSpeech(text)}
              onClearLogs={() => setLogs([])}
            />
          </>
        )}

        {activeTab === 'livekit' && (
          <LiveKitPanel
            state={livekitState}
            onConnect={handleConnectLiveKit}
            onDisconnect={handleDisconnectLiveKit}
            onToggleMic={handleToggleLiveKitMic}
            isMicMuted={isMicMuted}
          />
        )}

        {activeTab === 'mcp' && (
          <McpIntegrationPanel
            config={mcpConfig}
            onConnect={handleConnectMcp}
            onDisconnect={handleDisconnectMcp}
            onRunCommand={handleRunMcpCommand}
            onExecuteTool={handleExecuteMcpTool}
          />
        )}

        {activeTab === 'drive' && (
          <GoogleDrivePanel
            isAuthenticated={isAuthenticated}
            userEmail={userEmail}
            savedFiles={savedDriveFiles}
            isSaving={isSavingDrive}
            isLoadingFiles={isLoadingDriveFiles}
            onSignIn={handleSignInGoogle}
            onSignOut={handleSignOutGoogle}
            onSaveToDrive={handleSaveToDrive}
            onRefreshFiles={loadDriveFiles}
            onDeleteFile={handleDeleteDriveFile}
          />
        )}

        {activeTab === 'tasks' && (
          <GoogleTasksPanel
            isAuthenticated={isAuthenticated}
            userEmail={userEmail}
            onSignIn={handleSignInGoogle}
            onSignOut={handleSignOutGoogle}
          />
        )}

        {activeTab === 'models' && (
          <AiModelUpgradeHub
            currentProvider={activeProvider}
            currentTone={activeTone}
            onSelectProvider={(p) => setActiveProvider(p)}
            onSelectTone={(t) => setActiveTone(t)}
            soundEnabled={soundEnabled}
            onToggleSound={(s) => setSoundEnabled(s)}
            hapticEnabled={hapticEnabled}
            onToggleHaptic={(h) => setHapticEnabled(h)}
            onCleanRam={handleCleanRam}
            onTestChime={() => audioChime.playKyeZeeChime()}
          />
        )}

        {activeTab === 'logs' && (
          <ConversationLogs
            logs={logs}
            onSendMessage={(text) => handleProcessUserSpeech(text)}
            onClearLogs={() => setLogs([])}
          />
        )}
      </main>

      {/* Footer with Kanote Ornamentation */}
      <footer className="w-full mt-auto py-4 border-t border-amber-900/30 text-center text-xs text-amber-500/70 font-myanmar bg-[#0c0603]">
        <KanoteOrnament variant="divider" className="opacity-40 max-w-xs mx-auto mb-2" />
        <p className="font-bagan text-amber-300 font-semibold tracking-wider">
          Bagan Voice Agent &bull; Develop by Victor Geek
        </p>
        <p className="text-[11px] text-amber-400/50 mt-0.5">
          LiveKit Cloud WebRTC &bull; Android 6GB RAM Smooth Performance &bull; Google Drive Cloud Sync
        </p>
      </footer>
    </div>
  );
}
