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

    private let skin = BeepSkin.swissPaper

    var body: some View {
        Group {
            if kind == "blink" {
                blinkBody
            } else {
                beepBody
            }
        }
        .beepWidgetBackground(skin.paper)
        .widgetURL(actionURL(openUrl))
    }

    private var hDivider: some View {
        Rectangle().fill(skin.ink).frame(height: skin.ruleWidth)
    }

    // ===== Beep =====
    private var beepBody: some View {
        VStack(spacing: 0) {
            HStack {
                Text("Beep")
                    .font(.custom(skin.displayFont, size: 17))
                    .fontWeight(.heavy)
                    .foregroundColor(skin.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)

                Spacer()

                Text(time)
                    .font(.custom(skin.monoFont, size: 10))
                    .tracking(0.6)
                    .foregroundColor(skin.mute)
                    .lineLimit(1)
                    .minimumScaleFactor(0.85)
            }
            .padding(.horizontal, 14)
            .padding(.top, 12)
            .padding(.bottom, 8)
            .overlay(alignment: .bottom) { hDivider }

            VStack(spacing: 6) {
                Spacer(minLength: 0)
                Text(code)
                    .font(.custom(skin.monoBoldFont, size: 44))
                    .tracking(1)
                    .foregroundColor(skin.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)

                HStack(spacing: 4) {
                    Text("FROM.")
                        .font(.custom(skin.monoFont, size: 9))
                        .tracking(1.4)
                        .foregroundColor(skin.mute)
                        .textCase(.uppercase)
                    Text(fromName)
                        .font(.custom(skin.monoBoldFont, size: 12))
                        .tracking(0.4)
                        .foregroundColor(skin.ink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                }
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            HStack {
                Text("NO.\(indexNo)")
                    .font(.custom(skin.monoFont, size: 10))
                    .tracking(1.2)
                    .foregroundColor(skin.mute)
                    .lineLimit(1)

                Spacer()

                if isNew {
                    Circle()
                        .fill(skin.accent)
                        .frame(width: 8, height: 8)
                }
            }
            .padding(.horizontal, 14)
            .padding(.top, 8)
            .padding(.bottom, 10)
            .overlay(alignment: .top) { hDivider }
        }
    }

    // ===== Blink =====
    private var blinkBody: some View {
        VStack(spacing: 0) {
            HStack {
                Text("Blink")
                    .font(.custom(skin.displayItalicFont, size: 18))
                    .italic()
                    .foregroundColor(skin.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)

                Spacer()

                Text(time)
                    .font(.custom(skin.monoFont, size: 10))
                    .tracking(0.6)
                    .foregroundColor(skin.mute)
                    .lineLimit(1)
                    .minimumScaleFactor(0.85)
            }
            .padding(.horizontal, 14)
            .padding(.top, 12)
            .padding(.bottom, 8)
            .overlay(alignment: .bottom) { hDivider }

            blinkStrip
                .padding(.horizontal, 10)
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity, maxHeight: .infinity)

            HStack(alignment: .firstTextBaseline) {
                Text(code)
                    .font(.custom(skin.monoBoldFont, size: 20))
                    .tracking(1)
                    .foregroundColor(skin.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)

                Spacer()

                Text(fromName)
                    .font(.custom(skin.monoBoldFont, size: 12))
                    .tracking(0.4)
                    .foregroundColor(skin.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            .padding(.horizontal, 14)
            .padding(.top, 8)
            .padding(.bottom, 10)
            .overlay(alignment: .top) { hDivider }
        }
    }

    private var blinkStrip: some View {
        HStack(spacing: 3) {
            ForEach(0..<3, id: \.self) { index in
                let uri = index < stripFrameUris.count ? stripFrameUris[index] : ""
                Group {
                    if let url = URL(string: uri), !uri.isEmpty {
                        AsyncImage(url: url) { phase in
                            switch phase {
                            case .success(let image):
                                image.resizable().scaledToFill()
                            default:
                                stripPlaceholder
                            }
                        }
                    } else {
                        stripPlaceholder
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

    private var stripPlaceholder: some View {
        LinearGradient(
            gradient: Gradient(colors: [Color(red: 0.84, green: 0.78, blue: 0.70), Color(red: 0.70, green: 0.62, blue: 0.51)]),
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    private func actionURL(_ raw: String?) -> URL {
        URL(string: raw ?? "") ?? URL(string: "beepget://today")!
    }
}
