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

data class BeepWidgetPalette(
    val paper: ColorProvider,
    val paperWarm: ColorProvider,
    val ink: ColorProvider,
    val muted: ColorProvider,
    val rule: ColorProvider,
    val accent: ColorProvider,
    val white: ColorProvider
) {
    companion object {
        val classic = BeepWidgetPalette(
            paper = ColorProvider(Color(0xFFF4EFE5)),
            paperWarm = ColorProvider(Color(0xFFFFF5E4)),
            ink = ColorProvider(Color(0xFF0A0A0A)),
            muted = ColorProvider(Color(0xFF6B6259)),
            rule = ColorProvider(Color(0xFFB8A996)),
            accent = ColorProvider(Color(0xFFD8361E)),
            white = ColorProvider(Color(0xFFF7F3EA))
        )

        fun from(skin: WidgetSkin?): BeepWidgetPalette {
            if (skin == null) return classic
            return BeepWidgetPalette(
                paper = colorProvider(skin.paper, Color(0xFFF4EFE5)),
                paperWarm = colorProvider(skin.paperWarm, Color(0xFFFFF5E4)),
                ink = colorProvider(skin.ink, Color(0xFF0A0A0A)),
                muted = colorProvider(skin.muted, Color(0xFF6B6259)),
                rule = colorProvider(skin.rule, Color(0xFFB8A996)),
                accent = colorProvider(skin.accent, Color(0xFFD8361E)),
                white = classic.white
            )
        }
    }
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
    palette: BeepWidgetPalette = BeepWidgetPalette.classic,
    modifier: GlanceModifier = GlanceModifier
) {
    val hasTeaser = teaser?.stripFrameUris?.isNotEmpty() == true
    val hasThumbnail = thumbnailImage != null
    val compactBlink = (hasThumbnail || hasTeaser) && !showActions

    Column(
        modifier = modifier
            .background(palette.paperWarm)
            .padding(if (compactBlink) 7.dp else 10.dp),
    ) {
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = if (kind == "blink") "Incoming Blink" else "Incoming Beep",
                style = TextStyle(
                    color = palette.ink,
                    fontSize = if (compactBlink) 13.sp else 15.sp,
                    fontWeight = FontWeight.Bold,
                ),
            )
            if (isNew) {
                Spacer(modifier = GlanceModifier.width(5.dp))
                Text(
                    text = "NEW",
                    style = TextStyle(
                        color = palette.accent,
                        fontSize = if (compactBlink) 10.sp else 12.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                )
            }
        }
        Divider(gapAfterDp = if (compactBlink) 3 else 5, palette = palette)
        Text(
            text = "NO.",
            style = TextStyle(
                color = palette.muted,
                fontSize = if (compactBlink) 7.sp else 9.sp,
                fontWeight = FontWeight.Bold,
            ),
        )
        Text(
            text = code,
            style = TextStyle(
                color = palette.ink,
                fontSize = if (compactBlink) 29.sp else 36.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
            ),
            modifier = GlanceModifier.fillMaxWidth(),
        )
        Divider(gapAfterDp = if (compactBlink) 3 else 5, palette = palette)
        MetaLine(label = "FROM.", value = fromName, compact = compactBlink, palette = palette)
        MetaLine(label = "TIME.", value = time, compact = compactBlink, palette = palette)
        if (thumbnailImage != null && !showActions) {
            BlinkThumbnail(thumbnailImage, compact = compactBlink, palette = palette)
        } else if (hasTeaser && !showActions) {
            BlinkStrip(compact = compactBlink, palette = palette)
        }
        if (showActions && actions != null) {
            Spacer(modifier = GlanceModifier.height(6.dp))
            Row(modifier = GlanceModifier.fillMaxWidth()) {
                ActionChip(label = "OK", url = actions.confirmUrl, palette = palette)
                Spacer(modifier = GlanceModifier.width(4.dp))
                val quickReply = actions.quickReplyUrls.firstOrNull()
                if (quickReply != null) {
                    ActionChip(label = quickReply.code, url = quickReply.url, palette = palette)
                    Spacer(modifier = GlanceModifier.width(4.dp))
                }
                ActionChip(label = "OPEN", url = actions.openReplyRoomUrl, dark = true, palette = palette)
            }
        }
    }
}

@Composable
private fun BlinkThumbnail(thumbnailImage: ImageProvider, compact: Boolean, palette: BeepWidgetPalette) {
    Image(
        provider = thumbnailImage,
        contentDescription = "Blink preview",
        contentScale = ContentScale.Crop,
        modifier = GlanceModifier
            .fillMaxWidth()
            .height(if (compact) 42.dp else 52.dp)
            .background(palette.ink),
    )
}

@Composable
private fun BlinkStrip(compact: Boolean, palette: BeepWidgetPalette) {
    Text(
        text = "01   02   03",
        style = TextStyle(
            color = palette.white,
            fontSize = if (compact) 8.sp else 9.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
        ),
        modifier = GlanceModifier
            .fillMaxWidth()
            .background(palette.ink)
            .padding(vertical = if (compact) 7.dp else 9.dp),
    )
}

@Composable
private fun MetaLine(label: String, value: String, compact: Boolean = false, palette: BeepWidgetPalette) {
    Row(modifier = GlanceModifier.fillMaxWidth()) {
        Text(
            text = label,
            style = TextStyle(
                color = palette.muted,
                fontSize = if (compact) 7.sp else 9.sp,
                fontWeight = FontWeight.Bold,
            ),
        )
        Spacer(modifier = GlanceModifier.width(6.dp))
        Text(
            text = value,
            style = TextStyle(
                color = palette.ink,
                fontSize = if (compact) 8.sp else 10.sp,
                fontWeight = FontWeight.Bold,
            ),
        )
    }
}

@Composable
private fun ActionChip(label: String, url: String, dark: Boolean = false, palette: BeepWidgetPalette) {
    Text(
        text = label,
        style = TextStyle(
            color = if (dark) palette.white else palette.ink,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
        ),
        modifier = GlanceModifier
            .width(if (dark) 54.dp else 48.dp)
            .background(if (dark) palette.ink else palette.paper)
            .clickable(openUrlAction(url))
            .padding(vertical = 6.dp, horizontal = 4.dp),
    )
}

@Composable
private fun Divider(gapAfterDp: Int = 5, palette: BeepWidgetPalette = BeepWidgetPalette.classic) {
    Spacer(
        modifier = GlanceModifier
            .fillMaxWidth()
            .height(1.dp)
            .background(palette.rule)
    )
    Spacer(modifier = GlanceModifier.height(gapAfterDp.dp))
}

private fun openUrlAction(url: String) = openWidgetUrlAction(url)

private fun colorProvider(hex: String, fallback: Color): ColorProvider {
    val cleaned = hex.removePrefix("#")
    val color = runCatching {
        Color(0xFF000000L or cleaned.toLong(16))
    }.getOrDefault(fallback)
    return ColorProvider(color)
}
