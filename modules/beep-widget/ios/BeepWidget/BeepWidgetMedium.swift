import SwiftUI
import WidgetKit

struct BeepWidgetMediumView: View {
    let entry: BeepWidgetEntry

    var body: some View {
        ZStack {
            Color(hex: "#E0E0E0")

            HStack(spacing: 4) {
                // Left: LCD display
                if let msg = entry.latestMessage {
                    LcdView(
                        fromName: msg.senderNickname,
                        code: msg.code,
                        time: formatTime(msg.receivedAt),
                        isNew: !msg.isRead
                    )
                } else {
                    VStack(spacing: 8) {
                        Text("BEEP-GET")
                            .font(.system(size: 14, weight: .bold, design: .monospaced))
                            .foregroundColor(Color(hex: "#6A6A8A"))
                        Text("수신 대기 중...")
                            .font(.system(size: 12, design: .monospaced))
                            .foregroundColor(Color(hex: "#8A8A9A"))
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color(hex: "#C8D8C0"))
                    .cornerRadius(8)
                }

                // Right: Recent senders
                FriendListView(senders: entry.recentSenders)
                    .frame(width: 100)
            }
            .padding(4)
        }
    }
}

struct BeepWidgetMediumWidget: Widget {
    let kind = "BeepWidgetMedium"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: BeepWidgetTimelineProvider()) { entry in
            BeepWidgetMediumView(entry: entry)
        }
        .configurationDisplayName("삐삐 (넓게)")
        .description("수신 코드 + 최근 친구 목록")
        .supportedFamilies([.systemMedium])
    }
}

private func formatTime(_ isoString: String) -> String {
    let formatter = ISO8601DateFormatter()
    guard let date = formatter.date(from: isoString) else { return "" }
    let displayFormatter = DateFormatter()
    displayFormatter.dateFormat = "a h:mm"
    displayFormatter.locale = Locale(identifier: "ko_KR")
    return displayFormatter.string(from: date)
}
