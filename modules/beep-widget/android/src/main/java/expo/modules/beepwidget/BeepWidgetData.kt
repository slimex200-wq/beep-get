package expo.modules.beepwidget

import android.content.Context
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName

data class WidgetMessage(
    val code: String,
    @SerializedName("senderNickname") val senderNickname: String,
    @SerializedName("senderBeepId") val senderBeepId: String,
    @SerializedName("messageId") val messageId: String,
    @SerializedName("receivedAt") val receivedAt: String,
    @SerializedName("isRead") val isRead: Boolean
)

data class RecentSender(
    val nickname: String,
    @SerializedName("beepId") val beepId: String,
    @SerializedName("lastCode") val lastCode: String,
    @SerializedName("statusIcon") val statusIcon: String
)

data class WidgetData(
    @SerializedName("latestMessage") val latestMessage: WidgetMessage?,
    @SerializedName("recentSenders") val recentSenders: List<RecentSender>
)

object BeepWidgetData {
    private const val PREFS_NAME = "beep_widget_data"
    private const val KEY_DATA = "widget_data"
    private val gson = Gson()

    fun save(context: Context, json: String) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_DATA, json)
            .apply()
    }

    fun load(context: Context): String? {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getString(KEY_DATA, null)
    }

    fun parse(context: Context): WidgetData? {
        val json = load(context) ?: return null
        return try {
            gson.fromJson(json, WidgetData::class.java)
        } catch (e: Exception) {
            null
        }
    }
}
