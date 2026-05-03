package expo.modules.beepwidget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.padding
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class BeepWidgetSmall : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val data = BeepWidgetData.parse(context)

        provideContent {
            SmallWidgetContent(data)
        }
    }
}

@Composable
private fun SmallWidgetContent(data: WidgetData?) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(BeepWidgetColors.paper)
            .padding(4.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        val msg = data?.latestMessage
        if (msg != null) {
            LcdDisplay(
                fromName = msg.senderNickname,
                code = msg.code,
                time = formatTime(msg.receivedAt),
                isNew = !msg.isRead,
                actions = msg.actions,
                modifier = GlanceModifier
                    .fillMaxWidth()
                    .clickable(openWidgetUrlAction(msg.actions?.openReplyRoomUrl ?: "beepget://today")),
            )
        } else {
            Column(
                modifier = GlanceModifier
                    .fillMaxSize()
                    .background(BeepWidgetColors.paperWarm)
                    .padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "BEEP-GET",
                    style = TextStyle(
                        color = BeepWidgetColors.muted,
                        fontSize = TextUnit.Unspecified,
                    ),
                )
                Text(
                    text = "WAITING",
                    style = TextStyle(color = BeepWidgetColors.muted),
                )
            }
        }
    }
}

private fun formatTime(isoTime: String): String {
    return try {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
        sdf.timeZone = TimeZone.getTimeZone("UTC")
        val date = sdf.parse(isoTime) ?: return isoTime
        val outFmt = SimpleDateFormat("HH:mm", Locale.KOREA)
        outFmt.format(date)
    } catch (e: Exception) {
        isoTime
    }
}
