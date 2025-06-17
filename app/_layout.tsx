import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { TranslationService } from '@/services/TranslationService';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Initialiser le service de traduction au démarrage de l'app
    TranslationService.initialize();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}