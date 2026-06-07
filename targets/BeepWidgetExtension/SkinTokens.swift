import SwiftUI

extension Color {
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        let scanner = Scanner(string: cleaned)
        var rgbValue: UInt64 = 0
        scanner.scanHexInt64(&rgbValue)
        let r = Double((rgbValue & 0xFF0000) >> 16) / 255.0
        let g = Double((rgbValue & 0x00FF00) >> 8) / 255.0
        let b = Double(rgbValue & 0x0000FF) / 255.0
        self.init(red: r, green: g, blue: b)
    }
}

struct BeepSkin: Sendable {
    let id: SkinID
    let paper: Color
    let ink: Color
    let mute: Color
    let accent: Color

    // PostScript names. Variable fonts usually expose family name for Regular axis.
    // Verify in Xcode with: UIFont.fontNames(forFamilyName: "Fraunces")
    let displayFont: String
    let displayItalicFont: String
    let monoFont: String
    let monoMediumFont: String
    let monoBoldFont: String

    let ruleWidth: CGFloat
    let outerRadius: CGFloat
    let innerRadius: CGFloat
    let decoration: Decoration

    enum SkinID: String, Sendable {
        case swissPaper = "swiss-paper"
        case riso
        case noirDeco
        case cassettePop
        case brutalist
        case pastel
    }

    enum Decoration: Sendable {
        case dotCircle
        case risoRing
        case decoGeometric
        case cassetteReel
        case hatchBar
        case petal
    }

    static let swissPaper = BeepSkin(
        id: .swissPaper,
        paper: Color(hex: "#F2E6D6"),
        ink: Color(hex: "#0A0A0A"),
        mute: Color(hex: "#5E5750"),
        accent: Color(hex: "#D8361E"),
        displayFont: "Fraunces-Regular",
        displayItalicFont: "Fraunces-Italic",
        monoFont: "IBMPlexMono",
        monoMediumFont: "IBMPlexMono-Medium",
        monoBoldFont: "IBMPlexMono-Bold",
        ruleWidth: 1.15,
        outerRadius: 22,
        innerRadius: 14,
        decoration: .dotCircle
    )

    static func from(_ payload: WidgetSkin?) -> BeepSkin {
        guard let payload else { return swissPaper }

        return BeepSkin(
            id: .swissPaper,
            paper: Color(hex: payload.paper),
            ink: Color(hex: payload.ink),
            mute: Color(hex: payload.muted),
            accent: Color(hex: payload.accent),
            displayFont: swissPaper.displayFont,
            displayItalicFont: swissPaper.displayItalicFont,
            monoFont: swissPaper.monoFont,
            monoMediumFont: swissPaper.monoMediumFont,
            monoBoldFont: swissPaper.monoBoldFont,
            ruleWidth: swissPaper.ruleWidth,
            outerRadius: swissPaper.outerRadius,
            innerRadius: swissPaper.innerRadius,
            decoration: swissPaper.decoration
        )
    }
}

extension View {
    @ViewBuilder
    func beepWidgetBackground(_ color: Color) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            self.containerBackground(for: .widget) {
                color
            }
        } else {
            self.background(color)
        }
    }
}
