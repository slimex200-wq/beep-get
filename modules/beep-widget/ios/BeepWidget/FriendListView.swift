import SwiftUI

struct FriendListView: View {
    let senders: [RecentSender]

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("RECENT")
                .font(.system(size: 10, weight: .bold, design: .monospaced))
                .foregroundColor(Color(hex: "#8A8A9A"))

            if senders.isEmpty {
                Text("-")
                    .font(.system(size: 12, design: .monospaced))
                    .foregroundColor(Color(hex: "#8A8A9A"))
            } else {
                ForEach(senders, id: \.beepId) { sender in
                    VStack(alignment: .leading, spacing: 1) {
                        Text(sender.nickname)
                            .font(.system(size: 12, design: .monospaced))
                            .foregroundColor(Color(hex: "#1A4A1A"))
                            .lineLimit(1)
                        Text(sender.lastCode)
                            .font(.system(size: 10, design: .monospaced))
                            .foregroundColor(Color(hex: "#3A7A3A"))
                            .lineLimit(1)
                    }
                    .padding(.vertical, 2)
                }
            }

            Spacer()
        }
        .padding(8)
        .background(Color(hex: "#E0E0E0"))
        .cornerRadius(8)
    }
}
