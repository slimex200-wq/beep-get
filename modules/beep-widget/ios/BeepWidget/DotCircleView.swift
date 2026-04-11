import SwiftUI

struct DotCircleView: View {
    let color: Color
    let paper: Color
    let size: CGFloat
    let dotSpacing: CGFloat
    let dotRadius: CGFloat

    init(
        color: Color,
        paper: Color,
        size: CGFloat,
        dotSpacing: CGFloat = 7,
        dotRadius: CGFloat = 0.9
    ) {
        self.color = color
        self.paper = paper
        self.size = size
        self.dotSpacing = dotSpacing
        self.dotRadius = dotRadius
    }

    var body: some View {
        ZStack {
            Circle()
                .stroke(color, lineWidth: 1)

            Canvas { context, canvasSize in
                let rows = Int(canvasSize.height / dotSpacing) + 1
                let cols = Int(canvasSize.width / dotSpacing) + 1
                for r in 0..<rows {
                    for c in 0..<cols {
                        let x = CGFloat(c) * dotSpacing + dotSpacing / 2
                        let y = CGFloat(r) * dotSpacing + dotSpacing / 2
                        let rect = CGRect(
                            x: x - dotRadius,
                            y: y - dotRadius,
                            width: dotRadius * 2,
                            height: dotRadius * 2
                        )
                        context.fill(Path(ellipseIn: rect), with: .color(color))
                    }
                }
            }
            .padding(size * 0.08)
            .mask(Circle().padding(size * 0.08))
            .opacity(0.85)

            // center ink dot with paper halo
            Circle()
                .fill(color)
                .frame(width: size * 0.11, height: size * 0.11)
                .overlay(
                    Circle()
                        .stroke(paper, lineWidth: size * 0.035)
                )
        }
        .frame(width: size, height: size)
    }
}
