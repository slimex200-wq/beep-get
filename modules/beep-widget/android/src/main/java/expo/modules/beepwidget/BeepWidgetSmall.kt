package expo.modules.beepwidget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
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
            .background(BeepWidgetColors.surface)
            .padding(4.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        if (data?.latestMessage != null) {
            val msg = data.latestMessage
            LcdDisplay(
                fromName = msg.senderNickname,
                code = msg.code,
                time = formatTime(msg.receivedAt),
                isNew = !msg.isRead,
                modifier = GlanceModifier.fillMaxWidth(),
            )
        } else {
            Column(
                modifier = GlanceModifier
                    .fillMaxSize()
                    .background(BeepWidgetColors.lcdBackground)
                    .padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "BEEP-GET",
                    style = TextStyle(
                        color = BeepWidgetColors.lcdSubtext,
                        fontSize = androidx.compose.ui.unit.TextUnit.Unspecified,
                    ),
                )
                Text(
                    text = "수신 대기 중...",
                    style = TextStyle(color = BeepWidgetColors.textSecondary),
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
        val outFmt = SimpleDateFormat("a h:mm", Locale.KOREA)
        outFmt.format(date)
    } catch (e: Exception) {
        isoTime
    }
}
