## كيفية الحصول على APK عبر Cursor Agent على اللابتوب

### 1. المتطلبات على اللابتوب
- Node.js 20 أو أحدث
- Java JDK 17
- Android SDK (بما في ذلك `build-tools`, `platform-tools`)
- إعداد المتغيّرات:
  ```bash
  export ANDROID_HOME=/path/to/Android/Sdk
  export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools
  ```

### 2. أوامر يجب أن ينفذها Cursor Agent
```bash
git clone https://github.com/codecsverige/Vakt.git
cd Vakt/FakturaVakt
npm install
npx react-native-asset
cd android && ./gradlew clean
./gradlew assembleRelease
```

### 3. مكان الـAPK
بعد اكتمال الأمر الأخير:
```
FakturaVakt/android/app/build/outputs/apk/release/app-release.apk
```
يمكن نسخه وإعادة تسميته:
```bash
cp android/app/build/outputs/apk/release/app-release.apk ../riadh.apk
```

### 4. بديل GitHub Actions
1. `git push` للفرع الذي يحوي الإصلاحات.
2. من GitHub Actions شغّل Workflow **Build Android APK**.
3. نزّل الـAPK من قسم Artifacts أو Releases.

باتباع هذه الخطوات يحصل Cursor Agent على APK مستقر دون أخطاء.
