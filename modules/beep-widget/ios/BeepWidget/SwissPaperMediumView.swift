import SwiftUI
import WidgetKit

struct SwissPaperMediumView: View {
    let code: String
    let fromName: String
    let time: String          // "HH:mm"
    let indexNo: String       // "04"
    let isNew: Bool

    private let skin = BeepSkin.swissPaper

    var body: some View {
        VStack(spacing: 0) {
            // Top row: title + decoration
            HStack(spacing: 0) {
                topLeftCell
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .overlay(verticalRule, alignment: .trailing)

                decorationCell
                    .frame(width: 96, maxHeight: .infinity)
            }
            .frame(maxHeight: .infinity)
            .overlay(horizontalRule, alignment: .bottom)

            // Bottom row: code + time
            HStack(spacing: 0) {
                codeCell
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                    .overlay(verticalRule, alignment: .trailing)

                timeCell
                    .frame(width: 96, maxHeight: .infinity)
            }
            .frame(height: 50)
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
    }

    // MARK: - Cells

    private var topLeftCell: some View {
        VStack(alignment: .leading, spacing: 0) {
            VStack(alignment: .leading, spacing: -2) {
                Text("Incoming")
                    .font(.custom(skin.displayFont, size: 22))
                    .fontWeight(.heavy)
                    .foregroundColor(skin.ink)
                    .lineLimit(1)
                Text("Beep")
                    .font(.custom(skin.displayItalicFont, size: 22))
                    .foregroundColor(skin.ink)
                    .italic()
                    .lineLimit(1)
            }

            Spacer(minLength: 0)

            Text("FROM · \(fromName) · N°\(indexNo)")
                .font(.custom(skin.monoFont, size: 9))
                .tracking(1.4)
                .foregroundColor(skin.mute)
                .textCase(.uppercase)
                .lineLimit(1)
        }
        .padding(12)
    }

    private var decorationCell: some View {
        DotCircleView(color: skin.ink, paper: skin.paper, size: 72)
            .padding(8)
    }

    private var codeCell: some View {
        HStack(spacing: 12) {
            Text(indexNo)
                .font(.custom(skin.monoBoldFont, size: 10))
                .foregroundColor(skin.ink)
                .frame(width: 22, height: 22)
                .overlay(
                    Rectangle().stroke(skin.ink, lineWidth: skin.ruleWidth)
                )

            Text(code)
                .font(.custom(skin.monoMediumFont, size: 26))
                .tracking(0.8)
                .foregroundColor(skin.ink)
        }
        .padding(.horizontal, 14)
    }

    private var timeCell: some View {
        HStack(spacing: 4) {
            Text(timeHour)
                .foregroundColor(skin.ink)
            Text("·")
                .foregroundColor(skin.mute)
            Text(timeMinute)
                .foregroundColor(skin.ink)
        }
        .font(.custom(skin.monoFont, size: 12))
        .tracking(1.2)
    }

    // MARK: - Rules

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

    // MARK: - Time parsing

    private var timeHour: String {
        time.split(separator: ":").first.map(String.init) ?? ""
    }

    private var timeMinute: String {
        time.split(separator: ":").dropFirst().first.map(String.init) ?? ""
    }
}
