import SwiftUI
import WidgetKit

struct BeepWidgetSmallView: View {
    let entry: BeepWidgetEntry

    var body: some View {
        ZStack {
            Color(hex: "#E0E0E0")

            if let msg = entry.latestMessage {
                LcdView(
                    fromName: msg.senderNickname,
                    code: msg.code,
                    time: formatTime(msg.receivedAt),
                    isNew: !msg.isRead
                )
                .padding(4)
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
                .padding(4)
            }
        }
    }
}

struct BeepWidgetSmallWidget: Widget {
    let kind = "BeepWidgetSmall"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: BeepWidgetTimelineProvider()) { entry in
            BeepWidgetSmallView(entry: entry)
        }
        .configurationDisplayName("삐삐")
        .description("마지막 수신 코드를 표시합니다")
        .supportedFamilies([.systemSmall])
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
