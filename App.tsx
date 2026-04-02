import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { RootNavigator } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import { customFonts } from "@/theme/fonts";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const { setSession, fetchProfile } = useAuthStore();
  const [fontsLoaded] = useFonts(customFonts);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
