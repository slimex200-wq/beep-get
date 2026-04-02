package expo.modules.beepwidget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxHeight
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class BeepWidgetMedium : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val data = BeepWidgetData.parse(context)

        provideContent {
            MediumWidgetContent(data)
        }
    }
}

@Composable
private fun MediumWidgetContent(data: WidgetData?) {
    Row(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(BeepWidgetColors.surface)
            .padding(4.dp),
    ) {
        // Left: LCD display (main message)
        Column(
            modifier = GlanceModifier
                .defaultWeight()
                .fillMaxHeight(),
        ) {
            if (data?.latestMessage != null) {
                val msg = data.latestMessage
                LcdDisplay(
                    fromName = msg.senderNickname,
                    code = msg.code,
                    time = formatTime(msg.receivedAt),
                    isNew = !msg.isRead,
                    modifier = GlanceModifier.fillMaxSize(),
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
                        style = TextStyle(color = BeepWidgetColors.lcdSubtext),
                    )
                    Text(
                        text = "수신 대기 중...",
                        style = TextStyle(color = BeepWidgetColors.textSecondary),
                    )
                }
            }
        }

        Spacer(modifier = GlanceModifier.width(4.dp))

        // Right: Recent senders list
        Column(
            modifier = GlanceModifier
                .width(100.dp)
                .fillMaxHeight()
                .background(BeepWidgetColors.surface)
                .padding(8.dp),
        ) {
            Text(
                text = "RECENT",
                style = TextStyle(
                    color = BeepWidgetColors.textSecondary,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                ),
            )
            Spacer(modifier = GlanceModifier.height(4.dp))

            val senders = data?.recentSenders ?: emptyList()
            if (senders.isEmpty()) {
                Text(
                    text = "-",
                    style = TextStyle(color = BeepWidgetColors.textSecondary),
                )
            } else {
                senders.forEach { sender ->
                    Column(
                        modifier = GlanceModifier
                            .fillMaxWidth()
                            .padding(vertical = 2.dp),
                    ) {
                        Text(
                            text = sender.nickname,
                            style = TextStyle(
                                color = BeepWidgetColors.lcdText,
                                fontSize = 12.sp,
                            ),
                            maxLines = 1,
                        )
                        Text(
                            text = sender.lastCode,
                            style = TextStyle(
                                color = BeepWidgetColors.lcdSubtext,
                                fontSize = 10.sp,
                            ),
                            maxLines = 1,
                        )
                    }
                    Spacer(modifier = GlanceModifier.height(2.dp))
                }
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
