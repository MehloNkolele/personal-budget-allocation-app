declare module 'median-js-bridge' {
  export interface MedianDevice {
    info: {
      get(): Promise<{
        platform: string;
        version: string;
        model: string;
        manufacturer: string;
      }>;
    };
  }

  export interface MedianApp {
    resumed: {
      addListener(callback: () => void): void;
    };
    paused: {
      addListener(callback: () => void): void;
    };
  }

  export interface MedianAndroid {
    swipeGestures: {
      enable(): void;
      disable(): void;
    };
  }

  export interface MedianJSNavigation {
    url: {
      addListener(callback: (url: string) => void): void;
    };
  }

  export interface Median {
    device?: MedianDevice;
    app?: MedianApp;
    android?: MedianAndroid;
    jsNavigation?: MedianJSNavigation;
  }

  export const median: Median;
}
