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
    let stripFrameUris: [String]
    let openUrl: String?
    let newCount: Int

    private let skin = BeepSkin.swissPaper

    var body: some View {
        GeometryReader { proxy in
            VStack(alignment: .leading, spacing: 0) {
                header
                    .padding(.bottom, 7)

                hDivider

                Spacer(minLength: 7)

                Text(code)
                    .font(.custom(skin.monoBoldFont, size: 48))
                    .tracking(1)
                    .foregroundColor(skin.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.55)
                    .layoutPriority(2)

                HStack(spacing: 5) {
                    Text("FROM")
                        .font(.custom(skin.monoFont, size: 9))
                        .tracking(1.3)
                        .foregroundColor(skin.mute)
                    Text(fromName)
                        .font(.custom(skin.monoBoldFont, size: 12))
                        .tracking(0.35)
                        .foregroundColor(skin.ink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                        .layoutPriority(1)
                }

                Spacer(minLength: 8)

                SignalSlotStrip(frameUris: kind == "blink" ? stripFrameUris : [], skin: skin, spacing: 4)
                    .frame(maxWidth: .infinity)
                    .frame(height: 24)

                HStack(alignment: .firstTextBaseline) {
                    Text("NO.\(indexNo)")
                        .font(.custom(skin.monoFont, size: 8))
                        .tracking(1)
                        .foregroundColor(skin.mute)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)

                    Spacer(minLength: 8)

                    Text(statusText)
                        .font(.custom(skin.monoBoldFont, size: 9))
                        .tracking(0.9)
                        .foregroundColor(newCount > 0 || isNew ? skin.accent : skin.mute)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                        .layoutPriority(1)
                }
                .padding(.top, 6)
            }
            .padding(11)
            .frame(width: proxy.size.width, height: proxy.size.height, alignment: .topLeading)
        }
        .beepWidgetBackground(skin.paper)
        .widgetURL(actionURL(openUrl))
    }

    private var header: some View {
        HStack(alignment: .firstTextBaseline) {
            kindTitle
                .lineLimit(1)
                .minimumScaleFactor(0.75)
                .layoutPriority(1)

            Spacer(minLength: 8)

            Text(time)
                .font(.custom(skin.monoFont, size: 10))
                .tracking(0.6)
                .foregroundColor(skin.mute)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
    }

    @ViewBuilder
    private var kindTitle: some View {
        if kind == "blink" {
            Text("Blink")
                .font(.custom(skin.displayItalicFont, size: 18))
                .italic()
                .foregroundColor(skin.ink)
        } else {
            Text("Beep")
                .font(.custom(skin.displayFont, size: 17))
                .fontWeight(.heavy)
                .foregroundColor(skin.ink)
        }
    }

    private var hDivider: some View {
        Rectangle().fill(skin.ink).frame(height: skin.ruleWidth)
    }

    private var statusText: String {
        if newCount > 0 {
            return "+\(newCount) NEW"
        }
        return isNew ? "NEW" : "READ"
    }

    private func actionURL(_ raw: String?) -> URL {
        URL(string: raw ?? "") ?? URL(string: "beepget://today")!
    }
}

#if DEBUG
struct SwissPaperSmallView_Previews: PreviewProvider {
    static var previews: some View {
        SwissPaperSmallView(
            kind: "blink",
            code: "8282",
            fromName: "Beepy",
            time: "18:05",
            indexNo: "01",
            isNew: true,
            hasBlinkPreview: true,
            stripFrameUris: [],
            openUrl: nil,
            newCount: 2
        )
        .previewContext(WidgetPreviewContext(family: .systemSmall))
        .previewDisplayName("Beep Get Small")
    }
}
#endif
