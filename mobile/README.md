# Evify Mobile Application

A cross-platform React Native mobile application for EV Fleet management, built with TypeScript, React Navigation, and Axios.

## Prerequisites
- Node.js 18+
- React Native CLI / Xcode (for iOS) / Android Studio (for Android)
- CocoaPods (`sudo gem install cocoapods`)

## Installation & Setup

1. **Install dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **iOS Setup**:
   ```bash
   cd ios && pod install && cd ..
   npm run ios
   ```

3. **Android Setup**:
   ```bash
   npm run android
   ```

## Configuration
Configure the API endpoint in `mobile/src/services/api.ts` or pass the `API_BASE_URL` environment variable:
- Android Emulator: `http://10.0.2.2:5000/api`
- iOS Simulator: `http://localhost:5000/api`
- Physical Device: `http://<YOUR_LOCAL_IP>:5000/api`
