package expo.modules.beepwidget

import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.text.FontFamily
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextAlign
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import android.graphics.Color

object BeepWidgetColors {
    val lcdBackground = ColorProvider(Color.parseColor("#C8D8C0"))
    val lcdText = ColorProvider(Color.parseColor("#1A4A1A"))
    val lcdSubtext = ColorProvider(Color.parseColor("#3A7A3A"))
    val surface = ColorProvider(Color.parseColor("#E0E0E0"))
    val accent = ColorProvider(Color.parseColor("#C47080"))
    val textSecondary = ColorProvider(Color.parseColor("#8A8A9A"))
}

@Composable
fun LcdDisplay(
    fromName: String,
    code: String,
    time: String,
    isNew: Boolean,
    modifier: GlanceModifier = GlanceModifier
) {
    Column(
        modifier = modifier
            .background(BeepWidgetColors.lcdBackground)
            .padding(12.dp),
    ) {
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "FROM: $fromName",
                style = TextStyle(
                    color = BeepWidgetColors.lcdSubtext,
                    fontSize = 12.sp,
                ),
            )
            if (isNew) {
                Text(
                    text = "NEW",
                    style = TextStyle(
                        color = BeepWidgetColors.accent,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                )
            }
        }
        Spacer(modifier = GlanceModifier.height(4.dp))
        Text(
            text = code,
            style = TextStyle(
                color = BeepWidgetColors.lcdText,
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
            ),
            modifier = GlanceModifier.fillMaxWidth(),
        )
        Spacer(modifier = GlanceModifier.height(4.dp))
        Text(
            text = time,
            style = TextStyle(
                color = BeepWidgetColors.lcdSubtext,
                fontSize = 10.sp,
                textAlign = TextAlign.End,
            ),
            modifier = GlanceModifier.fillMaxWidth(),
        )
    }
}
