import SwiftUI
import UIKit
import WidgetKit

struct SwissPaperMediumView: View {
    let kind: String
    let code: String
    let fromName: String
    let time: String
    let indexNo: String
    let isNew: Bool
    let hasBlinkPreview: Bool
    let stripFrameUris: [String]
    let openUrl: String?
    var totalReceived: Int = 0
    var newCount: Int = 0

    private let skin = BeepSkin.swissPaper

    var body: some View {
        GeometryReader { proxy in
            let stripHeight = teaserStripHeight(for: proxy.size.height)

            VStack(spacing: 0) {
                head

                HStack(spacing: 0) {
                    numberBlock
                        .padding(.leading, 16)
                        .padding(.trailing, 12)
                        .frame(width: max(CGFloat(96), min(CGFloat(116), proxy.size.width * 0.30)), maxHeight: .infinity, alignment: .leading)
                        .layoutPriority(1)
                        .overlay(alignment: .trailing) { vDivider }

                    VStack(alignment: .leading, spacing: 8) {
                        HStack(alignment: .firstTextBaseline) {
                            Text("SIGNAL SLOTS")
                                .font(.custom(skin.monoFont, size: 9))
                                .tracking(1.2)
                                .foregroundColor(skin.mute)
                                .lineLimit(1)
                                .minimumScaleFactor(0.75)

                            Spacer(minLength: 8)

                            Text(statusText)
                                .font(.custom(skin.monoBoldFont, size: 10))
                                .tracking(1.1)
                                .foregroundColor(newCount > 0 || isNew ? skin.accent : skin.mute)
                                .lineLimit(1)
                                .minimumScaleFactor(0.7)
                        }

                        Spacer(minLength: 0)

                        SignalSlotStrip(frameUris: kind == "blink" ? stripFrameUris : [], skin: skin, spacing: 6)
                            .frame(maxWidth: .infinity)
                            .frame(height: stripHeight)
                            .layoutPriority(2)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                    .layoutPriority(2)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .frame(width: proxy.size.width, height: proxy.size.height, alignment: .topLeading)
        }
        .beepWidgetBackground(skin.paper)
        .widgetURL(actionURL(openUrl))
    }

    private var head: some View {
        HStack(alignment: .firstTextBaseline, spacing: 8) {
            HStack(spacing: 5) {
                Text("Incoming")
                    .font(.custom(skin.displayFont, size: 17))
                    .fontWeight(.heavy)
                    .foregroundColor(skin.ink)

                kindTitle
            }
            .lineLimit(1)
            .minimumScaleFactor(0.7)
            .layoutPriority(2)

            Spacer(minLength: 8)

            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text(headMetaText)
                    .font(.custom(skin.monoBoldFont, size: 11))
                    .tracking(1)
                    .foregroundColor(skin.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.65)

                if newCount > 0 {
                    Text("+\(newCount) NEW")
                        .font(.custom(skin.monoBoldFont, size: 10))
                        .tracking(1.1)
                        .foregroundColor(skin.accent)
                        .lineLimit(1)
                        .minimumScaleFactor(0.75)
                        .layoutPriority(1)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.top, 12)
        .padding(.bottom, 10)
        .overlay(alignment: .bottom) { hDivider }
    }

    @ViewBuilder
    private var kindTitle: some View {
        if kind == "blink" {
            Text("Blink")
                .font(.custom(skin.displayItalicFont, size: 17))
                .italic()
                .foregroundColor(skin.ink)
        } else {
            Text("Beep")
                .font(.custom(skin.displayFont, size: 17))
                .fontWeight(.heavy)
                .foregroundColor(skin.ink)
        }
    }

    private var numberBlock: some View {
        VStack(alignment: .leading, spacing: 6) {
            Spacer(minLength: 0)

            Text(code)
                .font(.custom(skin.monoBoldFont, size: 36))
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
                    .font(.custom(skin.monoBoldFont, size: 11))
                    .tracking(0.4)
                    .foregroundColor(skin.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.65)
            }

            Text(kind == "blink" ? "2.0s - MUTE" : "PRIVATE SIGNAL")
                .font(.custom(skin.monoFont, size: 9))
                .tracking(1.1)
                .foregroundColor(skin.mute)
                .lineLimit(1)
                .minimumScaleFactor(0.65)

            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }

    private var hDivider: some View {
        Rectangle().fill(skin.ink).frame(height: skin.ruleWidth)
    }

    private var vDivider: some View {
        Rectangle().fill(skin.ink).frame(width: skin.ruleWidth)
    }

    private func teaserStripHeight(for widgetHeight: CGFloat) -> CGFloat {
        min(CGFloat(56), max(CGFloat(38), widgetHeight * 0.34))
    }

    private var headMetaText: String {
        if totalReceived > 1 {
            return "NO.\(indexNo) OF \(totalReceived) · \(time)"
        }
        return "NO.\(indexNo) · \(time)"
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

struct SignalSlotStrip: View {
    let frameUris: [String]
    let skin: BeepSkin
    var spacing: CGFloat = 6

    var body: some View {
        HStack(spacing: spacing) {
            ForEach(0..<3, id: \.self) { index in
                let uri = index < frameUris.count ? frameUris[index] : ""
                Group {
                    if uri.hasPrefix("data:image") {
                        DataBackedImage(uri: uri, skin: skin)
                    } else if let url = URL(string: uri), !uri.isEmpty {
                        AsyncImage(url: url) { phase in
                            switch phase {
                            case .success(let image):
                                image.resizable().scaledToFill()
                            default:
                                emptySlot
                            }
                        }
                    } else {
                        emptySlot
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .clipped()
                .overlay(
                    Rectangle()
                        .stroke(skin.ink, lineWidth: skin.ruleWidth)
                )
            }
        }
    }

    private var emptySlot: some View {
        ZStack {
            Color(hex: "#E7D9C8")
            Rectangle()
                .fill(skin.ink.opacity(0.08))
                .frame(height: 1)
                .rotationEffect(.degrees(-16))
        }
    }
}

struct DataBackedImage: View {
    let uri: String
    let skin: BeepSkin

    var body: some View {
        if let image = decodeImage(uri) {
            Image(uiImage: image)
                .resizable()
                .scaledToFill()
        } else {
            emptySlot
        }
    }

    private func decodeImage(_ uri: String) -> UIImage? {
        guard let markerRange = uri.range(of: "base64,") else {
            return nil
        }
        let encoded = String(uri[markerRange.upperBound...])
        guard let data = Data(base64Encoded: encoded) else {
            return nil
        }
        return UIImage(data: data)
    }

    private var emptySlot: some View {
        ZStack {
            Color(hex: "#E7D9C8")
            Rectangle()
                .fill(skin.ink.opacity(0.08))
                .frame(height: 1)
                .rotationEffect(.degrees(-16))
        }
    }
}

#if DEBUG
struct SwissPaperMediumView_Previews: PreviewProvider {
    static var previews: some View {
        SwissPaperMediumView(
            kind: "blink",
            code: "8282",
            fromName: "Beepy",
            time: "18:05",
            indexNo: "01",
            isNew: true,
            hasBlinkPreview: true,
            stripFrameUris: [],
            openUrl: nil,
            totalReceived: 2,
            newCount: 2
        )
        .previewContext(WidgetPreviewContext(family: .systemMedium))
        .previewDisplayName("Beep Get Medium")
    }
}
#endif
