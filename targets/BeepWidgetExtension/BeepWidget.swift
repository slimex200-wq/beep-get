import WidgetKit
import SwiftUI

struct BeepWidgetEntry: TimelineEntry {
    let date: Date
    let latestMessage: WidgetMessage?
    let recentSenders: [RecentSender]
}

struct BeepWidgetTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> BeepWidgetEntry {
        BeepWidgetEntry(
            date: .now,
            latestMessage: WidgetMessage(
                code: "012486",
                senderNickname: "BEEP",
                senderBeepId: "00000000",
                messageId: "",
                receivedAt: "",
                isRead: false
            ),
            recentSenders: []
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (BeepWidgetEntry) -> Void) {
        let data = BeepWidgetDataManager.load()
        let entry = BeepWidgetEntry(
            date: .now,
            latestMessage: data?.latestMessage,
            recentSenders: data?.recentSenders ?? []
        )
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<BeepWidgetEntry>) -> Void) {
        let data = BeepWidgetDataManager.load()
        let entry = BeepWidgetEntry(
            date: .now,
            latestMessage: data?.latestMessage,
            recentSenders: data?.recentSenders ?? []
        )
        // Refresh every 15 minutes as fallback
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: .now)!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

@main
struct BeepWidgetBundle: WidgetBundle {
    var body: some Widget {
        BeepWidgetSmallWidget()
        BeepWidgetMediumWidget()
    }
}
