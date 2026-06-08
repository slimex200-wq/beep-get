package expo.modules.beepwidget

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.ContentScale
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxHeight
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.text.FontFamily
import androidx.glance.text.FontStyle
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider

/**
 * Skin palette bridged from the JS [WidgetSkin] payload. Mirrors the iOS BeepSkin
 * (paper / ink / mute / accent). DESIGN.md Principle 1: skins only vary the palette,
 * never the screen structure — so this is the single colour input for both sizes.
 *
 * Fallbacks are Classic Paper tones (never an LCD green), matching iOS swissPaper.
 */
data class BeepWidgetPalette(
    val paper: ColorProvider,
    val ink: ColorProvider,
    val muted: ColorProvider,
    val accent: ColorProvider
) {
    companion object {
        // Classic Paper, aligned with iOS BeepSkin.swissPaper.
        val classic = BeepWidgetPalette(
            paper = ColorProvider(Color(0xFFF2E6D6)),
            ink = ColorProvider(Color(0xFF0A0A0A)),
            muted = ColorProvider(Color(0xFF5E5750)),
            accent = ColorProvider(Color(0xFFD8361E))
        )

        fun from(skin: WidgetSkin?): BeepWidgetPalette {
            if (skin == null) return classic
            return BeepWidgetPalette(
                paper = colorProvider(skin.paper, Color(0xFFF2E6D6)),
                ink = colorProvider(skin.ink, Color(0xFF0A0A0A)),
                muted = colorProvider(skin.muted, Color(0xFF5E5750)),
                accent = colorProvider(skin.accent, Color(0xFFD8361E))
            )
        }
    }
}

// Glance TextStyle cannot load custom font resources (IBMPlexMono); it only exposes
// the generic system families. Use Monospace for code/meta so digits stay tabular
// and never fall back to a proportional system font. Serif stands in for the
// Fraunces editorial display used on iOS.
private val Mono = FontFamily.Monospace
private val Display = FontFamily.Serif

private const val RULE_DP = 1 // 1dp ink hairline, mirrors iOS ruleWidth ~1.15

/**
 * Medium widget surface. Reproduces the iOS SwissPaperMediumView structure with
 * Glance Row/Column:
 *   head        — "Incoming Beep/Blink" | "NO.x OF n · time" + "+N NEW"
 *   numberBlock — code (mono) / FROM name / kind subtitle, ink vDivider on right
 *   slots pane  — "SIGNAL SLOTS" label + status, then a 3-frame SignalSlotStrip
 */
@Composable
fun SignalSurfaceMedium(
    kind: String,
    code: String,
    fromName: String,
    time: String,
    indexNo: String,
    isNew: Boolean,
    totalReceived: Int,
    newCount: Int,
    stripFrames: List<ImageProvider?>,
    palette: BeepWidgetPalette,
    modifier: GlanceModifier = GlanceModifier
) {
    Column(modifier = modifier.background(palette.paper)) {
        Head(
            kind = kind,
            time = time,
            indexNo = indexNo,
            isNew = isNew,
            totalReceived = totalReceived,
            newCount = newCount,
            palette = palette
        )
        HDivider(palette)

        Row(modifier = GlanceModifier.fillMaxWidth().defaultWeight()) {
            // numberBlock — fixed width left column with an ink vDivider on its right edge.
            Row(modifier = GlanceModifier.fillMaxHeight()) {
                NumberBlock(
                    kind = kind,
                    code = code,
                    fromName = fromName,
                    palette = palette,
                    modifier = GlanceModifier
                        .width(96.dp)
                        .fillMaxHeight()
                        .padding(start = 16.dp, end = 12.dp)
                )
                VDivider(palette)
            }

            // slots pane — label/status header, then the 3-frame strip.
            Column(
                modifier = GlanceModifier
                    .defaultWeight()
                    .fillMaxHeight()
                    .padding(horizontal = 12.dp, vertical = 10.dp)
            ) {
                Text(
                    text = "SIGNAL SLOTS",
                    style = TextStyle(
                        color = palette.muted,
                        fontSize = 9.sp,
                        fontFamily = Mono
                    ),
                    maxLines = 1
                )

                Spacer(modifier = GlanceModifier.defaultWeight())

                SignalSlotStrip(
                    frames = if (kind == "blink") stripFrames else emptyList(),
                    palette = palette,
                    cellSpacingDp = 6,
                    modifier = GlanceModifier.fillMaxWidth().height(66.dp)
                )
            }
        }
    }
}

