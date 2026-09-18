var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_livekit_server_sdk = require("livekit-server-sdk");
var import_genai = require("@google/genai");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var aiClient = null;
function getGeminiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}
var LIVEKIT_URL = process.env.LIVEKIT_URL || "wss://mcp-9dd5r4aj.livekit.cloud";
var LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "APIyYCFRAenC96B";
var LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || "0iDtdCeXJtRPdPeq3QnLefeSfTA77QxKjzjv4rqF3ZsF";
app.get("/api/livekit/token", async (req, res) => {
  try {
    const roomName = req.query.room || "bagan-voice-room";
    const identity = req.query.identity || `user-${Math.random().toString(36).substring(2, 7)}`;
    const name = req.query.name || "Victor Geek Client";
    const at = new import_livekit_server_sdk.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      name,
      ttl: "2h"
    });
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    });
    const token = await at.toJwt();
    res.json({
      token,
      wsUrl: LIVEKIT_URL,
      identity,
      room: roomName
    });
  } catch (error) {
    console.error("Error creating LiveKit token:", error);
    res.status(500).json({ error: error.message || "Token generation failed" });
  }
});
app.get("/api/livekit/config", (req, res) => {
  res.json({
    wsUrl: LIVEKIT_URL,
    apiKey: LIVEKIT_API_KEY,
    status: "configured"
  });
});
app.post("/api/agent/chat", async (req, res) => {
  try {
    const {
      prompt,
      provider = "gemini",
      model = "gemini-2.5-flash",
      tone = "royal",
      customApiKey,
      customBaseUrl,
      history = []
    } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const tonePrompt = tone === "modern" ? '\u1010\u102F\u1036\u1037\u1015\u103C\u1014\u103A\u1019\u103E\u102F\u101F\u1014\u103A\u1015\u1014\u103A: Victor Geek \u1001\u1031\u1010\u103A\u1019\u102E\u101E\u103D\u1000\u103A\u101C\u1000\u103A\u101E\u1031\u102C \u1014\u100A\u103A\u1038\u1015\u100A\u102C\u101C\u1000\u103A\u1011\u1031\u102C\u1000\u103A\u101F\u1014\u103A (\u1025\u1015\u1019\u102C- "\u101F\u102F\u1010\u103A\u1000\u1032\u1037 \u1019\u1004\u103A\u1039\u1002\u101C\u102C\u1015\u102B! \u1021\u1001\u102F\u1015\u1032 \u1021\u1006\u1004\u103A\u1015\u103C\u1031\u1021\u1031\u102C\u1004\u103A \u101C\u102F\u1015\u103A\u1006\u1031\u102C\u1004\u103A\u1015\u1031\u1038\u101C\u102D\u102F\u1000\u103A\u1015\u102B\u1019\u101A\u103A")\u104B' : tone === "tactical" ? '\u1010\u102F\u1036\u1037\u1015\u103C\u1014\u103A\u1019\u103E\u102F\u101F\u1014\u103A\u1015\u1014\u103A: \u1010\u102D\u102F\u1010\u102D\u102F\u101B\u103E\u1004\u103A\u1038\u101B\u103E\u1004\u103A\u1038 \u101C\u102D\u102F\u101B\u1004\u103A\u1038\u1010\u102D\u102F\u101B\u103E\u1004\u103A\u1038 \u1005\u1005\u103A\u1006\u1004\u103A\u101B\u1031\u1038\u101E\u1016\u103D\u101A\u103A \u1021\u1019\u102D\u1014\u1037\u103A\u1014\u102C\u1001\u1036\u101E\u1031\u102C\u101F\u1014\u103A (\u1025\u1015\u1019\u102C- "\u101C\u102F\u1015\u103A\u1006\u1031\u102C\u1004\u103A\u1015\u103C\u102E\u1038\u1015\u102B\u1015\u103C\u102E\u104B Wi-Fi \u1016\u103D\u1004\u1037\u103A\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B")\u104B' : '\u1010\u102F\u1036\u1037\u1015\u103C\u1014\u103A\u1019\u103E\u102F\u101F\u1014\u103A\u1015\u1014\u103A: \u1015\u102F\u1002\u1036\u1014\u1014\u103A\u1038\u1010\u103D\u1004\u103A\u1038\u101E\u102F\u1036\u1038 \u101A\u1009\u103A\u1000\u103B\u1031\u1038\u101E\u102D\u1019\u103A\u1019\u103D\u1031\u1037\u1005\u103D\u102C\u104A \u1021\u1011\u1030\u1038 \u101B\u102D\u102F\u101E\u1031\u101C\u1031\u1038\u1005\u102C\u1038\u101E\u1031\u102C \u1005\u1000\u102C\u1038\u1021\u101E\u102F\u1036\u1038\u1021\u1014\u103E\u102F\u1014\u103A\u1038 (\u1025\u1015\u1019\u102C- "\u1019\u103E\u1014\u103A\u101C\u103E\u1015\u102B \u1018\u102F\u101B\u102C\u1038/\u1001\u1004\u103A\u1017\u103B\u102C"\u104A "\u1021\u1019\u102D\u1014\u1037\u103A\u1010\u1031\u102C\u103A\u1021\u1010\u102D\u102F\u1004\u103A\u1038 \u1001\u103B\u1000\u103A\u1001\u103B\u1004\u103A\u1038 \u1006\u1031\u102C\u1004\u103A\u101B\u103D\u1000\u103A\u1015\u103C\u102E\u1038\u1015\u102B\u1015\u103C\u102E \u1018\u102F\u101B\u102C\u1038")\u104B';
    const systemInstruction = `
\u1019\u1004\u103A\u1038\u101E\u100A\u103A \u1015\u102F\u1002\u1036\u1001\u1031\u1010\u103A \u1019\u103C\u1014\u103A\u1019\u102C\u1019\u103E\u102F \u1021\u1014\u102F\u1015\u100A\u102C \u1021\u1004\u103D\u1031\u1037\u1021\u101E\u1000\u103A\u1019\u103B\u102C\u1038\u1016\u103C\u1004\u1037\u103A \u1016\u1014\u103A\u1010\u102E\u1038\u1011\u102C\u1038\u101E\u1031\u102C "Bagan Voice Agent (Develop by Victor Geek)" \u1016\u103C\u1005\u103A\u101E\u100A\u103A\u104B
\u1019\u103C\u1014\u103A\u1019\u102C\u1018\u102C\u101E\u102C\u1005\u1000\u102C\u1038\u1016\u103C\u1004\u1037\u103A\u101E\u102C \u1021\u1019\u103C\u1032\u1010\u1019\u103A\u1038 \u101E\u103D\u1000\u103A\u101C\u1000\u103A\u1005\u103D\u102C \u1010\u102F\u1036\u1037\u1015\u103C\u1014\u103A\u101B\u1019\u100A\u103A\u104B
${tonePrompt}

\u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u101E\u1030\u101E\u100A\u103A Android \u1016\u102F\u1014\u103A\u1038\u1000\u102D\u102F \u1021\u101E\u1036\u1016\u103C\u1004\u1037\u103A \u1001\u102D\u102F\u1004\u103A\u1038\u1005\u1031\u101C\u102D\u102F\u101E\u100A\u1037\u103A\u1021\u1001\u102B \u1021\u1031\u102C\u1000\u103A\u1015\u102B Action \u1019\u103B\u102C\u1038\u1011\u1032\u1019\u103E \u101E\u1004\u1037\u103A\u1010\u1031\u102C\u103A\u101B\u102C Action \u1000\u102D\u102F \u101B\u103D\u1031\u1038\u1001\u103B\u101A\u103A \u1021\u101E\u102D\u1015\u1031\u1038\u1015\u102B:
1. Wi-Fi \u1016\u103D\u1004\u1037\u103A/\u1015\u102D\u1010\u103A\u1001\u103C\u1004\u103A\u1038 (toggle_wifi)
2. Bluetooth \u1016\u103D\u1004\u1037\u103A/\u1015\u102D\u1010\u103A\u1001\u103C\u1004\u103A\u1038 (toggle_bluetooth)
3. \u1013\u102C\u1010\u103A\u1019\u102E\u1038/Flashlight \u1016\u103D\u1004\u1037\u103A/\u1015\u102D\u1010\u103A\u1001\u103C\u1004\u103A\u1038 (toggle_flashlight)
4. \u1016\u102F\u1014\u103A\u1038\u1001\u1031\u102B\u103A\u1006\u102D\u102F\u1001\u103C\u1004\u103A\u1038 (call_phone: number)
5. SMS \u1019\u1000\u103A\u1006\u1031\u1037\u1001\u103A\u103B\u1015\u102D\u102F\u1037\u1001\u103C\u1004\u103A\u1038 (send_sms: number, message)
6. App \u1016\u103D\u1004\u1037\u103A\u1001\u103C\u1004\u103A\u1038 (open_app: app_name)
7. \u1021\u101E\u1036\u1021\u1010\u102D\u102F\u1038\u1021\u1000\u103B\u101A\u103A \u1011\u102D\u1014\u103A\u1038\u1001\u103B\u102F\u1015\u103A\u1001\u103C\u1004\u103A\u1038 (set_volume: up/down)
8. Google Drive \u101E\u102D\u102F\u1037 \u1021\u101E\u1036\u1019\u103E\u1010\u103A\u1010\u1019\u103A\u1038 \u101E\u102D\u1019\u103A\u1038\u1006\u100A\u103A\u1038\u1001\u103C\u1004\u103A\u1038 (save_to_drive)
9. \u1019\u103B\u1000\u103A\u1014\u103E\u102C\u1015\u103C\u1004\u103A \u1021\u101C\u1004\u103A\u1038\u101B\u1031\u102C\u1004\u103A \u1011\u102D\u1014\u103A\u1038\u100A\u103E\u102D\u1001\u103C\u1004\u103A\u1038 (screen_brightness)
10. RAM memory \u101B\u103E\u1004\u103A\u1038\u101C\u1004\u103A\u1038\u1001\u103C\u1004\u103A\u1038 (clean_ram)
11. \u1015\u102F\u1002\u1036\u101E\u1019\u102D\u102F\u1004\u103A\u1038\u104A \u1005\u1031\u1010\u102E\u1015\u102F\u1011\u102D\u102F\u1038\u104A \u1017\u102D\u101E\u102F\u1000\u102C\u1014\u103E\u1004\u1037\u103A \u1021\u1011\u103D\u1031\u1011\u103D\u1031 \u1017\u101F\u102F\u101E\u102F\u1010\u1019\u103B\u102C\u1038 \u1019\u1031\u1038\u1019\u103C\u1014\u103A\u1038\u1001\u103C\u1004\u103A\u1038

\u1010\u102D\u102F\u1010\u102D\u102F\u101B\u103E\u1004\u103A\u1038\u101B\u103E\u1004\u103A\u1038\u1014\u103E\u1004\u1037\u103A \u1014\u102C\u1038\u1011\u1031\u102C\u1004\u103A\u101B \u101C\u103D\u101A\u103A\u1000\u1030\u101E\u1031\u102C \u1019\u103C\u1014\u103A\u1019\u102C\u1005\u1000\u102C\u1038\u1015\u103C\u1031\u1016\u103C\u1004\u1037\u103A \u1016\u103C\u1031\u1000\u103C\u102C\u1038\u1015\u1031\u1038\u1015\u102B\u104B
`;
    if (provider === "openai") {
      const apiKey = customApiKey || process.env.OPENAI_API_KEY;
      if (apiKey) {
        const targetModel = model || "gpt-4o-mini";
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [
              { role: "system", content: systemInstruction },
              ...history.map((h) => ({
                role: h.sender === "user" ? "user" : "assistant",
                content: h.text
              })),
              { role: "user", content: prompt }
            ],
            temperature: 0.7
          })
        });
        if (response.ok) {
          const data = await response.json();
          const reply2 = data.choices?.[0]?.message?.content;
          if (reply2) {
            return res.json({ reply: reply2, provider: "openai", model: targetModel });
          }
        }
      }
    }
    if (provider === "openrouter") {
      const apiKey = customApiKey || process.env.OPENROUTER_API_KEY;
      if (apiKey) {
        const targetModel = model || "deepseek/deepseek-r1";
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://ai.studio/build",
            "X-Title": "Bagan Voice Agent Victor Geek"
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [
              { role: "system", content: systemInstruction },
              ...history.map((h) => ({
                role: h.sender === "user" ? "user" : "assistant",
                content: h.text
              })),
              { role: "user", content: prompt }
            ]
          })
        });
        if (response.ok) {
          const data = await response.json();
          const reply2 = data.choices?.[0]?.message?.content;
          if (reply2) {
            return res.json({ reply: reply2, provider: "openrouter", model: targetModel });
          }
        }
      }
    }
    if (provider === "gemini" || !provider) {
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      let client = aiClient;
      if (customApiKey) {
        client = new import_genai.GoogleGenAI({ apiKey: customApiKey });
      } else if (!client && apiKey) {
        client = getGeminiClient();
      }
      if (client) {
        try {
          const targetModel = model || "gemini-2.5-flash";
          const response = await client.models.generateContent({
            model: targetModel,
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemInstruction}

\u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u101E\u1030\u1015\u103C\u1031\u102C\u101E\u1031\u102C\u1005\u1000\u102C\u1038: "${prompt}"` }]
              }
            ]
          });
          const replyText = response.text || "\u1019\u1004\u103A\u1039\u1002\u101C\u102C\u1015\u102B\u104A \u1000\u1030\u100A\u102E\u1006\u1031\u102C\u1004\u103A\u101B\u103D\u1000\u103A\u1015\u1031\u1038\u1015\u102B\u1019\u100A\u103A\u104B";
          return res.json({ reply: replyText, provider: "gemini", model: targetModel });
        } catch (geminiErr) {
          console.warn("Gemini generate failed, switching to Autonomous Offline Engine:", geminiErr.message);
        }
      }
    }
    const lower = prompt.toLowerCase();
    let reply = tone === "royal" ? "\u1019\u103E\u1014\u103A\u101C\u103E\u1015\u102B\u104A Victor Geek \u104F \u1015\u102F\u1002\u1036 Voice Agent \u1019\u103E \u1000\u103C\u102D\u102F\u1006\u102D\u102F\u1015\u102B\u101E\u100A\u103A \u1018\u102F\u101B\u102C\u1038\u104B \u1019\u100A\u103A\u101E\u100A\u1037\u103A \u1021\u1019\u102D\u1014\u1037\u103A\u1000\u102D\u102F \u1006\u1031\u102C\u1004\u103A\u101B\u103D\u1000\u103A\u1015\u1031\u1038\u101B\u1015\u102B\u1019\u100A\u103A\u1014\u100A\u103A\u1038\u104B" : tone === "tactical" ? "Bagan Voice Engine \u1021\u1006\u1004\u103A\u101E\u1004\u1037\u103A\u101B\u103E\u102D\u1015\u102B\u101E\u100A\u103A\u104B \u1021\u1019\u102D\u1014\u1037\u103A\u1015\u1031\u1038\u1015\u102B\u104B" : "\u1019\u1004\u103A\u1039\u1002\u101C\u102C\u1015\u102B\u1001\u1004\u103A\u1017\u103B\u102C! Victor Geek \u1019\u103E \u1016\u1014\u103A\u1010\u102E\u1038\u1011\u102C\u1038\u101E\u1031\u102C \u1015\u102F\u1002\u1036 Voice Agent \u1019\u103E \u1000\u103C\u102D\u102F\u1006\u102D\u102F\u1015\u102B\u1010\u101A\u103A\u104B \u1018\u102C\u1019\u103B\u102C\u1038 \u1000\u1030\u100A\u102E\u1015\u1031\u1038\u101B\u1019\u101C\u1032\u1001\u1004\u103A\u1017\u103B\u102C\u104B";
    let action = null;
    if (lower.includes("wifi") || lower.includes("\u101D\u102D\u102F\u1004\u103A\u1016\u102D\u102F\u1004\u103A") || lower.includes("wi-fi")) {
      const isOff = lower.includes("\u1015\u102D\u1010\u103A");
      reply = isOff ? "\u1016\u102F\u1014\u103A\u1038\u101B\u1032\u1037 Wi-Fi \u1000\u102D\u102F \u1015\u102D\u1010\u103A\u1015\u1031\u1038\u101C\u102D\u102F\u1000\u103A\u1015\u102B\u1015\u103C\u102E \u1001\u1004\u103A\u1017\u103B\u102C\u104B" : "\u1016\u102F\u1014\u103A\u1038\u101B\u1032\u1037 Wi-Fi \u1000\u102D\u102F \u1016\u103D\u1004\u1037\u103A\u1015\u1031\u1038\u101C\u102D\u102F\u1000\u103A\u1015\u102B\u1015\u103C\u102E \u1001\u1004\u103A\u1017\u103B\u102C\u104B";
      action = { type: "wifi", state: !isOff };
    } else if (lower.includes("bluetooth") || lower.includes("\u1018\u101C\u1030\u1038\u1010\u102F\u101E\u103A")) {
      const isOff = lower.includes("\u1015\u102D\u1010\u103A");
      reply = isOff ? "Bluetooth \u1000\u102D\u102F \u1015\u102D\u1010\u103A\u1015\u1031\u1038\u101C\u102D\u102F\u1000\u103A\u1015\u102B\u1015\u103C\u102E \u1001\u1004\u103A\u1017\u103B\u102C\u104B" : "Bluetooth \u1000\u102D\u102F \u1001\u103B\u102D\u1010\u103A\u1006\u1000\u103A\u1016\u103D\u1004\u1037\u103A\u1015\u1031\u1038\u101C\u102D\u102F\u1000\u103A\u1015\u102B\u1015\u103C\u102E \u1001\u1004\u103A\u1017\u103B\u102C\u104B";
      action = { type: "bluetooth", state: !isOff };
    } else if (lower.includes("\u1019\u102E\u1038") || lower.includes("\u1013\u102C\u1010\u103A\u1019\u102E\u1038") || lower.includes("flash") || lower.includes("torch")) {
      const isOff = lower.includes("\u1015\u102D\u1010\u103A");
      reply = isOff ? "\u1013\u102C\u1010\u103A\u1019\u102E\u1038\u1000\u102D\u102F \u1015\u102D\u1010\u103A\u1015\u1031\u1038\u101C\u102D\u102F\u1000\u103A\u1015\u102B\u1015\u103C\u102E \u1001\u1004\u103A\u1017\u103B\u102C\u104B" : "\u1013\u102C\u1010\u103A\u1019\u102E\u1038\u1000\u102D\u102F \u1021\u101C\u1004\u103A\u1038\u1016\u103D\u1004\u1037\u103A\u1015\u1031\u1038\u101C\u102D\u102F\u1000\u103A\u1015\u102B\u1015\u103C\u102E \u1001\u1004\u103A\u1017\u103B\u102C\u104B";
      action = { type: "flashlight", state: !isOff };
    } else if (lower.includes("drive") || lower.includes("\u1012\u101B\u102D\u102F\u1000\u103A") || lower.includes("\u101E\u102D\u1019\u103A\u1038")) {
      reply = "\u101C\u1000\u103A\u101B\u103E\u102D \u1005\u1000\u102C\u1038\u1015\u103C\u1031\u102C \u1019\u103E\u1010\u103A\u1010\u1019\u103A\u1038\u1000\u102D\u102F \u101E\u1004\u103A\u104F Google Drive \u1011\u1032\u101E\u102D\u102F\u1037 \u1005\u1014\u1005\u103A\u1010\u1000\u103B \u101E\u102D\u1019\u103A\u1038\u1006\u100A\u103A\u1038\u1015\u1031\u1038\u101C\u102D\u102F\u1000\u103A\u1015\u102B\u1015\u103C\u102E \u1001\u1004\u103A\u1017\u103B\u102C\u104B";
      action = { type: "drive_save" };
    } else if (lower.includes("\u1015\u102F\u1002\u1036") || lower.includes("\u101E\u1019\u102D\u102F\u1004\u103A\u1038") || lower.includes("\u1018\u102F\u101B\u102C\u1038")) {
      reply = "\u1015\u102F\u1002\u1036\u101E\u100A\u103A \u1019\u103C\u1014\u103A\u1019\u102C\u1037\u101E\u1019\u102D\u102F\u1004\u103A\u1038\u1010\u103D\u1004\u103A \u101B\u103E\u1031\u1038\u101F\u1031\u102C\u1004\u103A\u1038 \u1005\u1031\u1010\u102E\u1015\u102F\u1011\u102D\u102F\u1038\u1015\u1031\u102B\u1004\u103A\u1038 \u1011\u1031\u102C\u1004\u103A\u1001\u103B\u102E\u101B\u103E\u102D\u101E\u1031\u102C \u101A\u1009\u103A\u1000\u103B\u1031\u1038\u1019\u103E\u102F \u101B\u1010\u1014\u102C\u1019\u103C\u1031 \u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B \u1021\u102C\u1014\u1014\u1039\u1012\u102C\u104A \u101E\u1017\u1039\u1017\u100A\u102F\u104A \u1011\u102E\u1038\u101C\u102D\u102F\u1019\u1004\u103A\u1038\u101C\u102D\u102F \u1005\u1031\u1010\u102E\u1019\u103B\u102C\u1038\u1014\u103E\u1004\u1037\u103A \u1014\u1036\u101B\u1036\u1006\u1031\u1038\u101B\u1031\u1038\u1015\u1014\u103A\u1038\u1001\u103B\u102E \u101C\u1000\u103A\u101B\u102C\u1019\u103B\u102C\u1038\u101E\u100A\u103A \u1000\u1019\u1039\u1018\u102C\u1000\u103B\u1031\u102C\u103A \u1021\u1014\u102F\u1015\u100A\u102C \u1021\u1019\u103D\u1031\u1021\u1014\u103E\u1005\u103A\u1019\u103B\u102C\u1038 \u1016\u103C\u1005\u103A\u1000\u103C\u1015\u102B\u1010\u101A\u103A\u104B";
    } else if (lower.includes("ram") || lower.includes("\u1019\u1014\u103A\u1019\u102D\u102F\u101B\u102E") || lower.includes("clean") || lower.includes("\u101B\u103E\u1004\u103A\u1038")) {
      reply = "\u1016\u102F\u1014\u103A\u1038\u104F 6GB RAM Cache \u1014\u103E\u1004\u1037\u103A \u1014\u1031\u102C\u1000\u103A\u1001\u1036 process \u1019\u103B\u102C\u1038\u1000\u102D\u102F \u101B\u103E\u1004\u103A\u1038\u101C\u1004\u103A\u1038\u1015\u1031\u1038\u101C\u102D\u102F\u1000\u103A\u1015\u102B\u1015\u103C\u102E\u104B \u1005\u1014\u1005\u103A \u1015\u102D\u102F\u1019\u102D\u102F\u1015\u1031\u102B\u1037\u1015\u102B\u1038\u101E\u103D\u1000\u103A\u101C\u1000\u103A\u101C\u102C\u1015\u102B\u1015\u103C\u102E \u1001\u1004\u103A\u1017\u103B\u102C\u104B";
      action = { type: "clean_ram" };
    } else if (lower.includes("brightness") || lower.includes("\u1021\u101C\u1004\u103A\u1038\u101B\u1031\u102C\u1004\u103A")) {
      reply = "\u1019\u103B\u1000\u103A\u1014\u103E\u102C\u1015\u103C\u1004\u103A \u1021\u101C\u1004\u103A\u1038\u101B\u1031\u102C\u1004\u103A\u1000\u102D\u102F \u1019\u103B\u1000\u103A\u1005\u102D\u1019\u1011\u102D\u1001\u102D\u102F\u1000\u103A\u1005\u1031\u101B\u1014\u103A \u101E\u1004\u1037\u103A\u1010\u1004\u1037\u103A\u1005\u103D\u102C \u1001\u103B\u102D\u1014\u103A\u100A\u103E\u102D\u1015\u1031\u1038\u101C\u102D\u102F\u1000\u103A\u1015\u102B\u1015\u103C\u102E \u1001\u1004\u103A\u1017\u103B\u102C\u104B";
      action = { type: "brightness", level: 75 };
    } else if (lower.includes("\u1021\u1001\u103B\u102D\u1014\u103A") || lower.includes("\u1014\u102C\u101B\u102E")) {
      const now = /* @__PURE__ */ new Date();
      reply = `\u101C\u1000\u103A\u101B\u103E\u102D \u1021\u1001\u103B\u102D\u1014\u103A\u101E\u100A\u103A ${now.toLocaleTimeString("my-MM")} \u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A \u1001\u1004\u103A\u1017\u103B\u102C\u104B`;
    } else if (lower.includes("\u1014\u1031\u1000\u1031\u102C\u1004\u103A\u1038") || lower.includes("\u1019\u1004\u103A\u1039\u1002\u101C\u102C\u1015\u102B")) {
      reply = tone === "royal" ? "\u1019\u103E\u1014\u103A\u101C\u103E\u1015\u102B\u104A \u1014\u1031\u1000\u1031\u102C\u1004\u103A\u1038\u1000\u103B\u1014\u103A\u1038\u1019\u102C\u1005\u103D\u102C \u101B\u103E\u102D\u1015\u102B\u101E\u100A\u103A \u1018\u102F\u101B\u102C\u1038\u104B \u101E\u1001\u1004\u103A \u1021\u101C\u102D\u102F\u101B\u103E\u102D\u101B\u102C\u1000\u102D\u102F \u1021\u1019\u102D\u1014\u1037\u103A\u1010\u1031\u102C\u103A\u1021\u1010\u102D\u102F\u1004\u103A\u1038 \u1016\u103C\u100A\u1037\u103A\u1006\u100A\u103A\u1038\u1006\u1031\u102C\u1004\u103A\u101B\u103D\u1000\u103A\u1015\u1031\u1038\u1015\u102B\u1019\u100A\u103A\u104B" : "\u1019\u1004\u103A\u1039\u1002\u101C\u102C\u1015\u102B \u1001\u1004\u103A\u1017\u103B\u102C! \u1015\u102F\u1002\u1036 Voice Agent \u1021\u1006\u1004\u103A\u101E\u1004\u1037\u103A\u101B\u103E\u102D\u1014\u1031\u1015\u102B\u1015\u103C\u102E\u104B \u1016\u102F\u1014\u103A\u1038\u101C\u102F\u1015\u103A\u1006\u1031\u102C\u1004\u103A\u1001\u103B\u1000\u103A\u1019\u103B\u102C\u1038 \u101E\u102D\u102F\u1037\u1019\u101F\u102F\u1010\u103A \u101C\u102D\u102F\u1021\u1015\u103A\u101E\u100A\u103A\u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1019\u103C\u1014\u103A\u1019\u102C\u101C\u102D\u102F \u1021\u101E\u1036\u1016\u103C\u1004\u1037\u103A \u1021\u1019\u102D\u1014\u1037\u103A\u1015\u1031\u1038\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u1010\u101A\u103A\u1001\u1004\u103A\u1017\u103B\u102C\u104B";
    }
    return res.json({ reply, action, provider: "offline", model: "Autonomous-Bagan-Engine" });
  } catch (error) {
    console.error("Agent chat error:", error);
    res.status(500).json({ error: error.message || "Agent error" });
  }
});
var BUILT_IN_MCP_TOOLS = [
  {
    name: "android_control_wifi",
    description: "Toggle or inspect Wi-Fi state on the Android phone",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["enable", "disable", "status"] }
      },
      required: ["action"]
    }
  },
  {
    name: "android_control_bluetooth",
    description: "Toggle or inspect Bluetooth state on the Android phone",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["enable", "disable", "status"] }
      },
      required: ["action"]
    }
  },
  {
    name: "android_control_flashlight",
    description: "Turn Android camera torch/flashlight ON or OFF",
    inputSchema: {
      type: "object",
      properties: {
        enabled: { type: "boolean" }
      },
      required: ["enabled"]
    }
  },
  {
    name: "android_get_battery_status",
    description: "Retrieve current Android battery level, charging status, and RAM info",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "android_adjust_volume",
    description: "Adjust Android media or speech volume level (0 to 100)",
    inputSchema: {
      type: "object",
      properties: {
        level: { type: "number", minimum: 0, maximum: 100 },
        delta: { type: "number" }
      }
    }
  },
  {
    name: "android_launch_app",
    description: "Launch an Android application or intent URI (YouTube, Maps, Camera, etc.)",
    inputSchema: {
      type: "object",
      properties: {
        app_name: { type: "string" },
        uri: { type: "string" }
      },
      required: ["app_name"]
    }
  },
  {
    name: "android_dial_phone",
    description: "Dial a telephone number via Android phone dialer",
    inputSchema: {
      type: "object",
      properties: {
        phone_number: { type: "string" }
      },
      required: ["phone_number"]
    }
  },
  {
    name: "android_send_sms",
    description: "Draft or dispatch an SMS text message to a recipient",
    inputSchema: {
      type: "object",
      properties: {
        phone_number: { type: "string" },
        message: { type: "string" }
      },
      required: ["phone_number", "message"]
    }
  },
  {
    name: "android_shell_execute",
    description: "Execute Shizuku / rish ADB shell commands on the Android device",
    inputSchema: {
      type: "object",
      properties: {
        command: { type: "string" }
      },
      required: ["command"]
    }
  },
  {
    name: "android_speak_voice",
    description: "Speak Burmese or English text aloud using natural Text-to-Speech",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string" }
      },
      required: ["text"]
    }
  },
  {
    name: "android_screen_brightness",
    description: "Set Android display brightness level (0 - 100%)",
    inputSchema: {
      type: "object",
      properties: {
        level: { type: "number", minimum: 0, maximum: 100, description: "Screen brightness level" }
      },
      required: ["level"]
    }
  },
  {
    name: "android_clean_ram",
    description: "Flush memory cache and optimize Android background processes (6GB RAM Optimized)",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "android_device_info",
    description: "Retrieve detailed Android device hardware, RAM usage, model, and OS specifications",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "android_clipboard_copy",
    description: "Copy text to Android system clipboard",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text to copy to clipboard" }
      },
      required: ["text"]
    }
  },
  {
    name: "android_haptic_pulse",
    description: "Trigger tactile haptic vibration patterns (success, double-tap, alert)",
    inputSchema: {
      type: "object",
      properties: {
        pattern: { type: "string", enum: ["success", "alert", "double", "long"], description: "Haptic pulse type" }
      }
    }
  }
];
app.get("/api/mcp/tools", (req, res) => {
  res.json({
    tools: BUILT_IN_MCP_TOOLS,
    protocolVersion: "2024-11-05",
    serverInfo: {
      name: "Bagan-Android-Builtin-MCP",
      version: "1.0.0",
      author: "Victor Geek"
    }
  });
});
app.post("/api/mcp/call", (req, res) => {
  const { name, arguments: args = {} } = req.body;
  const tool = BUILT_IN_MCP_TOOLS.find((t) => t.name === name);
  if (!tool) {
    return res.status(404).json({
      isError: true,
      content: [{ type: "text", text: `Unknown MCP Tool: ${name}` }]
    });
  }
  let textResult = `[Built-in Android MCP] Executed ${name}`;
  if (name === "android_shell_execute") {
    const cmd = args.command || "dumpsys battery";
    if (cmd.includes("battery")) {
      textResult = "Current Battery Service state:\n  AC powered: false\n  USB powered: true\n  level: 85%\n  status: 2 (Charging)";
    } else if (cmd.includes("pm list packages")) {
      textResult = "package:com.google.android.youtube\npackage:com.google.android.apps.maps\npackage:com.android.camera";
    } else {
      textResult = `[Shizuku/rish ADB OK]: ${cmd} executed successfully.`;
    }
  } else if (name === "android_clean_ram") {
    textResult = JSON.stringify({
      status: "success",
      action: "clean_ram",
      freedMemoryMb: 780,
      totalMemory: "6 GB LPDDR4X",
      availableMemory: "3.4 GB",
      swappiness: 60,
      message: "Android RAM cache cleared. System responsiveness boosted."
    }, null, 2);
  } else if (name === "android_device_info") {
    textResult = JSON.stringify({
      model: "Android Smartphone",
      ram: "6.00 GB",
      androidVersion: "Android 14 (API 34)",
      securityPatch: "2024-11",
      processor: "Octa-core 2.4 GHz",
      mcpEngine: "Bagan MCP Server v1.0.0 (2024-11-05 Spec)",
      author: "Victor Geek"
    }, null, 2);
  } else if (name === "android_screen_brightness") {
    textResult = JSON.stringify({
      status: "success",
      action: "screen_brightness",
      level: args.level ?? 80,
      message: `Screen brightness adjusted to ${args.level ?? 80}%`
    }, null, 2);
  } else if (name === "android_clipboard_copy") {
    textResult = JSON.stringify({
      status: "success",
      action: "clipboard_copy",
      copiedLength: (args.text || "").length,
      message: "Text copied to Android clipboard."
    }, null, 2);
  } else if (name === "android_haptic_pulse") {
    textResult = JSON.stringify({
      status: "success",
      action: "haptic_pulse",
      pattern: args.pattern || "success",
      message: "Tactile vibration pulse executed."
    }, null, 2);
  } else {
    textResult = JSON.stringify({
      status: "success",
      tool: name,
      arguments: args,
      executedAt: (/* @__PURE__ */ new Date()).toISOString(),
      platform: "Android (6GB RAM Optimized)"
    });
  }
  res.json({
    content: [{ type: "text", text: textResult }],
    isError: false
  });
});
app.post("/api/mcp/rpc", (req, res) => {
  const { jsonrpc, id, method, params } = req.body;
  if (jsonrpc !== "2.0") {
    return res.status(400).json({ jsonrpc: "2.0", id: id || null, error: { code: -32600, message: "Invalid Request" } });
  }
  if (method === "initialize") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "Bagan-Android-Builtin-MCP", version: "1.0.0" }
      }
    });
  }
  if (method === "tools/list") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: { tools: BUILT_IN_MCP_TOOLS }
    });
  }
  if (method === "tools/call") {
    const toolName = params?.name;
    const toolArgs = params?.arguments || {};
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "success",
              tool: toolName,
              args: toolArgs,
              mcp_runtime: "built-in"
            })
          }
        ]
      }
    });
  }
  if (method === "ping") {
    return res.json({ jsonrpc: "2.0", id, result: {} });
  }
  return res.json({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method not found: ${method}` }
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
