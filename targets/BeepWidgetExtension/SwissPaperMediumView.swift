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
        .overlay(alignment: .topTrailing) {
            if isNew {
                Circle()
                    .fill(skin.accent)
                    .frame(width: 8, height: 8)
                    .padding(.top, 14)
                    .padding(.trailing, 14)
            }
        }
    }

    private var hDivider: some View {
        Rectangle().fill(skin.ink).frame(height: skin.ruleWidth)
    }
    private var vDivider: some View {
        Rectangle().fill(skin.ink).frame(width: skin.ruleWidth)
    }

    // ===== Beep =====
    private var beepBody: some View {
        VStack(spacing: 0) {
            head(kindLabel: "Beep", italic: false)
            HStack(spacing: 0) {
                VStack {
                    Spacer(minLength: 0)
                    Text(code)
                        .font(.custom(skin.monoBoldFont, size: 54))
                        .tracking(1.2)
                        .foregroundColor(skin.ink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.5)
                    Spacer(minLength: 0)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding(.horizontal, 16)
                .overlay(alignment: .trailing) { vDivider }

                VStack(alignment: .leading, spacing: 4) {
                    Text("FROM.")
                        .font(.custom(skin.monoFont, size: 9))
                        .tracking(1.4)
                        .foregroundColor(skin.mute)
                        .textCase(.uppercase)
                    Text(fromName)
                        .font(.custom(skin.monoBoldFont, size: 16))
                        .tracking(0.5)
                        .foregroundColor(skin.ink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.6)
                }
                .frame(width: 128, alignment: .leading)
                .padding(.horizontal, 14)
            }
        }
    }

    // ===== Blink =====
    private var blinkBody: some View {
        VStack(spacing: 0) {
            head(kindLabel: "Blink", italic: true)
            HStack(spacing: 0) {
                VStack(alignment: .leading, spacing: 6) {
                    Spacer(minLength: 0)
                    Text(code)
                        .font(.custom(skin.monoBoldFont, size: 34))
                        .tracking(1)
                        .foregroundColor(skin.ink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.6)

                    HStack(spacing: 5) {
                        Text("FROM")
                            .font(.custom(skin.monoFont, size: 9))
                            .tracking(1.4)
                            .foregroundColor(skin.mute)
                            .textCase(.uppercase)
                        Text(fromName)
                            .font(.custom(skin.monoBoldFont, size: 11))
                            .tracking(0.5)
                            .foregroundColor(skin.ink)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                    }

                    Text("2.0s · MUTE")
                        .font(.custom(skin.monoFont, size: 9))
                        .tracking(1.2)
                        .foregroundColor(skin.mute)
                        .lineLimit(1)
                    Spacer(minLength: 0)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 16)
                .overlay(alignment: .trailing) { vDivider }

                blinkStrip
                    .padding(10)
                    .frame(width: 200)
            }
        }
    }

    private func head(kindLabel: String, italic: Bool) -> some View {
        HStack(alignment: .firstTextBaseline) {
            HStack(spacing: 5) {
                Text("Incoming")
                    .font(.custom(skin.displayFont, size: 17))
                    .fontWeight(.heavy)
                    .foregroundColor(skin.ink)
                if italic {
                    Text(kindLabel)
                        .font(.custom(skin.displayItalicFont, size: 17))
                        .italic()
                        .foregroundColor(skin.ink)
                } else {
                    Text(kindLabel)
                        .font(.custom(skin.displayFont, size: 17))
                        .fontWeight(.heavy)
                        .foregroundColor(skin.ink)
                }
            }
            .lineLimit(1)
            .minimumScaleFactor(0.7)

            Spacer()

            Text("NO.\(indexNo) · \(time)")
                .font(.custom(skin.monoBoldFont, size: 11))
                .tracking(1.2)
                .foregroundColor(skin.ink)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .padding(.horizontal, 16)
        .padding(.top, 12)
        .padding(.bottom, 10)
        .overlay(alignment: .bottom) { hDivider }
    }

    private var blinkStrip: some View {
        HStack(spacing: 4) {
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
            gradient: Gradient(colors: [Color(red: 0.84, green: 0.78, blue: 0.70), Color(red: 0.66, green: 0.58, blue: 0.47)]),
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    private func actionURL(_ raw: String?) -> URL {
        URL(string: raw ?? "") ?? URL(string: "beepget://today")!
    }
}
