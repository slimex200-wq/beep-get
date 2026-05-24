import Foundation

struct WidgetMessage: Codable {
    let kind: String?
    let code: String
    let senderNickname: String
    let senderBeepId: String
    let messageId: String
    let receivedAt: String
    let isRead: Bool
    let teaser: WidgetSignalTeaser?
    let actions: WidgetActions?

    init(
        kind: String? = "beep",
        code: String,
        senderNickname: String,
        senderBeepId: String,
        messageId: String,
        receivedAt: String,
        isRead: Bool,
        teaser: WidgetSignalTeaser? = nil,
        actions: WidgetActions? = nil
    ) {
        self.kind = kind
        self.code = code
        self.senderNickname = senderNickname
        self.senderBeepId = senderBeepId
        self.messageId = messageId
        self.receivedAt = receivedAt
        self.isRead = isRead
        self.teaser = teaser
        self.actions = actions
    }
}

struct WidgetSignalTeaser: Codable {
    let durationMs: Int
    let thumbnailUri: String?
    let stripFrameUris: [String]?
}

struct WidgetActionLink: Codable {
    let code: String
    let url: String
}

struct WidgetActions: Codable {
    let openReplyRoomUrl: String
    let confirmUrl: String
    let saveUrl: String
    let quickReplyUrls: [WidgetActionLink]
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
    // v7.A stack meta. Optional so older JS bundles without these fields
    // (pre-build-24) still decode without crashing.
    let totalReceived: Int?
    let newCount: Int?

    // Explicit init with defaults so existing callers that pre-date v7.A
    // (e.g. WidgetData(latestMessage: nil, recentSenders: [])) keep
    // compiling without having to touch every call site.
    init(
        latestMessage: WidgetMessage?,
        recentSenders: [RecentSender],
        totalReceived: Int? = nil,
        newCount: Int? = nil
    ) {
        self.latestMessage = latestMessage
        self.recentSenders = recentSenders
        self.totalReceived = totalReceived
        self.newCount = newCount
    }
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
                kind: payload["kind"] as? String ?? "beep",
                code: code,
                senderNickname: nickname,
                senderBeepId: beepId,
                messageId: messageId,
                receivedAt: payload["receivedAt"] as? String ?? ISO8601DateFormatter().string(from: Date()),
                isRead: false,
                actions: Self.actions(for: messageId)
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

    private static func actions(for messageId: String) -> WidgetActions {
        let encoded = messageId.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? messageId
        return WidgetActions(
            openReplyRoomUrl: "beepget://reply/\(encoded)",
            confirmUrl: "beepget://signal/\(encoded)/confirm",
            saveUrl: "beepget://signal/\(encoded)/save",
            quickReplyUrls: [
                WidgetActionLink(code: "8282", url: "beepget://signal/\(encoded)/quick-reply/8282")
            ]
        )
    }
}
