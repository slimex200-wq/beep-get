package expo.modules.beepwidget

import android.graphics.Color
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceModifier
import androidx.glance.action.clickable
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
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
    val paper = ColorProvider(Color.parseColor("#F4EFE5"))
    val paperWarm = ColorProvider(Color.parseColor("#FFF5E4"))
    val paperDeep = ColorProvider(Color.parseColor("#E8DDCD"))
    val ink = ColorProvider(Color.parseColor("#0A0A0A"))
    val muted = ColorProvider(Color.parseColor("#6B6259"))
    val rule = ColorProvider(Color.parseColor("#B8A996"))
    val red = ColorProvider(Color.parseColor("#D8361E"))
    val white = ColorProvider(Color.parseColor("#F7F3EA"))
}

@Composable
fun LcdDisplay(
    fromName: String,
    code: String,
    time: String,
    isNew: Boolean,
    actions: WidgetActions? = null,
    showActions: Boolean = false,
    modifier: GlanceModifier = GlanceModifier
) {
    Column(
        modifier = modifier
            .background(BeepWidgetColors.paperWarm)
            .padding(10.dp),
    ) {
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "Incoming Beep",
                style = TextStyle(
                    color = BeepWidgetColors.ink,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                ),
            )
            if (isNew) {
                Text(
                    text = "●",
                    style = TextStyle(
                        color = BeepWidgetColors.red,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                )
            }
        }
        Divider()
        Text(
            text = "NO.",
            style = TextStyle(
                color = BeepWidgetColors.muted,
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
            ),
        )
        Text(
            text = code,
            style = TextStyle(
                color = BeepWidgetColors.ink,
                fontSize = 36.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
            ),
            modifier = GlanceModifier.fillMaxWidth(),
        )
        Divider()
        MetaLine(label = "FROM.", value = fromName)
        MetaLine(label = "TIME.", value = time)
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
private fun MetaLine(label: String, value: String) {
    Row(modifier = GlanceModifier.fillMaxWidth()) {
        Text(
            text = label,
            style = TextStyle(
                color = BeepWidgetColors.muted,
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
            ),
        )
        Spacer(modifier = GlanceModifier.width(6.dp))
        Text(
            text = value,
            style = TextStyle(
                color = BeepWidgetColors.ink,
                fontSize = 10.sp,
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
private fun Divider() {
    Spacer(
        modifier = GlanceModifier
            .fillMaxWidth()
            .height(1.dp)
            .background(BeepWidgetColors.rule)
    )
    Spacer(modifier = GlanceModifier.height(5.dp))
}

private fun openUrlAction(url: String) = openWidgetUrlAction(url)
