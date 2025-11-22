# FakturaVakt

FakturaVakt is a React Native bill management application.

## 🚀 Quick Start - Build APK

```bash
cd /workspace/FakturaVakt && export ANDROID_HOME=~/android-sdk && ./build-apk.sh
```

**APK Location**: `android/app/build/outputs/apk/release/app-release.apk`

## 📱 Features

- ✅ Bill management (add, edit, delete)
- ✅ Dashboard with statistics
- ✅ Upcoming bills with due dates
- ✅ Secure encrypted storage
- ✅ Bill categorization
- 🔜 QR code scanning
- 🔜 Multi-language support (AR/SV/EN)
- 🔜 Notifications

## ⚠️ Important: Forbidden Libraries

**NEVER install these libraries** (they cause crashes):
- `react-native-reanimated`
- `@react-navigation/*`
- `react-native-screens`
- `react-native-gesture-handler`
- `react-native-mmkv`
- `victory-native`

## 🛠️ Development

### Prerequisites
- Node.js 20+
- Android SDK in `~/android-sdk`

### Installation
```bash
npm install --legacy-peer-deps
```

### Run Development
```bash
npm run android
```

## 📋 Project Info

- React Native: 0.74.5
- Min Android: API 24 (7.0)
- Gradle: 8.7
- Build Time: ~45 seconds

## 🔗 Downloads

Latest APK: [GitHub Releases](https://github.com/codecsverige/Vakt/releases)

---

For detailed build instructions, see `/workspace/BUILD_APK_GUIDE.md`