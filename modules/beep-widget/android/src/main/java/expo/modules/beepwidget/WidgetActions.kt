package expo.modules.beepwidget

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.glance.GlanceId
import androidx.glance.action.Action
import androidx.glance.action.ActionParameters
import androidx.glance.action.actionParametersOf
import androidx.glance.appwidget.action.ActionCallback
import androidx.glance.appwidget.action.actionRunCallback

private val WidgetUrlKey = ActionParameters.Key<String>("widget_url")

fun openWidgetUrlAction(url: String): Action {
    return actionRunCallback<OpenWidgetUrlAction>(
        actionParametersOf(WidgetUrlKey.to(url))
    )
}

class OpenWidgetUrlAction : ActionCallback {
    override suspend fun onAction(
        context: Context,
        glanceId: GlanceId,
        parameters: ActionParameters
    ) {
        val url = parameters[WidgetUrlKey] ?: return
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            setPackage(context.packageName)
        }
        context.startActivity(intent)
    }
}
