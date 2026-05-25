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
                openUrl: msg.actions?.openReplyRoomUrl,
                newCount: entry.newCount
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
        GeometryReader { proxy in
            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .firstTextBaseline) {
                    Text("Beep")
                        .font(.custom(skin.displayFont, size: 17))
                        .fontWeight(.heavy)
                        .foregroundColor(skin.ink)
                    Spacer(minLength: 8)
                    Text("--:--")
                        .font(.custom(skin.monoFont, size: 10))
                        .tracking(0.6)
                        .foregroundColor(skin.mute)
                }
                .padding(.bottom, 7)

                Rectangle().fill(skin.ink).frame(height: skin.ruleWidth)

                Spacer(minLength: 8)

                Text("WAIT")
                    .font(.custom(skin.monoBoldFont, size: 35))
                    .tracking(1)
                    .foregroundColor(skin.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)

                HStack(spacing: 5) {
                    Text("FROM")
                        .font(.custom(skin.monoFont, size: 9))
                        .tracking(1.2)
                        .foregroundColor(skin.mute)
                    Text("BEEP-GET")
                        .font(.custom(skin.monoBoldFont, size: 11))
                        .tracking(0.3)
                        .foregroundColor(skin.ink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                }

                Spacer(minLength: 8)

                SignalSlotStrip(frameUris: [], skin: skin, spacing: 4)
                    .frame(maxWidth: .infinity)
                    .frame(height: 24)

                HStack {
                    Text("SLOTS")
                        .font(.custom(skin.monoFont, size: 8))
                        .tracking(1)
                        .foregroundColor(skin.mute)
                    Spacer(minLength: 8)
                    Text("WAITING")
                        .font(.custom(skin.monoBoldFont, size: 9))
                        .tracking(0.9)
                        .foregroundColor(skin.mute)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                }
                .padding(.top, 6)
            }
            .padding(11)
            .frame(width: proxy.size.width, height: proxy.size.height, alignment: .topLeading)
        }
        .beepWidgetBackground(skin.paper)
    }
}

// Widget struct removed — the single BeepWidget in BeepWidget.swift now hosts
// both systemSmall and systemMedium and routes them to BeepWidgetSmallView /
// BeepWidgetMediumView through BeepWidgetEntryView.
