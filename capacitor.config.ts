import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.greenpulse.app',
  appName: 'GreenPulse',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true,
    iosScheme: 'capacitor',
  },
  android: {
    path: 'android',
    allowMixedContent: true,
    captureInput: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      autoHide: true,
      androidSpin: true,
      androidSpinColor: '#10B981',
      backgroundColor: '#0F172A',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#10B981',
      overlaysWebView: false,
    },
  },
};

export default config;