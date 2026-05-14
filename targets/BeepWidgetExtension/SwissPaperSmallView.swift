import SwiftUI
import WidgetKit

struct SwissPaperSmallView: View {
    let kind: String
    let code: String
    let fromName: String
    let time: String
    let indexNo: String
    let isNew: Bool
    let hasBlinkPreview: Bool
    let openUrl: String?

    private let skin = BeepSkin.swissPaper

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text(kind == "blink" ? "Blink" : "Beep")
                    .font(.custom(skin.displayFont, size: 13))
                    .fontWeight(.heavy)
                    .foregroundColor(skin.ink)

                Spacer()

                Text(time)
                    .font(.custom(skin.monoFont, size: 9))
                    .tracking(0.6)
                    .foregroundColor(skin.mute)
            }
            .padding(.horizontal, 12)
            .frame(height: 22)
            .overlay(horizontalRule, alignment: .bottom)

            ZStack {
                Text(code)
                    .font(.custom(skin.monoMediumFont, size: 30))
                    .tracking(1.2)
                    .foregroundColor(skin.ink)
                    .lineLimit(1)

                if isNew {
                    VStack {
                        HStack {
                            Spacer()
                            Circle()
                                .fill(skin.accent)
                                .frame(width: 6, height: 6)
                        }
                        Spacer()
                    }
                    .padding(.top, 10)
                    .padding(.trailing, 10)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            HStack {
                Text(fromName)
                    .font(.custom(skin.displayItalicFont, size: 12))
                    .italic()
                    .foregroundColor(skin.ink)
                    .lineLimit(1)

                Spacer()

                Text("NO.\(indexNo)")
                    .font(.custom(skin.monoFont, size: 10))
                    .tracking(0.8)
                    .foregroundColor(skin.mute)
            }
            .padding(.horizontal, 12)
            .frame(height: 28)
            .overlay(horizontalRule, alignment: .top)
        }
        .padding(10)
        .overlay(
            RoundedRectangle(cornerRadius: skin.innerRadius, style: .continuous)
                .stroke(skin.ink, lineWidth: skin.ruleWidth)
                .padding(10)
        )
        .beepWidgetBackground(skin.paper)
        .widgetURL(actionURL(openUrl))
    }

    private var horizontalRule: some View {
        Rectangle()
            .fill(skin.ink)
            .frame(height: skin.ruleWidth)
    }

    private func actionURL(_ raw: String?) -> URL {
        URL(string: raw ?? "") ?? URL(string: "beepget://today")!
    }
}
