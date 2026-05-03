package expo.modules.beepwidget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.ImageProvider
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
        val thumbnailImage = BlinkThumbnailResolver.resolve(context, data?.latestMessage?.teaser)

        provideContent {
            MediumWidgetContent(data, thumbnailImage)
        }
    }
}

@Composable
private fun MediumWidgetContent(data: WidgetData?, thumbnailImage: ImageProvider?) {
    Row(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(BeepWidgetColors.paper)
            .padding(4.dp),
    ) {
        Column(
            modifier = GlanceModifier
                .width(154.dp)
                .fillMaxHeight(),
        ) {
            val msg = data?.latestMessage
            if (msg != null) {
                LcdDisplay(
                    kind = msg.kind ?: "beep",
                    fromName = msg.senderNickname,
                    code = msg.code,
                    time = formatTime(msg.receivedAt),
                    isNew = !msg.isRead,
                    teaser = msg.teaser,
                    thumbnailImage = thumbnailImage,
                    actions = msg.actions,
                    showActions = true,
                    modifier = GlanceModifier.fillMaxSize(),
                )
            } else {
                EmptyWidgetContent()
            }
        }

        Spacer(modifier = GlanceModifier.width(4.dp))

        Column(
            modifier = GlanceModifier
                .width(100.dp)
                .fillMaxHeight()
                .background(BeepWidgetColors.paperWarm)
                .padding(8.dp),
        ) {
            Text(
                text = "RECENT",
                style = TextStyle(
                    color = BeepWidgetColors.muted,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                ),
            )
            Spacer(modifier = GlanceModifier.height(4.dp))

            val senders = data?.recentSenders ?: emptyList()
            if (senders.isEmpty()) {
                Text(
                    text = "-",
                    style = TextStyle(color = BeepWidgetColors.muted),
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
                                color = BeepWidgetColors.ink,
                                fontSize = 12.sp,
                            ),
                            maxLines = 1,
                        )
                        Text(
                            text = sender.lastCode,
                            style = TextStyle(
                                color = BeepWidgetColors.muted,
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

@Composable
private fun EmptyWidgetContent() {
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
            style = TextStyle(color = BeepWidgetColors.muted),
        )
        Text(
            text = "WAITING",
            style = TextStyle(color = BeepWidgetColors.muted),
        )
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
