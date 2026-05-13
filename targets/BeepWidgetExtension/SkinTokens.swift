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
        paper: Color(hex: "#F2EDE4"),
        ink: Color(hex: "#0A0A0A"),
        mute: Color(hex: "#6B6560"),
        accent: Color(hex: "#D8361E"),
        displayFont: "Fraunces-Regular",
        displayItalicFont: "Fraunces-Italic",
        monoFont: "IBMPlexMono",
        monoMediumFont: "IBMPlexMono-Medium",
        monoBoldFont: "IBMPlexMono-Bold",
        ruleWidth: 1,
        outerRadius: 22,
        innerRadius: 14,
        decoration: .dotCircle
    )
}
