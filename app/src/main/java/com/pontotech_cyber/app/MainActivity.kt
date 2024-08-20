package com.pontotech_cyber.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.AlarmManager
import android.app.AlertDialog
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Base64
import android.webkit.GeolocationPermissions
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.pontotech_cyber.app.databinding.ActivityMainBinding
import org.json.JSONObject
import java.io.BufferedInputStream
import java.io.BufferedReader
import java.io.InputStream
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.Calendar

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var uploadMessage: ValueCallback<Uri?>? = null
    private var uploadMessages: ValueCallback<Array<Uri>>? = null
    private val FILE_CHOOSER_RESULT_CODE = 1

    private var CURRENT_VERSION: String = "2.2"
    private val VERSION_CHECK_URL = "https://cyberrobotics.com.br/download-pontotech/apk/version.json"

    companion object {
        private const val REQUEST_CODE_CAMERA = 1
        private const val REQUEST_CODE_LOCATION = 2
        private const val REQUEST_CODE_STORAGE = 3
        const val CHANNEL_ID = "exampleChannel"
        private const val REQUEST_CODE_EXACT_ALARM_PERMISSION = 100
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        createNotificationChannel()

        val webView = binding.webView
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.mediaPlaybackRequiresUserGesture = false
        webView.settings.setGeolocationEnabled(true)
        webView.webViewClient = WebViewClient()
        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                handlePermissionRequest(request)
            }

            override fun onGeolocationPermissionsShowPrompt(origin: String?, callback: GeolocationPermissions.Callback?) {
                callback?.invoke(origin, true, false)
            }

            override fun onShowFileChooser(
                webView: WebView,
                filePathCallback: ValueCallback<Array<Uri>>,
                fileChooserParams: FileChooserParams
            ): Boolean {
                if (uploadMessages != null) {
                    uploadMessages?.onReceiveValue(null)
                    uploadMessages = null
                }
                uploadMessages = filePathCallback
                val intent = fileChooserParams.createIntent()
                try {
                    startActivityForResult(intent, FILE_CHOOSER_RESULT_CODE)
                } catch (e: Exception) {
                    uploadMessages = null
                    return false
                }
                return true
            }
        }

        WebView.setWebContentsDebuggingEnabled(true)
        webView.addJavascriptInterface(MyWebAppInterface(this), "AndroidInterface")
        webView.loadUrl("file:///android_asset/login.html")

        // Solicitar permissões de localização e armazenamento em tempo de execução
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), REQUEST_CODE_LOCATION)
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE), REQUEST_CODE_STORAGE)
        }

        checkForUpdates()
        requestExactAlarmPermission()

        // Handle the incoming intent
        handleIntent(intent)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        intent?.let { handleIntent(it) }
    }

    private fun handleIntent(intent: Intent) {
        val action = intent.action
        val data = intent.data

        if (Intent.ACTION_VIEW == action && data != null) {
            // Handle the deep link, for example, you can load a specific page in the WebView
            val webView = binding.webView
            webView.loadUrl("file:///android_asset/index.html")
            // Or handle other logic based on the deep link
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Example Channel"
            val descriptionText = "This is an example notification channel"
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }

            val notificationManager: NotificationManager =
                getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun requestExactAlarmPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
            if (!alarmManager.canScheduleExactAlarms()) {
                val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
                resultLauncher.launch(intent)
            } else {
                scheduleNotifications()
            }
        } else {
            scheduleNotifications()
        }
    }

    private val resultLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
            if (alarmManager.canScheduleExactAlarms()) {
                scheduleNotifications()
            } else {
                // Notificação ou ação alternativa para o caso da permissão não ser concedida
                AlertDialog.Builder(this)
                    .setTitle("Permissão Necessária")
                    .setMessage("Para que o alarme funcione corretamente, é necessário conceder permissão de alarme exato.")
                    .setPositiveButton("Ok") { _, _ -> }
                    .show()
            }
        }
    }

    private fun scheduleNotifications() {
        val alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager

        val times = listOf(
            Pair(6, 50),
            Pair(7, 0),
            Pair(11, 50),
            Pair(12, 0),
            Pair(12, 50),
            Pair(13, 0),
            Pair(16, 50),
            Pair(17, 0)
        )

        times.forEachIndexed { index, time ->
            val (hour, minute) = time
            val calendar = Calendar.getInstance().apply {
                timeInMillis = System.currentTimeMillis()
                set(Calendar.HOUR_OF_DAY, hour)
                set(Calendar.MINUTE, minute)
                set(Calendar.SECOND, 0)
            }

            val intent = Intent(this, NotificationReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(this, index, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

            alarmManager.setExact(
                AlarmManager.RTC_WAKEUP,
                calendar.timeInMillis,
                pendingIntent
            )
        }
    }

    private fun checkForUpdates() {
        Thread {
            try {
                val url = URL(VERSION_CHECK_URL)
                val urlConnection = url.openConnection() as HttpURLConnection
                val inputStream = BufferedInputStream(urlConnection.inputStream)
                val reader = BufferedReader(InputStreamReader(inputStream))
                val result = StringBuilder()
                reader.forEachLine { result.append(it) }

                val jsonObject = JSONObject(result.toString())
                val latestVersion = jsonObject.getString("latest_version")
                val apkUrl = jsonObject.getString("apk_url")

                if (CURRENT_VERSION != latestVersion) {
                    runOnUiThread {
                        showUpdateDialog(apkUrl)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }.start()
    }

    private fun showUpdateDialog(apkUrl: String) {
        AlertDialog.Builder(this)
            .setTitle("Nova versão disponível!")
            .setMessage("Para acessar as novas funcionalidades do PontoTech, atualize o app.")
            .setPositiveButton("Atualizar") { _, _ -> redirecionar(apkUrl) }
            .setNegativeButton("Não", null)
            .show()
    }

    private fun redirecionar(apkUrl: String) {
        val intent = Intent(Intent.ACTION_VIEW)
        intent.data = Uri.parse(apkUrl)
        startActivity(intent)
    }

    private fun handlePermissionRequest(request: PermissionRequest) {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), REQUEST_CODE_CAMERA)
        } else {
            request.grant(request.resources)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_CODE_CAMERA && grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            binding.webView.reload()
        } else if (requestCode == REQUEST_CODE_LOCATION && grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            binding.webView.reload()
        } else if (requestCode == REQUEST_CODE_STORAGE && grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            binding.webView.reload()
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == FILE_CHOOSER_RESULT_CODE) {
            if (uploadMessages == null && uploadMessage == null) return
            val result = if (data == null || resultCode != RESULT_OK) null else data.data
            uploadMessage?.onReceiveValue(result)
            uploadMessage = null
            uploadMessages?.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data))
            uploadMessages = null
        }
        super.onActivityResult(requestCode, resultCode, data)
    }

    inner class MyWebAppInterface(private val context: MainActivity) {
        @android.webkit.JavascriptInterface
        fun getWasmFile(): String? {
            var inputStream: InputStream? = null
            return try {
                inputStream = context.assets.open("sql-wasm.wasm")
                val buffer = ByteArray(inputStream.available())
                inputStream.read(buffer)
                Base64.encodeToString(buffer, Base64.NO_WRAP)
            } catch (e: Exception) {
                e.printStackTrace()
                null
            } finally {
                inputStream?.close()
            }
        }

        @android.webkit.JavascriptInterface
        fun getCurrentVersion(): String {
            return context.CURRENT_VERSION
        }
    }

}
