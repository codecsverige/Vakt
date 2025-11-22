# 🚀 دليل بناء APK لتطبيق FakturaVakt

## 📋 المحتويات
- [بناء APK بخطوة واحدة](#بناء-apk-بخطوة-واحدة)
- [مكان العثور على APK](#مكان-العثور-على-apk)
- [المشاكل السابقة وحلولها](#المشاكل-السابقة-وحلولها)
- [قائمة المكتبات الممنوعة](#قائمة-المكتبات-الممنوعة)
- [إعداد البيئة](#إعداد-البيئة)
- [حل المشاكل الشائعة](#حل-المشاكل-الشائعة)

---

## 🎯 بناء APK بخطوة واحدة

### الأمر السريع:
```bash
cd /workspace/FakturaVakt && export ANDROID_HOME=~/android-sdk && ./build-apk.sh
```

### ⏱️ الوقت المتوقع: 30-45 ثانية

---

## 📍 مكان العثور على APK

بعد نجاح البناء، ستجد APK هنا:
```
/workspace/FakturaVakt/android/app/build/outputs/apk/release/app-release.apk
```

### نسخ APK إلى مكان سهل:
```bash
cp /workspace/FakturaVakt/android/app/build/outputs/apk/release/app-release.apk /workspace/FakturaVakt.apk
```

---

## ⚠️ المشاكل السابقة وحلولها

### 🔴 السبب الرئيسي لانهيار التطبيق:
**React Native Reanimated** - هذه المكتبة غير متوافقة مع React Native 0.74.5

### ✅ الحل المطبق:
1. إزالة React Native Reanimated تماماً
2. إزالة React Navigation (لأنه يعتمد على Reanimated)
3. بناء نظام navigation مخصص بسيط
4. استخدام EncryptedStorage مباشرة بدلاً من MMKV

---

## 🚫 قائمة المكتبات الممنوعة

### ❌ لا تقم بتثبيت هذه المكتبات أبداً:
```
- react-native-reanimated (أي إصدار)
- @react-navigation/* (جميع حزم React Navigation)
- react-native-screens
- react-native-gesture-handler  
- react-native-mmkv
- react-native-nitro-modules
- victory-native
- react-native-get-random-values
- react-native-document-picker
```

### ✅ البدائل الآمنة:
- **للتنقل**: استخدم النظام المخصص في `MainApp.tsx`
- **للتخزين**: استخدم `react-native-encrypted-storage` مباشرة
- **للرسوم البيانية**: استخدم عرض بسيط أو مكتبة web-based
- **للحركات**: استخدم Animated API المدمج في React Native

---

## 🛠️ إعداد البيئة (للمرة الأولى فقط)

### 1. التحقق من Android SDK:
```bash
# يجب أن يكون موجود في:
ls ~/android-sdk
```

### 2. إذا لم يكن موجوداً:
```bash
# نسخ SDK إلى المستخدم
cp -r /usr/lib/android-sdk ~/android-sdk
```

### 3. إعداد local.properties:
```bash
echo "sdk.dir=$HOME/android-sdk" > /workspace/FakturaVakt/android/local.properties
```

---

## 🔧 حل المشاكل الشائعة

### مشكلة: `SDK location not found`
```bash
export ANDROID_HOME=~/android-sdk
echo "sdk.dir=$HOME/android-sdk" > android/local.properties
```

### مشكلة: `Metro bundler error`
```bash
rm -rf /tmp/metro-*
cd android && ./gradlew clean
```

### مشكلة: `npm dependencies error`
```bash
cd /workspace/FakturaVakt
rm -rf node_modules
npm install --legacy-peer-deps
```

### مشكلة: `Gradle version error`
تأكد من استخدام Gradle 8.7:
```bash
cat android/gradle/wrapper/gradle-wrapper.properties | grep distributionUrl
# يجب أن يكون: gradle-8.7-bin.zip
```

---

## 📱 معلومات التطبيق

### الإصدارات المهمة:
- React Native: 0.74.5
- Gradle: 8.7
- Android Gradle Plugin: 8.6.0
- Min SDK: 24 (Android 7.0)
- Target SDK: 34
- Compile SDK: 35

### الملفات الحرجة:
1. `/workspace/FakturaVakt/index.js` - نقطة الدخول
2. `/workspace/FakturaVakt/src/MainApp.tsx` - التطبيق الرئيسي
3. `/workspace/FakturaVakt/android/app/build.gradle` - إعدادات البناء
4. `/workspace/FakturaVakt/android/gradle.properties` - خصائص المشروع

---

## 🚀 خطوات البناء التفصيلية

### 1. الانتقال للمجلد:
```bash
cd /workspace/FakturaVakt
```

### 2. تعيين Android SDK:
```bash
export ANDROID_HOME=~/android-sdk
```

### 3. تشغيل سكريبت البناء:
```bash
./build-apk.sh
```

### 4. انتظار النتيجة:
```
سترى:
- Step 2: Cleaning previous builds... ✓
- Step 3: Clearing Metro bundler cache... ✓  
- Step 4: Building Release APK...
- SUCCESS! ✓
```

### 5. الحصول على APK:
```bash
ls -la android/app/build/outputs/apk/release/app-release.apk
```

---

## 📝 ملاحظات مهمة للمطورين

### عند إضافة ميزة جديدة:
1. **لا تستخدم** أي مكتبة من القائمة الممنوعة
2. **اختبر** على جهاز حقيقي أو محاكي
3. **تحقق** من عدم وجود تحذيرات في Metro bundler
4. **استخدم** Error Boundary لمعالجة الأخطاء

### هيكل المشروع:
```
FakturaVakt/
├── src/
│   ├── MainApp.tsx          # التطبيق الرئيسي مع Navigation
│   ├── screens/             # الشاشات
│   ├── components/          # المكونات
│   ├── services/            # الخدمات (storage, etc)
│   └── ErrorBoundary.tsx    # معالج الأخطاء
├── android/
│   ├── app/build.gradle     # إعدادات البناء
│   └── local.properties     # مسار SDK
└── build-apk.sh            # سكريبت البناء
```

### تحديث التبعيات:
```bash
# دائماً استخدم --legacy-peer-deps
npm install [package-name] --legacy-peer-deps

# تجنب npm update العام
# حدث كل حزمة بشكل منفصل واختبر
```

---

## 🎯 الخلاصة

1. **الأمر الوحيد المطلوب**: 
   ```bash
   cd /workspace/FakturaVakt && export ANDROID_HOME=~/android-sdk && ./build-apk.sh
   ```

2. **مكان APK**: 
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

3. **أهم قاعدة**: 
   > لا تثبت React Native Reanimated أو React Navigation أبداً!

---

## 📞 للمساعدة

إذا واجهت أي مشكلة:
1. اقرأ رسالة الخطأ بعناية
2. تحقق من القائمة الممنوعة
3. نظف المشروع وأعد المحاولة
4. استخدم النسخة البسيطة (SimpleApp) للاختبار

---

**آخر تحديث**: 22 نوفمبر 2024
**الإصدار المستقر**: v0.0.7
**حجم APK المتوقع**: 53-55MB