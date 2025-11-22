# FakturaVakt

FakturaVakt is a React Native application for managing and tracking invoices.

## Features

- Invoice management and tracking
- QR code scanning for invoices
- Payment extension requests
- Multi-language support (English, Swedish, Arabic)
- Dark mode support
- Secure storage for invoice data

## Download

Download the latest version of FakturaVakt APK from the [releases page](https://github.com/codecsverige/Vakt/releases).

**Latest Version**: v0.0.2 (November 22, 2024) - Fixed crash issues on app launch

## Development

### Prerequisites

- Node.js 20+
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. For iOS:
   ```bash
   cd ios && pod install
   ```

### Building the APK

To build a release APK:
```bash
./build-apk.sh
```

The APK will be generated in `android/app/build/outputs/apk/release/app-release.apk`

### Running in Development

Android:
```bash
npm run android
```

iOS:
```bash
npm run ios
```

## Technologies Used

- React Native 0.74.5
- React Navigation
- React Hook Form
- Zustand (state management)
- React Native Encrypted Storage
- i18n for internationalization
- React Native Reanimated
- React Native SVG

## License

This project is private and proprietary.