package com.chatwoot.app

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WhatsAppLauncherModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "WhatsAppLauncher"

  @ReactMethod
  fun openBusinessChat(phoneNumber: String, promise: Promise) {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("whatsapp://send?phone=$phoneNumber")).apply {
      setPackage("com.whatsapp.w4b")
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    try {
      reactApplicationContext.startActivity(intent)
      promise.resolve(true)
    } catch (e: ActivityNotFoundException) {
      promise.reject("NOT_INSTALLED", "WhatsApp Business is not installed", e)
    }
  }
}
