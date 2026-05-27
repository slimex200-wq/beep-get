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
                openUrl: msg.actions?.openReplyRoomUrl,
                totalReceived: entry.totalReceived,
                newCount: entry.newCount
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
        GeometryReader { proxy in
            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    Text("Incoming Beep")
                        .font(.custom(skin.displayFont, size: 17))
                        .fontWeight(.heavy)
                        .foregroundColor(skin.ink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                    Spacer(minLength: 8)
                    Text("NO.-- - --:--")
                        .font(.custom(skin.monoBoldFont, size: 11))
                        .tracking(1)
                        .foregroundColor(skin.ink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                }
                .padding(.horizontal, 16)
                .padding(.top, 12)
                .padding(.bottom, 10)
                .overlay(alignment: .bottom) {
                    Rectangle().fill(skin.ink).frame(height: skin.ruleWidth)
                }

                HStack(spacing: 0) {
                    VStack(alignment: .leading, spacing: 6) {
                        Spacer(minLength: 0)
                        Text("WAIT")
                            .font(.custom(skin.monoBoldFont, size: 34))
                            .tracking(1)
                            .foregroundColor(skin.ink)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                        Text("FROM BEEP-GET")
                            .font(.custom(skin.monoFont, size: 9))
                            .tracking(1.1)
                            .foregroundColor(skin.mute)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                        Spacer(minLength: 0)
                    }
                    .padding(.leading, 16)
                    .padding(.trailing, 12)
                    .frame(width: max(CGFloat(96), min(CGFloat(116), proxy.size.width * 0.30)), alignment: .leading)
                    .frame(maxHeight: .infinity, alignment: .leading)
                    .overlay(alignment: .trailing) {
                        Rectangle().fill(skin.ink).frame(width: skin.ruleWidth)
                    }

                    SignalSlotStrip(frameUris: [], skin: skin, spacing: 6)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 12)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .frame(width: proxy.size.width, height: proxy.size.height, alignment: .topLeading)
        }
        .beepWidgetBackground(skin.paper)
    }
}

// Widget struct removed — the single BeepWidget in BeepWidget.swift now hosts
// both systemSmall and systemMedium and routes them to BeepWidgetSmallView /
// BeepWidgetMediumView through BeepWidgetEntryView.
