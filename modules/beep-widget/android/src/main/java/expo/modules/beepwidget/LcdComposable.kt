package expo.modules.beepwidget

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.action.clickable
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.ContentScale
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextAlign
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider

object BeepWidgetColors {
    val paper = ColorProvider(Color(0xFFF4EFE5))
    val paperWarm = ColorProvider(Color(0xFFFFF5E4))
    val paperDeep = ColorProvider(Color(0xFFE8DDCD))
    val ink = ColorProvider(Color(0xFF0A0A0A))
    val muted = ColorProvider(Color(0xFF6B6259))
    val rule = ColorProvider(Color(0xFFB8A996))
    val red = ColorProvider(Color(0xFFD8361E))
    val white = ColorProvider(Color(0xFFF7F3EA))
}

@Composable
fun LcdDisplay(
    kind: String = "beep",
    fromName: String,
    code: String,
    time: String,
    isNew: Boolean,
    teaser: WidgetSignalTeaser? = null,
    thumbnailImage: ImageProvider? = null,
    actions: WidgetActions? = null,
    showActions: Boolean = false,
    modifier: GlanceModifier = GlanceModifier
) {
    val hasTeaser = teaser?.stripFrameUris?.isNotEmpty() == true
    val hasThumbnail = thumbnailImage != null
    val compactBlink = (hasThumbnail || hasTeaser) && !showActions

    Column(
        modifier = modifier
            .background(BeepWidgetColors.paperWarm)
            .padding(if (compactBlink) 7.dp else 10.dp),
    ) {
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = if (kind == "blink") "Incoming Blink" else "Incoming Beep",
                style = TextStyle(
                    color = BeepWidgetColors.ink,
                    fontSize = if (compactBlink) 13.sp else 15.sp,
                    fontWeight = FontWeight.Bold,
                ),
            )
            if (isNew) {
                Text(
                    text = "●",
                    style = TextStyle(
                        color = BeepWidgetColors.red,
                        fontSize = if (compactBlink) 10.sp else 12.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                )
            }
        }
        Divider(gapAfterDp = if (compactBlink) 3 else 5)
        Text(
            text = "NO.",
            style = TextStyle(
                color = BeepWidgetColors.muted,
                fontSize = if (compactBlink) 7.sp else 9.sp,
                fontWeight = FontWeight.Bold,
            ),
        )
        Text(
            text = code,
            style = TextStyle(
                color = BeepWidgetColors.ink,
                fontSize = if (compactBlink) 29.sp else 36.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
            ),
            modifier = GlanceModifier.fillMaxWidth(),
        )
        Divider(gapAfterDp = if (compactBlink) 3 else 5)
        MetaLine(label = "FROM.", value = fromName, compact = compactBlink)
        MetaLine(label = "TIME.", value = time, compact = compactBlink)
        if (thumbnailImage != null && !showActions) {
            BlinkThumbnail(thumbnailImage, compact = compactBlink)
        } else if (hasTeaser && !showActions) {
            BlinkStrip(compact = compactBlink)
        }
        if (showActions && actions != null) {
            Spacer(modifier = GlanceModifier.height(6.dp))
            Row(modifier = GlanceModifier.fillMaxWidth()) {
                ActionChip(label = "OK", url = actions.confirmUrl)
                Spacer(modifier = GlanceModifier.width(4.dp))
                val quickReply = actions.quickReplyUrls.firstOrNull()
                if (quickReply != null) {
                    ActionChip(label = quickReply.code, url = quickReply.url)
                    Spacer(modifier = GlanceModifier.width(4.dp))
                }
                ActionChip(label = "OPEN", url = actions.openReplyRoomUrl, dark = true)
            }
        }
    }
}

@Composable
private fun BlinkThumbnail(thumbnailImage: ImageProvider, compact: Boolean) {
    Image(
        provider = thumbnailImage,
        contentDescription = "Blink preview",
        contentScale = ContentScale.Crop,
        modifier = GlanceModifier
            .fillMaxWidth()
            .height(if (compact) 42.dp else 52.dp)
            .background(BeepWidgetColors.ink),
    )
}

@Composable
private fun BlinkStrip(compact: Boolean) {
    Text(
        text = "01   02   03",
        style = TextStyle(
            color = BeepWidgetColors.white,
            fontSize = if (compact) 8.sp else 9.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
        ),
        modifier = GlanceModifier
            .fillMaxWidth()
            .background(BeepWidgetColors.ink)
            .padding(vertical = if (compact) 7.dp else 9.dp),
    )
}

@Composable
private fun MetaLine(label: String, value: String, compact: Boolean = false) {
    Row(modifier = GlanceModifier.fillMaxWidth()) {
        Text(
            text = label,
            style = TextStyle(
                color = BeepWidgetColors.muted,
                fontSize = if (compact) 7.sp else 9.sp,
                fontWeight = FontWeight.Bold,
            ),
        )
        Spacer(modifier = GlanceModifier.width(6.dp))
        Text(
            text = value,
            style = TextStyle(
                color = BeepWidgetColors.ink,
                fontSize = if (compact) 8.sp else 10.sp,
                fontWeight = FontWeight.Bold,
            ),
        )
    }
}

@Composable
private fun ActionChip(label: String, url: String, dark: Boolean = false) {
    Text(
        text = label,
        style = TextStyle(
            color = if (dark) BeepWidgetColors.white else BeepWidgetColors.ink,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
        ),
        modifier = GlanceModifier
            .width(if (dark) 54.dp else 48.dp)
            .background(if (dark) BeepWidgetColors.ink else BeepWidgetColors.paper)
            .clickable(openUrlAction(url))
            .padding(vertical = 6.dp, horizontal = 4.dp),
    )
}

@Composable
private fun Divider(gapAfterDp: Int = 5) {
    Spacer(
        modifier = GlanceModifier
            .fillMaxWidth()
            .height(1.dp)
            .background(BeepWidgetColors.rule)
    )
    Spacer(modifier = GlanceModifier.height(gapAfterDp.dp))
}

private fun openUrlAction(url: String) = openWidgetUrlAction(url)
