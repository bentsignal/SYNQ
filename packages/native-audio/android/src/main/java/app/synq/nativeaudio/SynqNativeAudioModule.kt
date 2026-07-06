package app.synq.nativeaudio

import android.content.Context
import android.net.Uri
import android.os.Bundle
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.PlaybackException
import androidx.media3.common.PlaybackParameters
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlin.math.max

private data class SynqTrack(
  val albumTitle: String?,
  val artistName: String?,
  val artworkUri: String?,
  val durationMs: Long?,
  val id: String,
  val title: String,
  val uri: String
)

internal object SynqNativeAudioHolder {
  var mediaSession: MediaSession? = null
}

class SynqNativeAudioModule : Module() {
  private var player: ExoPlayer? = null
  private var queue: List<SynqTrack> = emptyList()
  private var activeTrackId: String? = null
  private var playbackRate = 1.0f

  override fun definition() = ModuleDefinition {
    Name("SynqNativeAudio")

    Events("onChange", "onPlaybackEvent")

    Function("getModuleName") {
      "SynqNativeAudio"
    }

    Function("configure") { _: Map<String, Any?> ->
      ensurePlayer()
      emitState()
      currentState()
    }

    Function("getState") {
      currentState()
    }

    Function("loadQueue") { input: Map<String, Any?> ->
      queue = parseTracks(input["tracks"])
      activeTrackId = input["activeTrackId"] as? String ?: queue.firstOrNull()?.id
      rebuildPlaylist(activeTrackId)
      emitState()
      currentState()
    }

    Function("play") { trackId: String? ->
      val nextTrackId = trackId ?: activeTrackId ?: queue.firstOrNull()?.id
      if (nextTrackId != null && nextTrackId != activeTrackId) {
        rebuildPlaylist(nextTrackId)
      }
      ensurePlayer().play()
      emitState()
      currentState()
    }

    Function("pause") {
      ensurePlayer().pause()
      emitState()
      currentState()
    }

    Function("stop") {
      ensurePlayer().stop()
      activeTrackId = null
      emitState()
      currentState()
    }

    Function("seekTo") { positionMs: Double ->
      ensurePlayer().seekTo(max(0L, positionMs.toLong()))
      emitState()
      currentState()
    }

    Function("skipNext") {
      val next = nextTrack()
      if (next != null) {
        rebuildPlaylist(next.id)
        ensurePlayer().play()
      }
      emitState()
      currentState()
    }

    Function("skipPrevious") {
      val previous = previousTrack()
      if (previous != null) {
        rebuildPlaylist(previous.id)
        ensurePlayer().play()
      } else {
        ensurePlayer().seekTo(0)
      }
      emitState()
      currentState()
    }

    Function("setPlaybackRate") { rate: Double ->
      playbackRate = rate.toFloat().coerceIn(0.25f, 4.0f)
      ensurePlayer().playbackParameters = PlaybackParameters(playbackRate)
      emitState()
      currentState()
    }
  }

  private fun context(): Context = appContext.reactContext ?: appContext.currentActivity
    ?: throw IllegalStateException("SynqNativeAudio requires a React context")

  private fun ensurePlayer(): ExoPlayer {
    val existing = player
    if (existing != null) {
      return existing
    }

    val created = ExoPlayer.Builder(context()).build()
    created.playbackParameters = PlaybackParameters(playbackRate)
    created.addListener(object : Player.Listener {
      override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
        activeTrackId = mediaItem?.mediaId ?: activeTrackId
        emitState()
      }

      override fun onPlaybackStateChanged(playbackState: Int) {
        emitState()
      }

      override fun onIsPlayingChanged(isPlaying: Boolean) {
        emitState()
      }

      override fun onPlayerError(error: PlaybackException) {
        sendEvent(
          "onPlaybackEvent",
          bundleOf("type" to "RouteChanged", "reason" to (error.message ?: error.errorCodeName))
        )
      }
    })

