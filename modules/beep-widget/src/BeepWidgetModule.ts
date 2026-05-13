import { requireNativeModule } from "expo-modules-core";

export interface BeepWidgetNativeModule {
  updateWidgetData(data: string): void;
  reloadWidgets(): void;
  getWidgetData(): Promise<string | null>;
}

let cachedModule: BeepWidgetNativeModule | null | undefined;

export function getBeepWidgetModule(): BeepWidgetNativeModule | null {
  if (cachedModule !== undefined) return cachedModule;

  try {
    cachedModule = requireNativeModule<BeepWidgetNativeModule>("BeepWidget");
  } catch (err) {
    cachedModule = null;
    console.warn(
      "BeepWidget native module unavailable",
      err instanceof Error ? err.message : err,
    );
  }

  return cachedModule;
}
