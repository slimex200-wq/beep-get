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
        .padding(10)
        .overlay(
            RoundedRectangle(cornerRadius: skin.innerRadius, style: .continuous)
                .stroke(skin.ink, lineWidth: skin.ruleWidth)
                .padding(10)
        )
        .beepWidgetBackground(skin.paper)
        .widgetURL(actionURL(openUrl))
    }

    // ===== Beep =====
    private var beepBody: some View {
        VStack(spacing: 0) {
            HStack {
                Text("Incoming")
                    .font(.custom(skin.monoBoldFont, size: 9))
                    .tracking(1.2)
                    .foregroundColor(skin.mute)
                    .textCase(.uppercase)
                Text("Beep")
                    .font(.custom(skin.displayFont, size: 13))
                    .fontWeight(.heavy)
                    .foregroundColor(skin.ink)

                Spacer()

                Text(time)
                    .font(.custom(skin.monoFont, size: 10))
                    .tracking(0.6)
                    .foregroundColor(skin.mute)
            }
            .padding(.horizontal, 14)
            .padding(.top, 14)
            .padding(.bottom, 6)

            Spacer(minLength: 0)

            VStack(spacing: 4) {
                Text(code)
                    .font(.custom(skin.monoBoldFont, size: 38))
                    .tracking(1)
                    .foregroundColor(skin.ink)
                    .lineLimit(1)

                HStack(spacing: 4) {
                    Text("FROM.")
                        .font(.custom(skin.monoFont, size: 9))
                        .tracking(1.4)
                        .foregroundColor(skin.mute)
                        .textCase(.uppercase)
                    Text(fromName)
                        .font(.custom(skin.monoBoldFont, size: 14))
                        .tracking(0.4)
                        .foregroundColor(skin.ink)
                        .lineLimit(1)
                }
            }
            .frame(maxWidth: .infinity)

            Spacer(minLength: 0)

            HStack {
                Text("NO.\(indexNo)")
                    .font(.custom(skin.monoFont, size: 10))
                    .tracking(1.2)
                    .foregroundColor(skin.mute)

                Spacer()

                if isNew {
                    Circle()
                        .fill(skin.accent)
                        .frame(width: 9, height: 9)
                }
            }
            .padding(.horizontal, 14)
            .padding(.bottom, 12)
        }
    }

    // ===== Blink =====
    private var blinkBody: some View {
        VStack(spacing: 6) {
            HStack {
                HStack(spacing: 4) {
                    Text("Incoming")
                        .font(.custom(skin.monoBoldFont, size: 9))
                        .tracking(1.2)
                        .foregroundColor(skin.mute)
                        .textCase(.uppercase)
                    Text("Blink")
                        .font(.custom(skin.displayItalicFont, size: 13))
                        .italic()
                        .foregroundColor(skin.ink)
                }

                Spacer()

                Text(time)
                    .font(.custom(skin.monoFont, size: 10))
                    .tracking(0.6)
                    .foregroundColor(skin.mute)
            }

            blinkStrip

            HStack(alignment: .firstTextBaseline) {
                Text(code)
                    .font(.custom(skin.monoBoldFont, size: 22))
                    .tracking(1)
                    .foregroundColor(skin.ink)
                    .lineLimit(1)

                Spacer()

                Text(fromName)
                    .font(.custom(skin.monoBoldFont, size: 12))
                    .tracking(0.4)
                    .foregroundColor(skin.ink)
                    .lineLimit(1)
            }
        }
        .padding(14)
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
                .frame(maxWidth: .infinity, maxHeight: 56)
                .clipped()
                .overlay(
                    RoundedRectangle(cornerRadius: 3, style: .continuous)
                        .stroke(skin.ink, lineWidth: skin.ruleWidth)
                )
                .clipShape(RoundedRectangle(cornerRadius: 3, style: .continuous))
            }
        }
        .frame(height: 56)
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
