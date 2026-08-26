package expo.modules.royalvpnandroid

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import java.io.FileInputStream
import java.io.IOException

// A minimal "black hole" VPN interface: it captures all of this device's
// traffic (every other app -- this app's own traffic is explicitly excluded
// so Royal-VPN itself can still reach the network to reconnect) and simply
// never forwards any of it anywhere. This is what Kill Switch / Royal
// Lockdown actually engage while the real WireGuard tunnel is down or
// mid-reconnect, instead of just flipping a UI toggle with nothing behind it.
class RoyalGuardVpnService : VpnService() {
  companion object {
    const val ACTION_STOP = "expo.modules.royalvpnandroid.GUARD_STOP"
    private const val NOTIFICATION_CHANNEL_ID = "royal_vpn_guard"
    private const val NOTIFICATION_ID = 7301

    @Volatile
    var isActive: Boolean = false
      private set
  }

  private var descriptor: ParcelFileDescriptor? = null
  @Volatile private var running = false

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_STOP) {
      stopGuard()
      stopSelf()
      return START_NOT_STICKY
    }
    startGuard()
    return START_STICKY
  }

  private fun startGuard() {
    if (descriptor != null) return // already active

    val builder = Builder()
      .setSession("Royal-VPN Guard")
      .addAddress("10.255.255.1", 32)
      .addAddress("fd00:royal:vpn::1", 64)
      .addRoute("0.0.0.0", 0)
      .addRoute("::", 0)
      .setBlocking(true)

    try {
      builder.addDisallowedApplication(packageName)
    } catch (e: PackageManager.NameNotFoundException) {
      // Continue without excluding ourselves rather than fail closed on this
      // step -- the interface still blocks every other app on the device.
    }

    val fd = try {
      builder.establish()
    } catch (e: Exception) {
      null
    } ?: return

    descriptor = fd
    isActive = true
    running = true
    startForeground(NOTIFICATION_ID, buildNotification())

    Thread {
      val buffer = ByteArray(32 * 1024)
      try {
        FileInputStream(fd.fileDescriptor).use { input ->
          while (running) {
            // Reading and discarding *is* the black hole: nothing captured
            // here is ever written anywhere, so it never reaches the internet.
            if (input.read(buffer) < 0) break
          }
        }
      } catch (e: IOException) {
        // Interface was torn down -- guard stopped, or superseded by the
        // real WireGuard tunnel establishing its own interface. Expected.
      }
    }.apply { isDaemon = true }.start()
  }

  @Suppress("DEPRECATION")
  private fun stopGuard() {
    running = false
    isActive = false
    try {
      descriptor?.close()
    } catch (e: IOException) {
      // ignore
    }
    descriptor = null
    stopForeground(true)
  }

  private fun buildNotification(): Notification {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      if (manager.getNotificationChannel(NOTIFICATION_CHANNEL_ID) == null) {
        manager.createNotificationChannel(
          NotificationChannel(NOTIFICATION_CHANNEL_ID, "Royal-VPN protection", NotificationManager.IMPORTANCE_LOW)
        )
      }
      return Notification.Builder(this, NOTIFICATION_CHANNEL_ID)
        .setContentTitle("Royal-VPN")
        .setContentText("Blocking all traffic until the VPN reconnects")
        .setSmallIcon(android.R.drawable.stat_sys_warning)
        .setOngoing(true)
        .build()
    }
    @Suppress("DEPRECATION")
    return Notification.Builder(this)
      .setContentTitle("Royal-VPN")
      .setContentText("Blocking all traffic until the VPN reconnects")
      .setSmallIcon(android.R.drawable.stat_sys_warning)
      .setOngoing(true)
      .build()
  }

  override fun onRevoke() {
    stopGuard()
    stopSelf()
    super.onRevoke()
  }

  override fun onDestroy() {
    stopGuard()
    super.onDestroy()
  }
}
