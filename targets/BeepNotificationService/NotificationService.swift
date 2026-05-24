import UserNotifications
import WidgetKit

class NotificationService: UNNotificationServiceExtension {
    var contentHandler: ((UNNotificationContent) -> Void)?
    var bestAttemptContent: UNMutableNotificationContent?

    override func didReceive(
        _ request: UNNotificationRequest,
        withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
    ) {
        self.contentHandler = contentHandler
        bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)

        // B4 (security P1): the plaintext `beep_data` payload path is gated
        // off. send-signal-push intentionally does NOT include `beep_data`
        // today; turning this back on requires APNs payload encryption +
        // shared Keychain key so sender nickname / code don't end up on the
        // lock screen or in iCloud device backups. Until then we only refresh
        // timelines from the App-Group UserDefaults the host app writes.
        if request.content.userInfo["beep_data"] != nil {
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }

        if let bestAttemptContent = bestAttemptContent {
            contentHandler(bestAttemptContent)
        }
    }

    override func serviceExtensionTimeWillExpire() {
        if let contentHandler = contentHandler,
           let bestAttemptContent = bestAttemptContent {
            contentHandler(bestAttemptContent)
        }
    }
}
