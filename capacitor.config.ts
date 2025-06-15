import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.budgettracker.app',
  appName: 'Budget Tracker Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0f172a"
    }
  }
};

export default config;
