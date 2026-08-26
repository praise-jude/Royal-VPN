package expo.modules.royalvpnandroid

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.Build
import com.wireguard.android.backend.GoBackend
import com.wireguard.android.backend.Tunnel
import com.wireguard.config.Config
import com.wireguard.config.InetEndpoint
import com.wireguard.config.InetNetwork
import com.wireguard.config.Interface
import com.wireguard.config.Peer
import com.wireguard.crypto.Key
import com.wireguard.crypto.KeyPair
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val VPN_PERMISSION_REQUEST_CODE = 24601
private const val PREFS_NAME = "royal_vpn_wg"
private const val PREF_PRIVATE_KEY = "private_key"

// The device's WireGuard identity. The private key is generated on-device
// and never leaves it -- only the public key is ever sent to the backend.
private object RoyalTunnel : Tunnel {
  override fun getName() = "royal-vpn"
  override fun onStateChange(newState: Tunnel.State) {}
}

class RoyalVpnAndroidModule : Module() {
  private var pendingPermissionPromise: Promise? = null
  private var backend: GoBackend? = null

  private fun getBackend(context: Context): GoBackend =
    backend ?: GoBackend(context).also { backend = it }

  private fun getOrCreateKeyPair(context: Context): KeyPair {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val existing = prefs.getString(PREF_PRIVATE_KEY, null)
    if (existing != null) {
      return KeyPair(Key.fromBase64(existing))
    }
    val fresh = KeyPair()
    prefs.edit().putString(PREF_PRIVATE_KEY, fresh.privateKey.toBase64()).apply()
    return fresh
  }

  override fun definition() = ModuleDefinition {
    Name("RoyalVpnAndroid")

    AsyncFunction("getPublicKeyAsync") { promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.reject("NO_CONTEXT", "No React context available", null)
        return@AsyncFunction
      }
      promise.resolve(getOrCreateKeyPair(context).publicKey.toBase64())
    }

    AsyncFunction("requestPermissionAsync") { promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.resolve(false)
        return@AsyncFunction
      }

      val consentIntent = VpnService.prepare(context)
      if (consentIntent == null) {
        // Already granted.
        promise.resolve(true)
        return@AsyncFunction
      }

      val activity = appContext.currentActivity
      if (activity == null) {
        promise.resolve(false)
        return@AsyncFunction
      }

      pendingPermissionPromise = promise
      activity.startActivityForResult(consentIntent, VPN_PERMISSION_REQUEST_CODE)
    }

    AsyncFunction("startTunnelAsync") {
      serverPublicKey: String,
      endpoint: String,
      clientAddress: String,
      dns: String,
      promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.reject("NO_CONTEXT", "No React context available", null)
        return@AsyncFunction
      }
      try {
        val keyPair = getOrCreateKeyPair(context)

        val iface = Interface.Builder()
          .setKeyPair(keyPair)
          .addAddress(InetNetwork.parse(clientAddress))
          .addDnsServer(java.net.InetAddress.getByName(dns))
          .build()

        val peer = Peer.Builder()
          .setPublicKey(Key.fromBase64(serverPublicKey))
          .setEndpoint(InetEndpoint.parse(endpoint))
          .addAllowedIp(InetNetwork.parse("0.0.0.0/0"))
          .setPersistentKeepalive(25)
          .build()

        val config = Config.Builder()
          .setInterface(iface)
          .addPeer(peer)
          .build()

        getBackend(context).setState(RoyalTunnel, Tunnel.State.UP, config)
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("TUNNEL_START_FAILED", e.message, e)
      }
    }

    AsyncFunction("stopTunnelAsync") { promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.resolve(false)
        return@AsyncFunction
      }
      try {
        getBackend(context).setState(RoyalTunnel, Tunnel.State.DOWN, null)
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("TUNNEL_STOP_FAILED", e.message, e)
      }
    }

    AsyncFunction("isActive") { promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.resolve(false)
        return@AsyncFunction
      }
      try {
        promise.resolve(getBackend(context).getState(RoyalTunnel) == Tunnel.State.UP)
      } catch (e: Exception) {
        promise.resolve(false)
      }
    }

    // Real Kill Switch / Royal Lockdown enforcement: establishes a
    // black-hole VPN interface that blocks every other app's traffic
    // (this app is excluded so it can still reach the network to
    // reconnect) until the real WireGuard tunnel is back up.
    AsyncFunction("startGuardAsync") { promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.resolve(false)
        return@AsyncFunction
      }
      try {
        val intent = Intent(context, RoyalGuardVpnService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          context.startForegroundService(intent)
        } else {
          context.startService(intent)
        }
        promise.resolve(true)
      } catch (e: Exception) {
        promise.resolve(false)
      }
    }

    AsyncFunction("stopGuardAsync") { promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.resolve(false)
        return@AsyncFunction
      }
      try {
        val intent = Intent(context, RoyalGuardVpnService::class.java).setAction(RoyalGuardVpnService.ACTION_STOP)
        context.startService(intent)
        promise.resolve(true)
      } catch (e: Exception) {
        promise.resolve(false)
      }
    }

    AsyncFunction("isGuardActive") { promise: Promise ->
      promise.resolve(RoyalGuardVpnService.isActive)
    }

    OnActivityResult { _, payload ->
      if (payload.requestCode == VPN_PERMISSION_REQUEST_CODE) {
        pendingPermissionPromise?.resolve(payload.resultCode == Activity.RESULT_OK)
        pendingPermissionPromise = null
      }
    }
  }
}
