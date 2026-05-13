import SwiftUI
import WidgetKit

struct BeepWidgetSmallView: View {
    let entry: BeepWidgetEntry

    var body: some View {
        if let msg = entry.latestMessage {
            SwissPaperSmallView(
                kind: msg.kind ?? "beep",
                code: msg.code,
                fromName: msg.senderNickname,
                time: formatTime(msg.receivedAt),
                indexNo: formatIndex(msg),
                isNew: !msg.isRead,
                hasBlinkPreview: msg.teaser != nil,
                openUrl: msg.actions?.openReplyRoomUrl
            )
        } else {
            PlaceholderSmallView()
        }
    }

    private func formatTime(_ isoString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: isoString) else { return "--:--" }
        let displayFormatter = DateFormatter()
        displayFormatter.dateFormat = "HH:mm"
        displayFormatter.locale = Locale(identifier: "ko_KR")
        return displayFormatter.string(from: date)
    }

    private func formatIndex(_ msg: WidgetMessage) -> String {
        let suffix = String(msg.messageId.suffix(2))
        return suffix.isEmpty ? "01" : suffix
    }
}

struct PlaceholderSmallView: View {
    private let skin = BeepSkin.swissPaper

    var body: some View {
        VStack(spacing: 6) {
            Text("BEEP-GET")
                .font(.custom(skin.displayFont, size: 13))
                .fontWeight(.heavy)
                .foregroundColor(skin.ink)
            Text("Waiting")
                .font(.custom(skin.monoFont, size: 10))
                .tracking(1.2)
                .foregroundColor(skin.mute)
                .textCase(.uppercase)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(10)
        .overlay(
            RoundedRectangle(cornerRadius: skin.innerRadius, style: .continuous)
                .stroke(skin.ink, lineWidth: skin.ruleWidth)
                .padding(10)
        )
        .containerBackground(for: .widget) {
            skin.paper
        }
    }
}

struct BeepWidgetSmallWidget: Widget {
    let kind = "BeepWidgetSmall"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: BeepWidgetTimelineProvider()) { entry in
            BeepWidgetSmallView(entry: entry)
        }
        .configurationDisplayName("Beep Get")
        .description("Latest Beep or Blink code.")
        .supportedFamilies([.systemSmall])
    }
}
