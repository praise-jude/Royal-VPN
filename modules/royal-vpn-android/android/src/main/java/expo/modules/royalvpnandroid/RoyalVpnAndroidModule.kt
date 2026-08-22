package expo.modules.royalvpnandroid

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val VPN_PERMISSION_REQUEST_CODE = 24601

class RoyalVpnAndroidModule : Module() {
  private var pendingPermissionPromise: Promise? = null

  override fun definition() = ModuleDefinition {
    Name("RoyalVpnAndroid")

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

    AsyncFunction("start") {
      appContext.reactContext?.let { context ->
        val intent = Intent(context, RoyalVpnService::class.java).setAction(RoyalVpnService.ACTION_CONNECT)
        context.startService(intent)
      }
    }

    AsyncFunction("stop") {
      appContext.reactContext?.let { context ->
        val intent = Intent(context, RoyalVpnService::class.java).setAction(RoyalVpnService.ACTION_DISCONNECT)
        context.startService(intent)
      }
    }

    AsyncFunction("isActive") {
      RoyalVpnService.isRunning
    }

    OnActivityResult { _, payload ->
      if (payload.requestCode == VPN_PERMISSION_REQUEST_CODE) {
        pendingPermissionPromise?.resolve(payload.resultCode == Activity.RESULT_OK)
        pendingPermissionPromise = null
      }
    }
  }
}
