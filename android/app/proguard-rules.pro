# Capacitor
-keep class com.getcapacitor.** { *; }
-keep class com.google.android.gms.** { *; }
-keep class * extends com.getcapacitor.Plugin
-keep class * extends com.getcapacitor.PluginCall
-dontwarn com.getcapacitor.**

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# AndroidX
-keep class androidx.core.app.CoreComponentFactory { *; }
-dontwarn androidx.**

# Keep annotations
-keepattributes *Annotation*
-keepattributes JavascriptInterface
-keepattributes InlinedApi

# Keep Gson serialization
-keepattributes Signature
-keep class com.google.gson.** { *; }
-keepattributes EnclosingMethod
