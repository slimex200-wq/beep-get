import SwiftUI
import WidgetKit

struct SwissPaperMediumView: View {
    let kind: String
    let code: String
    let fromName: String
    let time: String
    let indexNo: String
    let isNew: Bool
    let hasBlinkPreview: Bool
    let actions: WidgetActions?

    private let skin = BeepSkin.swissPaper

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 0) {
                topLeftCell
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .overlay(verticalRule, alignment: .trailing)

                decorationCell
                    .frame(width: 96, maxHeight: .infinity)
            }
            .frame(maxHeight: .infinity)
            .overlay(horizontalRule, alignment: .bottom)

            HStack(spacing: 0) {
                codeCell
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                    .overlay(verticalRule, alignment: .trailing)

                timeCell
                    .frame(width: 96, maxHeight: .infinity)
            }
            .frame(height: 44)

            actionRow
                .frame(height: 30)
        }
        .padding(10)
        .overlay(
            RoundedRectangle(cornerRadius: skin.innerRadius, style: .continuous)
                .stroke(skin.ink, lineWidth: skin.ruleWidth)
                .padding(10)
        )
        .containerBackground(for: .widget) {
            skin.paper
        }
        .widgetURL(actionURL(actions?.openReplyRoomUrl))
    }

    private var topLeftCell: some View {
        VStack(alignment: .leading, spacing: 0) {
            VStack(alignment: .leading, spacing: -2) {
                Text("Incoming")
                    .font(.custom(skin.displayFont, size: 20))
                    .fontWeight(.heavy)
                    .foregroundColor(skin.ink)
                    .lineLimit(1)
                Text(kind == "blink" ? "Blink" : "Beep")
                    .font(.custom(skin.displayItalicFont, size: 20))
                    .foregroundColor(skin.ink)
                    .italic()
                    .lineLimit(1)
            }

            Spacer(minLength: 0)

            Text("FROM / \(fromName) / NO.\(indexNo)")
                .font(.custom(skin.monoFont, size: 8))
                .tracking(1.2)
                .foregroundColor(skin.mute)
                .textCase(.uppercase)
                .lineLimit(1)
        }
        .padding(12)
    }

    private var decorationCell: some View {
        VStack(spacing: 6) {
            DotCircleView(color: skin.ink, paper: skin.paper, size: hasBlinkPreview ? 54 : 68)
            if hasBlinkPreview {
                Text("BLINK 2.0s")
                    .font(.custom(skin.monoBoldFont, size: 7))
                    .tracking(1)
                    .foregroundColor(skin.mute)
            }
        }
        .padding(8)
    }

    private var codeCell: some View {
        HStack(spacing: 12) {
            Text(indexNo)
                .font(.custom(skin.monoBoldFont, size: 10))
                .foregroundColor(skin.ink)
                .frame(width: 22, height: 22)
                .overlay(Rectangle().stroke(skin.ink, lineWidth: skin.ruleWidth))

            Text(code)
                .font(.custom(skin.monoMediumFont, size: 25))
                .tracking(0.8)
                .foregroundColor(skin.ink)
                .lineLimit(1)
        }
        .padding(.horizontal, 14)
    }

    private var timeCell: some View {
        HStack(spacing: 4) {
            Text(timeHour).foregroundColor(skin.ink)
            Text("/").foregroundColor(skin.mute)
            Text(timeMinute).foregroundColor(skin.ink)
        }
        .font(.custom(skin.monoFont, size: 12))
        .tracking(1.2)
    }

    private var actionRow: some View {
        HStack(spacing: 5) {
            actionChip(label: "OK", url: actions?.confirmUrl)
            if let quickReply = actions?.quickReplyUrls.first {
                actionChip(label: quickReply.code, url: quickReply.url)
            } else {
                actionChip(label: "8282", url: nil)
            }
            actionChip(label: "OPEN", url: actions?.openReplyRoomUrl, dark: true)
        }
        .padding(.horizontal, 10)
        .padding(.bottom, 8)
    }

    private func actionChip(label: String, url: String?, dark: Bool = false) -> some View {
        Link(destination: actionURL(url)) {
            Text(label)
                .font(.custom(skin.monoBoldFont, size: 8))
                .tracking(0.8)
                .foregroundColor(dark ? skin.paper : skin.ink)
                .frame(maxWidth: .infinity, minHeight: 22)
                .background(dark ? skin.ink : Color.clear)
                .overlay(
                    RoundedRectangle(cornerRadius: 5, style: .continuous)
                        .stroke(skin.ink, lineWidth: skin.ruleWidth)
                )
        }
    }

    private var verticalRule: some View {
        Rectangle()
            .fill(skin.ink)
            .frame(width: skin.ruleWidth)
    }

    private var horizontalRule: some View {
        Rectangle()
            .fill(skin.ink)
            .frame(height: skin.ruleWidth)
    }

    private var timeHour: String {
        time.split(separator: ":").first.map(String.init) ?? ""
    }

    private var timeMinute: String {
        time.split(separator: ":").dropFirst().first.map(String.init) ?? ""
    }

    private func actionURL(_ raw: String?) -> URL {
        URL(string: raw ?? "") ?? URL(string: "beepget://today")!
    }
}
