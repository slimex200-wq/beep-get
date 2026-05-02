package expo.modules.beepwidget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class BeepWidgetModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("BeepWidget")

        Function("updateWidgetData") { data: String ->
            val context = appContext.reactContext ?: return@Function null
            BeepWidgetData.save(context, data)
            triggerWidgetUpdate(context)
            null
        }

        Function("reloadWidgets") {
            val context = appContext.reactContext ?: return@Function null
            triggerWidgetUpdate(context)
            null
        }

        AsyncFunction("getWidgetData") {
            val context = appContext.reactContext ?: return@AsyncFunction null
            BeepWidgetData.load(context)
        }
    }

    private fun triggerWidgetUpdate(context: Context) {
        val widgetManager = AppWidgetManager.getInstance(context)

        // Update small widgets
        val smallComponent = ComponentName(context, BeepWidgetReceiver::class.java)
        val smallIds = widgetManager.getAppWidgetIds(smallComponent)
        if (smallIds.isNotEmpty()) {
            val intent = Intent(context, BeepWidgetReceiver::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, smallIds)
            }
            context.sendBroadcast(intent)
        }

        // Update medium widgets
        val mediumComponent = ComponentName(context, BeepWidgetMediumReceiver::class.java)
        val mediumIds = widgetManager.getAppWidgetIds(mediumComponent)
        if (mediumIds.isNotEmpty()) {
            val intent = Intent(context, BeepWidgetMediumReceiver::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, mediumIds)
            }
            context.sendBroadcast(intent)
        }
    }
}
