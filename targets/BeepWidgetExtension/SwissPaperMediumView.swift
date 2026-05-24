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
            HStack(alignment: .top) {
                HStack(spacing: 5) {
                    Text("Incoming")
                        .font(.custom(skin.monoBoldFont, size: 10))
                        .tracking(1.4)
                        .foregroundColor(skin.mute)
                        .textCase(.uppercase)
                    Text("Beep")
                        .font(.custom(skin.displayFont, size: 17))
                        .fontWeight(.heavy)
                        .foregroundColor(skin.ink)
                }

                Spacer()

                Text("NO.\(indexNo)")
                    .font(.custom(skin.monoBoldFont, size: 11))
                    .tracking(1.2)
                    .foregroundColor(skin.ink)
            }
            .padding(.horizontal, 18)
            .padding(.top, 16)

            Spacer(minLength: 0)

            HStack(alignment: .firstTextBaseline, spacing: 18) {
                Text(code)
                    .font(.custom(skin.monoBoldFont, size: 46))
                    .tracking(1)
                    .foregroundColor(skin.ink)
                    .lineLimit(1)

                VStack(alignment: .leading, spacing: 2) {
                    Text("FROM.")
                        .font(.custom(skin.monoFont, size: 9))
                        .tracking(1.4)
                        .foregroundColor(skin.mute)
                        .textCase(.uppercase)
                    Text(fromName)
                        .font(.custom(skin.monoBoldFont, size: 18))
                        .tracking(0.4)
                        .foregroundColor(skin.ink)
                        .lineLimit(1)
                }

                Spacer()
            }
            .padding(.horizontal, 18)

            Spacer(minLength: 0)

            HStack {
                Text("TAP TO OPEN")
                    .font(.custom(skin.monoFont, size: 9))
                    .tracking(1.4)
                    .foregroundColor(skin.mute)
                    .textCase(.uppercase)

                Spacer()

                if isNew {
                    Circle()
                        .fill(skin.accent)
                        .frame(width: 8, height: 8)
                        .padding(.trailing, 8)
                }

                Text(time)
                    .font(.custom(skin.monoBoldFont, size: 12))
                    .tracking(1.4)
                    .foregroundColor(skin.ink)
            }
            .padding(.horizontal, 18)
            .padding(.bottom, 16)
        }
    }

    // ===== Blink =====
    private var blinkBody: some View {
        HStack(alignment: .top, spacing: 14) {
            VStack(alignment: .leading, spacing: 0) {
                HStack(spacing: 5) {
                    Text("Incoming")
                        .font(.custom(skin.monoBoldFont, size: 10))
                        .tracking(1.4)
                        .foregroundColor(skin.mute)
                        .textCase(.uppercase)
                    Text("Blink")
                        .font(.custom(skin.displayItalicFont, size: 17))
                        .italic()
                        .foregroundColor(skin.ink)
                }

                Spacer(minLength: 0)

                HStack(alignment: .center, spacing: 10) {
                    Text(indexNo)
                        .font(.custom(skin.monoBoldFont, size: 11))
                        .foregroundColor(skin.ink)
                        .frame(width: 24, height: 24)
                        .overlay(Rectangle().stroke(skin.ink, lineWidth: skin.ruleWidth))

                    Text(code)
                        .font(.custom(skin.monoBoldFont, size: 32))
                        .tracking(1)
                        .foregroundColor(skin.ink)
                        .lineLimit(1)
                }

                Spacer(minLength: 0)

                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 5) {
                        Text("FROM")
                            .font(.custom(skin.monoFont, size: 9))
                            .tracking(1.4)
                            .foregroundColor(skin.mute)
                            .textCase(.uppercase)
                        Text(fromName)
                            .font(.custom(skin.monoBoldFont, size: 13))
                            .tracking(0.4)
                            .foregroundColor(skin.ink)
                            .lineLimit(1)
                    }
                    HStack(spacing: 4) {
                        Text("2.0s")
                            .font(.custom(skin.monoFont, size: 9))
                            .tracking(1.2)
                            .foregroundColor(skin.mute)
                        Text("·")
                            .foregroundColor(skin.mute)
                        Text("MUTE")
                            .font(.custom(skin.monoFont, size: 9))
                            .tracking(1.2)
                            .foregroundColor(skin.mute)
                        Text("·")
                            .foregroundColor(skin.mute)
                        Text(time)
                            .font(.custom(skin.monoBoldFont, size: 9))
                            .tracking(1.2)
                            .foregroundColor(skin.ink)
                    }
                }
            }
            .padding(.vertical, 16)
            .padding(.leading, 18)

            blinkStrip
                .frame(width: 168)
                .padding(.vertical, 16)
                .padding(.trailing, 18)
        }
        .overlay(alignment: .topTrailing) {
            if isNew {
                Circle()
                    .fill(skin.accent)
                    .frame(width: 8, height: 8)
                    .padding(.top, 18)
                    .padding(.trailing, 22)
            }
        }
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
                    RoundedRectangle(cornerRadius: 4, style: .continuous)
                        .stroke(skin.ink, lineWidth: skin.ruleWidth)
                )
                .clipShape(RoundedRectangle(cornerRadius: 4, style: .continuous))
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