/**
 * Small widget surface. Reproduces the iOS SwissPaperSmallView structure:
 *   header — kind title | time, ink hDivider below
 *   code (mono large) / FROM name
 *   SignalSlotStrip (3 frames)
 *   NO.x | status footer
 */
@Composable
fun SignalSurfaceSmall(
    kind: String,
    code: String,
    fromName: String,
    time: String,
    indexNo: String,
    isNew: Boolean,
    newCount: Int,
    stripFrames: List<ImageProvider?>,
    palette: BeepWidgetPalette,
    modifier: GlanceModifier = GlanceModifier
) {
    Column(modifier = modifier.background(palette.paper).padding(11.dp)) {
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            KindTitle(kind = kind, palette = palette, size = 18)
            Spacer(modifier = GlanceModifier.defaultWeight())
            Text(
                text = time,
                style = TextStyle(color = palette.muted, fontSize = 10.sp, fontFamily = Mono),
                maxLines = 1
            )
        }

        Spacer(modifier = GlanceModifier.height(7.dp))
        HDivider(palette)
        Spacer(modifier = GlanceModifier.height(7.dp))

        Text(
            text = code,
            style = TextStyle(
                color = palette.ink,
                fontSize = 44.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = Mono
            ),
            maxLines = 1
        )

        FromLine(fromName = fromName, valueSize = 12, palette = palette)

        Spacer(modifier = GlanceModifier.defaultWeight())

        SignalSlotStrip(
            frames = if (kind == "blink") stripFrames else emptyList(),
            palette = palette,
            cellSpacingDp = 4,
            modifier = GlanceModifier.fillMaxWidth().height(24.dp)
        )

        Spacer(modifier = GlanceModifier.height(6.dp))

        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "NO.$indexNo",
                style = TextStyle(color = palette.muted, fontSize = 8.sp, fontFamily = Mono),
                maxLines = 1
            )
            Spacer(modifier = GlanceModifier.defaultWeight())
            Text(
                text = statusText(isNew, newCount),
                style = TextStyle(
                    color = if (newCount > 0 || isNew) palette.accent else palette.muted,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = Mono
                ),
                maxLines = 1
            )
        }
    }
}

@Composable
private fun Head(
    kind: String,
    time: String,
    indexNo: String,
    isNew: Boolean,
    totalReceived: Int,
    newCount: Int,
    palette: BeepWidgetPalette
) {
    Row(
        modifier = GlanceModifier
            .fillMaxWidth()
            .padding(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "Incoming",
                style = TextStyle(
                    color = palette.ink,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = Display
                ),
                maxLines = 1
            )
            Spacer(modifier = GlanceModifier.width(5.dp))
            KindTitle(kind = kind, palette = palette, size = 17)
        }

        Spacer(modifier = GlanceModifier.defaultWeight())

        Text(
            text = headMetaText(indexNo, totalReceived, time),
            style = TextStyle(
                color = palette.ink,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = Mono
            ),
            maxLines = 1
        )
        if (newCount > 0) {
            Spacer(modifier = GlanceModifier.width(6.dp))
            Text(
                text = "+$newCount NEW",
                style = TextStyle(
                    color = palette.accent,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = Mono
                ),
                maxLines = 1
            )
        }
    }
}

@Composable
private fun NumberBlock(
    kind: String,
    code: String,
    fromName: String,
    palette: BeepWidgetPalette,
    modifier: GlanceModifier = GlanceModifier
) {
    Column(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = code,
            style = TextStyle(
                color = palette.ink,
                fontSize = 36.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = Mono
            ),
            maxLines = 1
        )
        Spacer(modifier = GlanceModifier.height(6.dp))
        FromLine(fromName = fromName, valueSize = 11, palette = palette)
        Spacer(modifier = GlanceModifier.height(6.dp))
        Text(
            text = if (kind == "blink") "2.0s - MUTE" else "PRIVATE SIGNAL",
            style = TextStyle(color = palette.muted, fontSize = 9.sp, fontFamily = Mono),
            maxLines = 1
        )
    }
}

