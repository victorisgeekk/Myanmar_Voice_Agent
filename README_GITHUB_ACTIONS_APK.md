# 📱 GitHub Actions မှတဆင့် Android APK ဖိုင် ထုတ်ယူခြင်း လမ်းညွှန်

Victor Geek အတွက် **Bagan Voice Agent** ကို Android `.apk` ဖိုင်အဖြစ် GitHub ပေါ်တွင် အလိုအလျောက် Compile & Build ပြုလုပ်နိုင်ရန် လိုအပ်သော Configuration files များအားလုံး ပြည့်စုံစွာ ထည့်သွင်းပေးထားပြီး ဖြစ်ပါသည်။

---

### ၁။ ထည့်သွင်းပေးထားသော ဖိုင်များ
1. **`.github/workflows/build-android-apk.yml`** - GitHub Actions Workflow စနစ် (Push တင်လိုက်သည်နှင့် Ubuntu Cloud Runner ပေါ်တွင် JDK 17, Node.js 20, Vite Build နှင့် Android Gradle ဖြင့် `app-debug.apk` ကို အလိုအလျောက် ထုတ်လုပ်ပေးပါမည်)။
2. **`capacitor.config.json`** - Android App ID (`com.victorgeek.baganvoice`) နှင့် Web Asset လမ်းကြောင်းများ။
3. **`android/` Project Directory** - Gradle Wrapper (`gradlew`), `AndroidManifest.xml` (မိုက်ခရိုဖုန်း၊ အင်တာနက်၊ ဖုန်းတုန်ခါမှု၊ ဓာတ်မီး စသည့် လိုအပ်သော Permission များ ပါဝင်ပြီးသားဖြစ်ပါသည်)။

---

### ၂။ GitHub သို့ Push တင်ပြီး APK ဒေါင်းလုဒ်ရယူနည်း (အဆင့်ဆင့်)

1. သင့်စက်တွင် ပြောင်းလဲထားသော Code များကို Commit & Push ပြုလုပ်ပါ:
   ```bash
   git add .
   git commit -m "Add Capacitor Android and GitHub Actions APK build workflow"
   git push origin main
   ```

2. သင့် **GitHub Repository** စာမျက်နှာသို့ သွားပါ။
3. အပေါ်ဘက် Menu ဘားရှိ **"Actions"** Tab ကို နှိပ်ပါ။
4. **"Build Android APK"** ဟူသော Workflow အလုပ်လုပ်နေသည်ကို တွေ့ရပါမည် (စိမ်းရောင် အမှန်ခြစ် ✅ ပေါ်လာသည်အထိ ခေတ္တစောင့်ပါ - ၂ မိနစ်မှ ၃ မိနစ်ခန့် ကြာပါမည်)။
5. အဆိုပါ Run ပြီးစီးသော Workflow ခေါင်းစဉ်ကို နှိပ်ပြီး အောက်ဘက်သို့ ဆွဲကြည့်ပါက **"Artifacts"** ကဏ္ဍအောက်တွင် **`BaganVoiceAgent-Debug-APK`** ဟူသော Download link ကို တွေ့ရပါမည်။
6. ထို ZIP ဖိုင်ကို ဒေါင်းလုဒ်ဆွဲ၍ ဖြည်လိုက်ပါက သင့် Android ဖုန်းထဲသို့ သွင်းယူအသုံးပြုနိုင်မည့် **`app-debug.apk`** ဖိုင်ကို ချက်ချင်း ရရှိမည် ဖြစ်ပါသည်။

---

### ၃။ Android ဖုန်းတွင် Install သွင်းနည်း
- ဖုန်းထဲသို့ `app-debug.apk` ဖိုင်ကို ထည့်ပြီး နှိပ်ပါ။
- Google Play Protect မှ "Unrecognized app / Install anyway" ဟု မေးပါက **"Install anyway" (ဆက်လက်သွင်းရန်)** ကို နှိပ်ပြီး သွင်းယူအသုံးပြုနိုင်ပါပြီခင်ဗျာ။
