package expo.modules.beepwidget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.ImageProvider
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
import androidx.glance.text.FontFamily
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class BeepWidgetSmall : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val data = BeepWidgetData.parse(context)
        val stripFrames = BlinkThumbnailResolver.resolveStripFrames(
            context,
            data?.latestMessage?.teaser
        )

        provideContent {
            SmallWidgetContent(data, stripFrames)
        }
    }
}

@Composable
private fun SmallWidgetContent(data: WidgetData?, stripFrames: List<ImageProvider?>) {
    val palette = BeepWidgetPalette.from(data?.activeSkin)
    val msg = data?.latestMessage

    if (msg != null) {
        SignalSurfaceSmall(
            kind = msg.kind ?: "beep",
            code = msg.code,
            fromName = msg.senderNickname,
            time = formatTime(msg.receivedAt),
            indexNo = formatIndex(msg.messageId),
            isNew = !msg.isRead,
            newCount = data.newCount ?: 0,
            stripFrames = stripFrames,
            palette = palette,
            modifier = GlanceModifier
                .fillMaxSize()
                .clickable(openWidgetUrlAction(msg.actions?.openReplyRoomUrl ?: "beepget://today")),
        )
    } else {
        EmptySmallContent(palette)
    }
}

@Composable
private fun EmptySmallContent(palette: BeepWidgetPalette) {
    Column(modifier = GlanceModifier.fillMaxSize().background(palette.paper).padding(11.dp)) {
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "Beep",
                style = TextStyle(
                    color = palette.ink,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Serif,
                ),
                maxLines = 1,
            )
            Spacer(modifier = GlanceModifier.defaultWeight())
            Text(
                text = "--:--",
                style = TextStyle(
                    color = palette.muted,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                ),
                maxLines = 1,
            )
        }

        Spacer(modifier = GlanceModifier.height(7.dp))
        Spacer(
            modifier = GlanceModifier.fillMaxWidth().height(1.dp).background(palette.ink),
        )
        Spacer(modifier = GlanceModifier.height(7.dp))

        Text(
            text = "WAIT",
            style = TextStyle(
                color = palette.ink,
                fontSize = 44.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
            ),
            maxLines = 1,
        )

        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "FROM",
                style = TextStyle(
                    color = palette.muted,
                    fontSize = 9.sp,
                    fontFamily = FontFamily.Monospace,
                ),
                maxLines = 1,
            )
            Text(
                text = " BEEP-GET",
                style = TextStyle(
                    color = palette.ink,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                ),
                maxLines = 1,
            )
        }

        Spacer(modifier = GlanceModifier.defaultWeight())

        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "NO.--",
                style = TextStyle(
                    color = palette.muted,
                    fontSize = 8.sp,
                    fontFamily = FontFamily.Monospace,
                ),
                maxLines = 1,
            )
            Spacer(modifier = GlanceModifier.defaultWeight())
            Text(
                text = "WAITING",
                style = TextStyle(
                    color = palette.muted,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                ),
                maxLines = 1,
            )
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
