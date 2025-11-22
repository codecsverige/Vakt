# 🤖 دليل Agent لبناء APK - خطوة بخطوة

## 🎯 الأمر الوحيد المطلوب

```bash
cd /workspace/FakturaVakt && export ANDROID_HOME=~/android-sdk && ./build-apk.sh
```

## 📍 مكان APK بعد البناء

```
/workspace/FakturaVakt/android/app/build/outputs/apk/release/app-release.apk
```

## 📋 خطوات Agent التفصيلية

### 1️⃣ التحقق من المجلد
```bash
cd /workspace/FakturaVakt
```

### 2️⃣ تعيين Android SDK
```bash
export ANDROID_HOME=~/android-sdk
```

### 3️⃣ بناء APK
```bash
./build-apk.sh
```

### 4️⃣ انتظر حتى ترى
```
BUILD SUCCESSFUL
APK Size: 53M
```

### 5️⃣ نسخ APK لمكان سهل
```bash
cp android/app/build/outputs/apk/release/app-release.apk /workspace/FakturaVakt-NEW.apk
```

---

## ⚠️ مهم جداً - لا تفعل هذه الأشياء

### ❌ لا تثبت أبداً:
- `react-native-reanimated`
- `@react-navigation/*`
- `react-native-screens`
- `react-native-gesture-handler`
- `react-native-mmkv`

### ❌ لا تغير:
- `android/gradle/wrapper/gradle-wrapper.properties` (يجب أن يبقى 8.7)
- `android/build.gradle` (compileSdkVersion = 35)
- `MainApplication.kt` (تم إصلاحه بالفعل)

---

## 🔧 حل المشاكل الشائعة

### إذا ظهر خطأ `SDK location not found`:
```bash
echo "sdk.dir=$HOME/android-sdk" > android/local.properties
```

### إذا ظهر خطأ `Metro bundler`:
```bash
rm -rf /tmp/metro-*
cd android && ./gradlew clean
```

### إذا ظهر خطأ `npm`:
```bash
rm -rf node_modules
npm install --legacy-peer-deps
```

---

## 📊 معلومات البناء

- **وقت البناء**: ~45 ثانية
- **حجم APK**: ~53MB
- **React Native**: 0.74.5
- **Min Android**: API 24

---

## 🎯 ملخص سريع للـ Agent

1. **اذهب للمجلد**: `cd /workspace/FakturaVakt`
2. **ابني APK**: `export ANDROID_HOME=~/android-sdk && ./build-apk.sh`
3. **خذ APK من**: `android/app/build/outputs/apk/release/app-release.apk`

## ✅ هذا كل شيء!

إذا اتبعت هذه الخطوات بالضبط، ستحصل على APK يعمل 100% بدون انهيار.