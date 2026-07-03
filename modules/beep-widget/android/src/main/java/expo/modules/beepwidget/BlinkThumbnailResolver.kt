package expo.modules.beepwidget

import android.content.Context
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Base64
import androidx.glance.ImageProvider
import java.io.File

object BlinkThumbnailResolver {
    fun resolve(context: Context, teaser: WidgetSignalTeaser?): ImageProvider? {
        val candidate = teaser?.thumbnailUri?.takeIf { it.isNotBlank() }
            ?: teaser?.stripFrameUris?.firstOrNull { it.isNotBlank() }
            ?: return null

        return resolveCandidate(context, candidate)
    }

    /**
     * Resolves up to [count] signal-slot frames from the teaser strip. Mirrors the
     * iOS SignalSlotStrip which renders 3 cells; missing or unresolvable frames
     * come back as null so the caller can draw an empty slot in their place.
     */
    fun resolveStripFrames(
        context: Context,
        teaser: WidgetSignalTeaser?,
        count: Int = 3
    ): List<ImageProvider?> {
        val frames = teaser?.stripFrameUris.orEmpty()
        return (0 until count).map { index ->
            val candidate = frames.getOrNull(index)?.takeIf { it.isNotBlank() } ?: return@map null
            resolveCandidate(context, candidate)
        }
    }

    private fun resolveCandidate(context: Context, candidate: String): ImageProvider? {
        if (candidate.startsWith("preview-")) {
            return ImageProvider(R.drawable.beep_widget_blink_preview_thumb)
        }
        return decodeBitmap(context, candidate)?.let { ImageProvider(it) }
    }

    private fun decodeBitmap(context: Context, candidate: String) = try {
        when {
            candidate.startsWith("data:image") -> decodeDataUri(candidate)
            candidate.startsWith("content://") ||
                candidate.startsWith("file://") ||
                candidate.startsWith("android.resource://") -> {
                context.contentResolver.openInputStream(Uri.parse(candidate))?.use {
                    BitmapFactory.decodeStream(it)
                }
            }
            candidate.startsWith("/") -> {
                File(candidate).inputStream().use { BitmapFactory.decodeStream(it) }
            }
            else -> null
        }
    } catch (_: Exception) {
        null
    }

    private fun decodeDataUri(candidate: String) = try {
        val payload = candidate.substringAfter(',', missingDelimiterValue = "")
        if (payload.isBlank()) {
            null
        } else {
            val bytes = Base64.decode(payload, Base64.DEFAULT)
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
        }
    } catch (_: Exception) {
        null
    }
}