    player = created
    SynqNativeAudioHolder.mediaSession?.release()
    SynqNativeAudioHolder.mediaSession = MediaSession.Builder(context(), created).build()
    return created
  }

  private fun rebuildPlaylist(trackId: String?) {
    val exoPlayer = ensurePlayer()
    val startIndex = queue.indexOfFirst { it.id == trackId }.let { if (it >= 0) it else 0 }
    val items = queue.map { track ->
      MediaItem.Builder()
        .setMediaId(track.id)
        .setUri(track.uri)
        .setMediaMetadata(
          MediaMetadata.Builder()
            .setAlbumTitle(track.albumTitle)
            .setArtist(track.artistName)
            .setArtworkUri(track.artworkUri?.let(Uri::parse))
            .setTitle(track.title)
            .build()
        )
        .build()
    }

    exoPlayer.setMediaItems(items, startIndex, 0L)
    exoPlayer.prepare()
    activeTrackId = queue.getOrNull(startIndex)?.id
  }

  @Suppress("UNCHECKED_CAST")
  private fun parseTracks(value: Any?): List<SynqTrack> =
    (value as? List<Map<String, Any?>>).orEmpty().mapNotNull { track ->
      val id = track["id"] as? String ?: return@mapNotNull null
      val title = track["title"] as? String ?: id
      val uri = track["uri"] as? String ?: return@mapNotNull null
      SynqTrack(
        albumTitle = track["albumTitle"] as? String,
        artistName = track["artistName"] as? String,
        artworkUri = track["artworkUri"] as? String,
        durationMs = (track["durationMs"] as? Number)?.toLong(),
        id = id,
        title = title,
        uri = uri
      )
    }

  private fun currentTrack(): SynqTrack? =
    queue.firstOrNull { it.id == activeTrackId } ?: queue.firstOrNull()

  private fun nextTrack(): SynqTrack? {
    val index = queue.indexOfFirst { it.id == activeTrackId }
    return queue.getOrNull(index + 1)
  }

  private fun previousTrack(): SynqTrack? {
    val index = queue.indexOfFirst { it.id == activeTrackId }
    return queue.getOrNull(index - 1)
  }

  private fun currentState(): Bundle {
    val exoPlayer = ensurePlayer()
    val duration = when {
      exoPlayer.duration != C.TIME_UNSET -> exoPlayer.duration
      currentTrack()?.durationMs != null -> currentTrack()?.durationMs ?: 0L
      else -> 0L
    }
    return bundleOf(
      "activeTrack" to currentTrack()?.toBundle(),
      "bufferedPositionMs" to exoPlayer.bufferedPosition,
      "durationMs" to duration,
      "playbackRate" to playbackRate.toDouble(),
      "positionMs" to exoPlayer.currentPosition,
      "queue" to bundleOf(
        "activeTrackId" to activeTrackId,
        "tracks" to ArrayList(queue.map { it.toBundle() })
      ),
      "status" to playbackStatus(exoPlayer)
    )
  }

  private fun playbackStatus(exoPlayer: ExoPlayer): String =
    when {
      exoPlayer.playbackState == Player.STATE_BUFFERING -> "buffering"
      exoPlayer.playbackState == Player.STATE_ENDED -> "ended"
      exoPlayer.isPlaying -> "playing"
      activeTrackId != null -> "paused"
      else -> "idle"
    }

  private fun emitState() {
    sendEvent("onPlaybackEvent", bundleOf("type" to "StateChanged", "state" to currentState()))
  }

  private fun SynqTrack.toBundle(): Bundle =
    bundleOf(
      "albumTitle" to albumTitle,
      "artistName" to artistName,
      "artworkUri" to artworkUri,
      "durationMs" to durationMs,
      "id" to id,
      "title" to title,
      "uri" to uri
    )

  private fun bundleOf(vararg pairs: Pair<String, Any?>): Bundle {
    val bundle = Bundle()
    pairs.forEach { (key, value) ->
      when (value) {
        null -> bundle.putString(key, null)
        is Bundle -> bundle.putBundle(key, value)
        is Boolean -> bundle.putBoolean(key, value)
        is Double -> bundle.putDouble(key, value)
        is Float -> bundle.putDouble(key, value.toDouble())
        is Int -> bundle.putInt(key, value)
        is Long -> bundle.putDouble(key, value.toDouble())
        is String -> bundle.putString(key, value)
        is ArrayList<*> -> bundle.putParcelableArrayList(key, value as ArrayList<Bundle>)
        else -> bundle.putString(key, value.toString())
      }
    }
    return bundle
  }
}
