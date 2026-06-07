import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { AppleLiquidGlassPreviewScreen } from "@/screens/AppleLiquidGlassPreviewScreen";

export function AppleLiquidGlassPreviewApp() {
  useEffect(() => {
    SplashScreen.hideAsync().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("Splash hide failed", message);
    });
  }, []);

  return <AppleLiquidGlassPreviewScreen />;
}
