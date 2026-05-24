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
                stripFrameUris: msg.teaser?.stripFrameUris ?? [],
                openUrl: msg.actions?.openReplyRoomUrl
            )
        } else {
            PlaceholderSmallView()
        }
    }

    private func formatTime(_ isoString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: isoString) {
            return formatDisplayTime(date)
        }
        let fallback = ISO8601DateFormatter()
        fallback.formatOptions = [.withInternetDateTime]
        if let date = fallback.date(from: isoString) {
            return formatDisplayTime(date)
        }
        return "--:--"
    }

    private func formatDisplayTime(_ date: Date) -> String {
        let displayFormatter = DateFormatter()
        displayFormatter.dateFormat = "HH:mm"
        displayFormatter.locale = Locale(identifier: "ko_KR")
        return displayFormatter.string(from: date)
    }

    private func formatIndex(_ msg: WidgetMessage) -> String {
        // demo signal or short id → safe default. Real signals get a 2-char
        // hex suffix from the UUID which reads better than the raw word ending.
        if msg.messageId.hasPrefix("demo-") { return "01" }
        let suffix = String(msg.messageId.suffix(2)).uppercased()
        let cleaned = suffix.filter { $0.isLetter || $0.isNumber }
        return cleaned.isEmpty ? "01" : cleaned
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
        .beepWidgetBackground(skin.paper)
    }
}

// Widget struct removed — the single BeepWidget in BeepWidget.swift now hosts
// both systemSmall and systemMedium and routes them to BeepWidgetSmallView /
// BeepWidgetMediumView through BeepWidgetEntryView.
