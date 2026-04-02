import Foundation

struct WidgetMessage: Codable {
    let code: String
    let senderNickname: String
    let senderBeepId: String
    let messageId: String
    let receivedAt: String
    let isRead: Bool
}

struct RecentSender: Codable {
    let nickname: String
    let beepId: String
    let lastCode: String
    let statusIcon: String
}

struct WidgetData: Codable {
    let latestMessage: WidgetMessage?
    let recentSenders: [RecentSender]
}

class BeepWidgetDataManager {
    static let suiteName = "group.com.beepget.shared"
    static let dataKey = "widget_data"

    static func load() -> WidgetData? {
        guard let defaults = UserDefaults(suiteName: suiteName),
              let jsonString = defaults.string(forKey: dataKey),
              let data = jsonString.data(using: .utf8) else {
            return nil
        }
        return try? JSONDecoder().decode(WidgetData.self, from: data)
    }

    static func updateFromPush(_ payload: [String: Any]) {
        guard let defaults = UserDefaults(suiteName: suiteName) else { return }

        // Load existing data
        var widgetData = load() ?? WidgetData(latestMessage: nil, recentSenders: [])

        // Parse push message
        if let code = payload["code"] as? String,
           let nickname = payload["senderNickname"] as? String,
           let beepId = payload["senderBeepId"] as? String,
           let messageId = payload["messageId"] as? String {
            let message = WidgetMessage(
                code: code,
                senderNickname: nickname,
                senderBeepId: beepId,
                messageId: messageId,
                receivedAt: payload["receivedAt"] as? String ?? ISO8601DateFormatter().string(from: Date()),
                isRead: false
            )
            widgetData = WidgetData(
                latestMessage: message,
                recentSenders: widgetData.recentSenders
            )
        }

        // Save
        if let encoded = try? JSONEncoder().encode(widgetData),
           let jsonString = String(data: encoded, encoding: .utf8) {
            defaults.set(jsonString, forKey: dataKey)
            defaults.synchronize()
        }
    }
}
