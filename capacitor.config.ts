import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.koti.smarthome',
  appName: 'Koti',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    cleartext: true, // Allow local network HTTP/WS connections to Raspberry Pi
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
};

export default config;
