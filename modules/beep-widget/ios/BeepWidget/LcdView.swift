import SwiftUI

struct LcdView: View {
    let fromName: String
    let code: String
    let time: String
    let isNew: Bool

    var body: some View {
        VStack(spacing: 4) {
            HStack {
                Text("FROM: \(fromName)")
                    .font(.system(size: 12, design: .monospaced))
                    .foregroundColor(Color(hex: "#3A7A3A"))
                    .opacity(0.8)
                Spacer()
                if isNew {
                    Text("NEW")
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .foregroundColor(Color(hex: "#C47080"))
                }
            }

            Text(code)
                .font(.system(size: 36, weight: .bold, design: .monospaced))
                .foregroundColor(Color(hex: "#1A4A1A"))
                .tracking(4)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 4)

            HStack {
                Spacer()
                Text(time)
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundColor(Color(hex: "#3A7A3A"))
                    .opacity(0.6)
            }
        }
        .padding(12)
        .background(Color(hex: "#C8D8C0"))
        .cornerRadius(8)
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        let scanner = Scanner(string: hex)
        var rgbValue: UInt64 = 0
        scanner.scanHexInt64(&rgbValue)
        let r = Double((rgbValue & 0xFF0000) >> 16) / 255.0
        let g = Double((rgbValue & 0x00FF00) >> 8) / 255.0
        let b = Double(rgbValue & 0x0000FF) / 255.0
        self.init(red: r, green: g, blue: b)
    }
}
