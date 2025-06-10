import { useEffect } from 'react';
import { Platform } from 'react-native';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    // Only execute on web platform where window and frameworkReady exist
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.frameworkReady === 'function') {
      window.frameworkReady();
    }
  }, []);
}