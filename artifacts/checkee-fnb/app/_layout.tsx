import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { SamplerProvider } from "@/contexts/SamplerContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function KeyboardProviderCompat({ children }: { children: React.ReactNode }) {
  return Platform.OS === "web"
    ? <>{children}</>
    : <KeyboardProvider>{children}</KeyboardProvider>;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'forgot-password';
    const inParentTabs = segments[0] === '(tabs)';
    const inSamplerTabs = segments[0] === '(sampler-tabs)';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      if (user.role === 'Người lưu mẫu') {
        router.replace('/(sampler-tabs)');
      } else {
        router.replace('/(tabs)');
      }
    } else if (user && user.role === 'Người lưu mẫu' && inParentTabs) {
      router.replace('/(sampler-tabs)');
    } else if (user && user.role !== 'Người lưu mẫu' && inSamplerTabs) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) return null;

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <AuthGate>
      <Stack screenOptions={{ headerBackTitle: "Quay lại" }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ title: "Quên mật khẩu" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(sampler-tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="change-password" options={{ title: "Đổi mật khẩu" }} />
        <Stack.Screen name="meal/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="traceability/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="sample-retention" options={{ headerShown: false }} />
        <Stack.Screen name="sample-retention/[mealId]" options={{ headerShown: false }} />
        <Stack.Screen name="qr-scanner" options={{ headerShown: false }} />
        <Stack.Screen name="scan-sample/[mealId]" options={{ headerShown: false }} />
        <Stack.Screen name="feedback/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="notification/[id]" options={{ headerShown: false }} />
      </Stack>
    </AuthGate>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProviderCompat>
              <AuthProvider>
                <SamplerProvider>
                  <NotificationsProvider>
                    <RootLayoutNav />
                  </NotificationsProvider>
                </SamplerProvider>
              </AuthProvider>
            </KeyboardProviderCompat>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
