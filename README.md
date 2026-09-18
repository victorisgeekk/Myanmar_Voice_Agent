# 🇲🇲 Bagan Voice Agent (Develop by Victor Geek)
> ပုဂံခေတ် မြန်မာမှု အနုပညာ အငွေ့အသက်နှင့် ခေတ်မီ Real-Time WebRTC LiveKit AI နည်းပညာတို့ ပေါင်းစပ်ထားသော မြန်မာဘာသာ အသံလက်ထောက်စနစ်

---

## 🌐 ဘာသာစကား ရွေးချယ်ဖတ်ရှုရန် / Choose Language
* [🇲🇲 မြန်မာဘာသာ (Myanmar Language)](#-မြန်မာဘာသာ-myanmar-version)
* [🇬🇧 English Version](#-english-version)

---

<details open>
<summary><h3>🇲🇲 မြန်မာဘာသာ (Myanmar Version) - ဖတ်ရှုရန် နှိပ်ပါ (ဖွင့်/ပိတ်)</h3></summary>

### 📜 မိတ်ဆက် (Overview)
**Bagan Voice Agent** သည် ပုဂံခေတ် ရွှေရောင်ဗိသုကာ ယဉ်ကျေးမှုအနုပညာကို အခြေခံပြီး မြန်မာစကားပြော လူသားဆန်ဆန် အသံလက်ထောက် (AI Voice Agent) တစ်ခု ဖြစ်ပါသည်။ Android ဖုန်း၏ Hardware များ (ဓာတ်မီး၊ တုန်ခါမှု၊ အသံအတိုးအကျယ်၊ ကွန်ရက်) ကို အသံဖြင့် တိုက်ရိုက် ခိုင်းစေနိုင်သည့်အပြင် **LiveKit WebRTC Ultra-Low Latency Voice Streaming** နှင့် **Google Gemini 2.5 AI** တို့ကို အသုံးပြု၍ ချက်ချင်း ပြန်လည် စကားပြောဆိုနိုင်ပါသည်။

---

### 🔑 လိုအပ်သော API Keys များနှင့် တိုက်ရိုက် ရယူရန် Link များ (Direct URLs)

App ကို အပြည့်အဝ အသုံးပြုနိုင်ရန် အောက်ပါ API Key များကို သက်ဆိုင်ရာ Direct Link များသို့ သွားရောက်၍ အခမဲ့ (Free Tier) လျှောက်ထားရယူနိုင်ပါသည်-

| API အမည် | အသုံးပြုသည့် လုပ်ဆောင်ချက် | ကုန်ကျစရိတ် | Direct URL (တိုက်ရိုက်လင့်ခ်) |
| :--- | :--- | :--- | :--- |
| **Google Gemini API Key** *(မဖြစ်မနေ လိုအပ်)* | AI စကားပြောဆိုမှု၊ အမိန့်ခွဲခြမ်းစိတ်ဖြာမှု၊ ပုဂံဗဟုသုတ | **အခမဲ့ (Free Tier ရရှိ)** | 🔗 [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| **LiveKit Cloud Credentials** *(URL, Key, Secret)* | Real-Time အသံထုတ်လွှင့်မှု (WebRTC Voice Room) | **အခမဲ့ (Free 50GB/mo)** | 🔗 [https://cloud.livekit.io/](https://cloud.livekit.io/) |
| **OpenAI API Key** *(ရွေးချယ်နိုင်)* | ChatGPT-4o-mini ဖြင့် အသံအပြန်အလှန်ပြောဆိုရန် | Pay-as-you-go | 🔗 [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **OpenRouter API Key** *(ရွေးချယ်နိုင်)* | Claude, Llama, DeepSeek စသည့် Models များ ချိတ်ရန် | အခမဲ့ မော်ဒယ်များ ပါဝင် | 🔗 [https://openrouter.ai/keys](https://openrouter.ai/keys) |
| **Google Cloud Console** *(ရွေးချယ်နိုင်)* | Google Drive / Google Tasks OAuth Client ID | အခမဲ့ | 🔗 [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) |

#### ၁။ Google Gemini API Key ရယူနည်း အဆင့်ဆင့်
1. 🔗 [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) သို့ သွားပါ။
2. သင့် Google Account ဖြင့် Sign In ဝင်ပါ။
3. **"Create API key"** ခလုတ်ကို နှိပ်ပါ။
4. ပရောဂျက်တစ်ခု ရွေးပါ (သို့မဟုတ် Create new project ပြုလုပ်ပါ)။
5. ထွက်ပေါ်လာသော `AIzaSy...` အစချီ Key ကို Copy ကူးယူပါ။
6. `.env` ဖိုင်တွင် `GEMINI_API_KEY="သင့်_Key"` အဖြစ် ထည့်သွင်းပါ (သို့မဟုတ် App ၏ Settings UI တွင် တိုက်ရိုက် ထည့်သွင်းနိုင်ပါသည်)။

#### ၂။ LiveKit Cloud Credentials ရယူနည်း အဆင့်ဆင့်
1. 🔗 [https://cloud.livekit.io/](https://cloud.livekit.io/) သို့ သွား၍ အခမဲ့ Account ဖွင့်ပါ။
2. Project အသစ်တစ်ခု တည်ဆောက်ပါ (ဥပမာ- `bagan-voice-agent`)။
3. Dashboard ရှိ **Settings > Keys** သို့ သွားပြီး **"Generate New Key"** ကို နှိပ်ပါ။
4. အောက်ပါ အချက်အလက် (၃) ခုကို ရရှိပါမည်:
   - **WebSocket URL:** `wss://your-project.livekit.cloud`
   - **API Key:** `API...`
   - **API Secret:** `Secret...`
5. `.env` ဖိုင်တွင် အောက်ပါအတိုင်း ထည့်သွင်းပါ:
   ```env
   LIVEKIT_URL="wss://your-subdomain.livekit.cloud"
   LIVEKIT_API_KEY="သင့်_API_KEY"
   LIVEKIT_API_SECRET="သင့်_API_SECRET"
   ```

---

### 📱 App အသုံးပြုနည်း လမ်းညွှန် (How to Use)

#### ၁။ အသံဖြင့် အမိန့်ပေး ခိုင်းစေခြင်း (Voice Commands)
မျက်နှာပြင် အလယ်ရှိ **ရွှေရောင် မိုက်ခရိုဖုန်းခလုတ် (Microphone)** ကို နှိပ်ပြီး အောက်ပါအတိုင်း မြန်မာလို တိုက်ရိုက် ပြောဆိုနိုင်ပါသည်:

* **ဓာတ်မီး / Flashlight:** *"ဓာတ်မီး ဖွင့်ပေးပါ"* သို့မဟုတ် *"မီးပိတ်လိုက်ပါ"* (ဖုန်း၏ Camera LED Flashlight ကို အလိုအလျောက် ဖွင့်/ပိတ်ပေးပါမည်)။
* **ကွန်ရက်နှင့် ဆက်သွယ်ရေး:** *"Wi-Fi ဖွင့်ပါ"*၊ *"Bluetooth ဖွင့်ပေးပါ"*။
* **ဖုန်းခေါ်ဆိုမှုနှင့် မက်ဆေ့ခ်ျ:** *"ကိုစည်သူကို ဖုန်းခေါ်ပေးပါ"*၊ *"မနက်ဖြန် တွေ့မယ်လို့ SMS ပို့ပေးပါ"*။
* **ဖုန်းစနစ် စီမံခန့်ခွဲမှု:** *"RAM memory ရှင်းပေးပါ"*၊ *"အသံတိုးပေးပါ/ကျယ်ပေးပါ"*၊ *"ဖုန်းတုန်ခါမှု စမ်းပေးပါ"*။
* **ပုဂံယဉ်ကျေးမှု ဗဟုသုတ:** *"အာနန္ဒာဘုရား အကြောင်း ရှင်းပြပါ"*၊ *"ပုဂံခေတ် ဗိသုကာ လက်ရာတွေအကြောင်း ပြောပြပါ"*။
* **အသံမှတ်တမ်းနှင့် မှတ်စု:** *"ဒီနေ့ အစည်းအဝေး အသံမှတ်တမ်းကို Google Drive ပေါ် သိမ်းပေးပါ"*။

#### ၂။ တုံ့ပြန်မှုဟန်ပန် ရွေးချယ်ခြင်း (Tone Switcher)
Settings တွင် တုံ့ပြန်မှုစတိုင် (၃) မျိုး ရွေးချယ်နိုင်ပါသည်:
* **နန်းတွင်းသုံး (Royal - ပုဂံဟန်):** *"မှန်လှပါ ဘုရား/ခင်ဗျာ၊ အမိန့်တော်အတိုင်း ချက်ချင်း ဆောင်ရွက်ပြီးပါပြီ ဘုရား"*။
* **ခေတ်မီဟန် (Modern - Victor Geek):** *"ဟုတ်ကဲ့ မင်္ဂလာပါ! အခုပဲ အဆင်ပြေအောင် လုပ်ဆောင်ပေးလိုက်ပါမယ်"*။
* **စစ်ဆင်ရေးဟန် (Tactical):** တိုတိုရှင်းရှင်း လိုရင်းတိုရှင်း အမိန့်နာခံသော စတိုင်။

#### ၃။ LiveKit WebRTC Voice Room သို့ ချိတ်ဆက်ခြင်း
* အပေါ်ဘက်ရှိ **"LiveKit ချိတ်ဆက်ရန်"** ခလုတ်ကို နှိပ်လိုက်သည်နှင့် WebRTC ဖြင့် Voice Room သို့ ချက်ချင်း ဝင်ရောက်ပြီး အသံအပြန်အလှန် လျင်မြန်စွာ စကားပြောဆိုနိုင်ပါမည်။

---

### 📦 Android APK ဖိုင် ထုတ်ယူနည်း (GitHub Actions CI/CD)

ဤ Repository တွင် GitHub Actions Workflow (`.github/workflows/build-android-apk.yml`) ထည့်သွင်းထားပြီး ဖြစ်သဖြင့် GitHub ပေါ်မှ APK တိုက်ရိုက် ထုတ်ယူနိုင်ပါသည်:

1. Code များကို GitHub သို့ Commit & Push တင်ပါ:
   ```bash
   git add .
   git commit -m "Update application"
   git push origin main
   ```
2. GitHub Repository ၏ **"Actions"** tab သို့ သွားပါ။
3. **"Build Android APK"** Workflow အလုပ်လုပ်နေသည်ကို တွေ့ရပါမည် (စိမ်းရောင်အမှန်ခြစ် ✅ ပေါ်သည်အထိ စောင့်ပါ)။
4. ၎င်း Run ကို နှိပ်ပြီး စာမျက်နှာအောက်ဘက် **Artifacts** ကဏ္ဍမှ **`BaganVoiceAgent-Debug-APK`** ကို နှိပ်၍ ZIP ဖိုင်ကို ဒေါင်းလုဒ်ဆွဲပါ။
5. ZIP ဖြည်လိုက်ပါက ရရှိလာမည့် **`app-debug.apk`** ကို သင့် Android ဖုန်းထဲသို့ ထည့်သွင်း အသုံးပြုနိုင်ပါပြီ။

---

### 📲 ကွန်ပျူတာပေါ်တွင် Local Development ပြုလုပ်နည်း

```bash
# ၁။ Dependency များ သွင်းယူပါ
npm install --legacy-peer-deps

# ၂။ Environment Variable ပြင်ဆင်ပါ
cp .env.example .env
# .env ထဲတွင် သင့် GEMINI_API_KEY နှင့် LIVEKIT credentials များ ဖြည့်သွင်းပါ

# ၃။ Development Server စတင်ပါ
npm run dev

# ၄။ Android Studio ဖြင့် ဖွင့်လှစ်လိုပါက
npm run build:android
npx cap open android
```

</details>

---

<details>
<summary><h3>🇬🇧 English Version - Click to Expand (Open/Close)</h3></summary>

### 📜 Overview
**Bagan Voice Agent** is a state-of-the-art Burmese Voice AI Assistant inspired by ancient Bagan dynasty aesthetic motifs and powered by cutting-edge WebRTC technology. It combines **Google Gemini 2.5 AI** with **LiveKit Real-time Voice Streaming**, enabling responsive natural Burmese voice interactions alongside complete Android device hardware controls (Flashlight, Haptics, Volume, Connectivity, and Tasks).

---

### 🔑 Required API Keys & Direct Acquisition URLs

| API Service | Purpose in App | Pricing / Tier | Direct URL Link |
| :--- | :--- | :--- | :--- |
| **Google Gemini API** *(Required)* | Myanmar natural language reasoning, intent parsing, cultural knowledge | **Free Tier Available** | 🔗 [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| **LiveKit Cloud** *(URL, Key, Secret)* | Ultra-low latency WebRTC bi-directional audio streaming | **Free Tier (50GB/mo)** | 🔗 [https://cloud.livekit.io/](https://cloud.livekit.io/) |
| **OpenAI API** *(Optional)* | Alternative ChatGPT-4o-mini provider | Pay-as-you-go | 🔗 [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **OpenRouter API** *(Optional)* | Access to Claude, DeepSeek, Llama models | Free & paid tiers | 🔗 [https://openrouter.ai/keys](https://openrouter.ai/keys) |
| **Google Cloud Console** *(Optional)* | Google Tasks & Google Drive OAuth 2.0 integration | Free | 🔗 [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) |

#### Step-by-Step: Obtaining Google Gemini API Key
1. Visit 🔗 [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click on **"Create API key"**.
4. Select an existing Google Cloud project or create a new one.
5. Copy your generated key (`AIzaSy...`).
6. Paste it into your `.env` file as `GEMINI_API_KEY="your_key_here"` (or enter it directly via the in-app Settings panel).

#### Step-by-Step: Obtaining LiveKit Cloud Credentials
1. Register at 🔗 [https://cloud.livekit.io/](https://cloud.livekit.io/).
2. Create a new project (e.g., `bagan-voice-agent`).
3. Navigate to **Settings > Keys** and click **"Generate New Key"**.
4. You will receive:
   - **Server URL:** `wss://your-subdomain.livekit.cloud`
   - **API Key:** `API...`
   - **API Secret:** `Secret...`
5. Configure them in `.env`:
   ```env
   LIVEKIT_URL="wss://your-subdomain.livekit.cloud"
   LIVEKIT_API_KEY="your_api_key"
   LIVEKIT_API_SECRET="your_api_secret"
   ```

---

### 📱 How to Use the App

#### 1. Burmese Voice Commands
Tap the central **Golden Microphone button** and speak natural Burmese commands:
* **Flashlight Control:** *"ဓာတ်မီး ဖွင့်ပေးပါ"* (Turn on flashlight) or *"မီးပိတ်လိုက်ပါ"* (Turn off flashlight).
* **Connectivity:** *"Wi-Fi ဖွင့်ပါ"* (Toggle Wi-Fi), *"Bluetooth ဖွင့်ပေးပါ"* (Toggle Bluetooth).
* **Communication:** *"ဖုန်းခေါ်ပေးပါ"* (Initiate call), *"SMS ပို့ပေးပါ"* (Send SMS).
* **System Utilities:** *"RAM memory ရှင်းပေးပါ"* (Optimize RAM), *"အသံတိုးပေးပါ"* (Volume down), *"ဖုန်းတုန်ခါမှု စမ်းပေးပါ"* (Trigger haptic feedback).
* **Bagan Cultural Inquiries:** *"အာနန္ဒာဘုရား အကြောင်း ရှင်းပြပါ"* (Inquire about Ananda Temple or Bagan history).
* **Productivity:** *"အသံမှတ်တမ်းကို Drive ပေါ် သိမ်းပါ"* (Save voice memo to Google Drive).

#### 2. Persona & Tone Switcher
Switch between three distinct response voices in Settings:
* **Royal (ပုဂံနန်းတွင်းသုံး):** Formal, courteous court speech.
* **Modern (Victor Geek):** Energetic, contemporary tech-assistant style.
* **Tactical:** Concise, direct military/operational confirmations.

#### 3. Real-Time LiveKit Voice Room
Click the **"LiveKit Connect"** button to establish a low-latency WebRTC bidirectional audio stream with the AI voice pipeline.

---

### 📦 Building Android APK via GitHub Actions CI/CD

An automated pipeline (`.github/workflows/build-android-apk.yml`) is included to build native `.apk` binaries directly on GitHub:

1. Commit and push your modifications:
   ```bash
   git add .
   git commit -m "Update Bagan Voice Agent"
   git push origin main
   ```
2. Navigate to the **"Actions"** tab on your GitHub repository.
3. Observe the **"Build Android APK"** workflow run until completed with a green checkmark ✅.
4. Click on the workflow run, scroll down to the **Artifacts** section, and download **`BaganVoiceAgent-Debug-APK`**.
5. Extract the ZIP archive to retrieve **`app-debug.apk`** and install it on your Android smartphone.

---

### 💻 Local Development Setup

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env
# Fill in GEMINI_API_KEY and LIVEKIT credentials in .env

# 3. Start local development server
npm run dev

# 4. Sync and open in Android Studio
npm run build:android
npx cap open android
```

---

### 🛡️ Permissions Declared in Android Manifest
* `android.permission.INTERNET` - Cloud AI & WebRTC streaming
* `android.permission.RECORD_AUDIO` - Voice input processing
* `android.permission.CAMERA` & `FLASHLIGHT` - Hardware torch control
* `android.permission.VIBRATE` - Haptic feedback integration
* `android.permission.ACCESS_NETWORK_STATE` & `ACCESS_WIFI_STATE` - Connectivity management

</details>

---

### 👨‍💻 Author & Maintainer
- **Developer:** Victor Geek
- **Project:** Bagan Voice Agent (ပုဂံ အသံလက်ထောက်)
- **Framework:** React 18, TypeScript, Tailwind CSS, Express, Capacitor, LiveKit WebRTC, Google Gemini 2.5
