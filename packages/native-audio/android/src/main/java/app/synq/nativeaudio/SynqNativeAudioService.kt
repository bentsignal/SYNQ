package app.synq.nativeaudio

import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService

class SynqNativeAudioService : MediaSessionService() {
  override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? =
    SynqNativeAudioHolder.mediaSession

  override fun onDestroy() {
    SynqNativeAudioHolder.mediaSession?.release()
    SynqNativeAudioHolder.mediaSession = null
    super.onDestroy()
  }
}
