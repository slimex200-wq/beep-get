import ExpoModulesCore
import WidgetKit

public class BeepWidgetModule: Module {
    public func definition() -> ModuleDefinition {
        Name("BeepWidget")

        Function("updateWidgetData") { (data: String) in
            guard let userDefaults = UserDefaults(suiteName: "group.com.beepget.shared") else { return }
            userDefaults.set(data, forKey: "widget_data")
            userDefaults.synchronize()
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }

        Function("reloadWidgets") {
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }

        AsyncFunction("getWidgetData") { () -> String? in
            guard let userDefaults = UserDefaults(suiteName: "group.com.beepget.shared") else { return nil }
            return userDefaults.string(forKey: "widget_data")
        }
    }
}
