package expo.modules.royalvpnandroid

import android.content.Intent
import android.net.VpnService
import android.os.ParcelFileDescriptor

/**
 * Establishes a minimal VpnService interface so Android shows the real
 * system-level "VPN connected" key icon / status. Deliberately adds no
 * addRoute() calls, so no real device traffic is ever diverted through
 * this interface -- it exists only to represent connection state at the
 * OS level while the rest of the app's networking (and, later, the real
 * WireGuard tunnel) is implemented.
 */
class RoyalVpnService : VpnService() {
  companion object {
    const val ACTION_CONNECT = "expo.modules.royalvpnandroid.CONNECT"
    const val ACTION_DISCONNECT = "expo.modules.royalvpnandroid.DISCONNECT"

    @Volatile
    var isRunning: Boolean = false
      private set
  }

  private var tunInterface: ParcelFileDescriptor? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_DISCONNECT) {
      stopVpn()
      return START_NOT_STICKY
    }
    startVpn()
    return START_STICKY
  }

  private fun startVpn() {
    if (tunInterface != null) return
    tunInterface = Builder()
      .setSession("Royal-VPN")
      .addAddress("10.111.222.1", 32)
      .setMtu(1500)
      .establish()
    isRunning = tunInterface != null
  }

  private fun stopVpn() {
    try {
      tunInterface?.close()
    } catch (_: Exception) {
    }
    tunInterface = null
    isRunning = false
    stopSelf()
  }

  override fun onRevoke() {
    stopVpn()
    super.onRevoke()
  }

  override fun onDestroy() {
    stopVpn()
    super.onDestroy()
  }
}
