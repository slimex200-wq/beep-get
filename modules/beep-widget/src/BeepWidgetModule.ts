import { requireNativeModule } from "expo-modules-core";

interface BeepWidgetNativeModule {
  updateWidgetData(data: string): void;
  reloadWidgets(): void;
  getWidgetData(): Promise<string | null>;
}

export default requireNativeModule<BeepWidgetNativeModule>("BeepWidget");
