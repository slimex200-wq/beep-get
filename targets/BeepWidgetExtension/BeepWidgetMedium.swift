import SwiftUI
import WidgetKit

struct BeepWidgetMediumView: View {
    let entry: BeepWidgetEntry

    var body: some View {
        if let msg = entry.latestMessage {
            SwissPaperMediumView(
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
            PlaceholderMediumView()
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
        if msg.messageId.hasPrefix("demo-") { return "01" }
        let suffix = String(msg.messageId.suffix(2)).uppercased()
        let cleaned = suffix.filter { $0.isLetter || $0.isNumber }
        return cleaned.isEmpty ? "01" : cleaned
    }
}

struct PlaceholderMediumView: View {
    private let skin = BeepSkin.swissPaper

    var body: some View {
        VStack(spacing: 6) {
            Text("BEEP-GET")
                .font(.custom(skin.displayFont, size: 14))
                .fontWeight(.heavy)
                .foregroundColor(skin.ink)
            Text("Waiting for signal")
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
