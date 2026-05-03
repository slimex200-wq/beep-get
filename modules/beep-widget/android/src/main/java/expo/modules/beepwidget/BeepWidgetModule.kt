package expo.modules.beepwidget

import android.content.Context
import androidx.glance.appwidget.updateAll
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

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
        val appContext = context.applicationContext
        CoroutineScope(Dispatchers.Default).launch {
            BeepWidgetSmall().updateAll(appContext)
            BeepWidgetMedium().updateAll(appContext)
        }
    }
}