@Composable
private fun FromLine(fromName: String, valueSize: Int, palette: BeepWidgetPalette) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(
            text = "FROM",
            style = TextStyle(color = palette.muted, fontSize = 9.sp, fontFamily = Mono),
            maxLines = 1
        )
        Spacer(modifier = GlanceModifier.width(5.dp))
        Text(
            text = fromName,
            style = TextStyle(
                color = palette.ink,
                fontSize = valueSize.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = Mono
            ),
            maxLines = 1
        )
    }
}

@Composable
private fun KindTitle(kind: String, palette: BeepWidgetPalette, size: Int) {
    if (kind == "blink") {
        Text(
            text = "Blink",
            style = TextStyle(
                color = palette.ink,
                fontSize = size.sp,
                fontStyle = FontStyle.Italic,
                fontFamily = Display
            ),
            maxLines = 1
        )
    } else {
        Text(
            text = "Beep",
            style = TextStyle(
                color = palette.ink,
                fontSize = size.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = Display
            ),
            maxLines = 1
        )
    }
}

/**
 * Three signal-slot cells, each a 1dp ink-framed box. Blink frames render the
 * resolved image (Crop); empty / non-blink slots render the bare paper cell.
 * Mirrors the iOS SignalSlotStrip (no Canvas/Path — Glance-safe Box framing).
 */
@Composable
private fun SignalSlotStrip(
    frames: List<ImageProvider?>,
    palette: BeepWidgetPalette,
    cellSpacingDp: Int,
    modifier: GlanceModifier = GlanceModifier
) {
    Row(modifier = modifier) {
        repeat(3) { index ->
            SlotCell(
                image = frames.getOrNull(index),
                palette = palette,
                modifier = GlanceModifier.defaultWeight().fillMaxHeight()
            )
            if (index < 2) {
                Spacer(modifier = GlanceModifier.width(cellSpacingDp.dp))
            }
        }
    }
}

@Composable
private fun SlotCell(
    image: ImageProvider?,
    palette: BeepWidgetPalette,
    modifier: GlanceModifier = GlanceModifier
) {
    // 1dp ink frame drawn as an ink-filled box with a 1dp paper-filled inset.
    Box(
        modifier = modifier.background(palette.ink),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = GlanceModifier
                .fillMaxSize()
                .padding(RULE_DP.dp)
                .background(palette.paper),
            contentAlignment = Alignment.Center
        ) {
            if (image != null) {
                Image(
                    provider = image,
                    contentDescription = "Signal frame",
                    contentScale = ContentScale.Crop,
                    modifier = GlanceModifier.fillMaxSize()
                )
            }
        }
    }
}

@Composable
private fun HDivider(palette: BeepWidgetPalette) {
    Spacer(
        modifier = GlanceModifier
            .fillMaxWidth()
            .height(RULE_DP.dp)
            .background(palette.ink)
    )
}

@Composable
private fun VDivider(palette: BeepWidgetPalette) {
    Spacer(
        modifier = GlanceModifier
            .width(RULE_DP.dp)
            .fillMaxHeight()
            .background(palette.ink)
    )
}

private fun statusText(isNew: Boolean, newCount: Int): String = when {
    newCount > 0 -> "+$newCount NEW"
    isNew -> "NEW"
    else -> "READ"
}

private fun headMetaText(indexNo: String, totalReceived: Int, time: String): String =
    if (totalReceived > 1) "NO.$indexNo OF $totalReceived · $time" else "NO.$indexNo · $time"

private fun colorProvider(hex: String, fallback: Color): ColorProvider {
    val cleaned = hex.removePrefix("#")
    val color = runCatching {
        Color(0xFF000000L or cleaned.toLong(16))
    }.getOrDefault(fallback)
    return ColorProvider(color)
}
