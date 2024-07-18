package com.pontotech.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.AlertDialog
import android.app.DownloadManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.util.Base64
import android.webkit.GeolocationPermissions
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.pontotech.app.databinding.ActivityMainBinding
import org.json.JSONObject
import java.io.BufferedInputStream
import java.io.BufferedReader
import java.io.File
import java.io.InputStream
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var uploadMessage: ValueCallback<Uri?>? = null
    private var uploadMessages: ValueCallback<Array<Uri>>? = null
    private val FILE_CHOOSER_RESULT_CODE = 1

    private var CURRENT_VERSION: String = "1.4"
    private val VERSION_CHECK_URL = "https://cyberrobotics.com.br/download-pontotech/apk/version.json"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

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
        webView.loadUrl("file:///android_asset/index.html")

        // Solicitar permissões de localização e armazenamento em tempo de execução
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), REQUEST_CODE_LOCATION)
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE), REQUEST_CODE_STORAGE)
        }

        createNotificationChannel()
        ReminderScheduler.scheduleDailyReminder(this)
        checkForUpdates()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "ReminderChannel"
            val description = "Channel for daily reminder"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel("reminderChannel", name, importance).apply {
                this.description = description
            }
            val notificationManager: NotificationManager =
                getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
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
            .setPositiveButton("Atualizar") { _, _ -> downloadAndInstallApk(apkUrl) }
            .setNegativeButton("Não", null)
            .show()
    }

    private fun downloadAndInstallApk(apkUrl: String) {
        val request = DownloadManager.Request(Uri.parse(apkUrl))
        request.setTitle("Atualizando o PontoTech")
        request.setDescription("Baixando a versão mais recente do aplicativo.")
        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
        request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "app.apk")

        val manager = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        val downloadId = manager.enqueue(request)

        val onComplete = object : BroadcastReceiver() {
            override fun onReceive(ctxt: Context, intent: Intent) {
                val downloadIdCompleted = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
                if (downloadId == downloadIdCompleted) {
                    val apkUri = FileProvider.getUriForFile(
                        this@MainActivity,
                        "${applicationContext.packageName}.fileprovider",
                        File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "app.apk")
                    )

                    val installIntent = Intent(Intent.ACTION_VIEW)
                    installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive")
                    installIntent.flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK
                    startActivity(installIntent)
                    unregisterReceiver(this)
                }
            }
        }

        registerReceiver(onComplete, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE))
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
    }

    companion object {
        private const val REQUEST_CODE_CAMERA = 1
        private const val REQUEST_CODE_LOCATION = 2
        private const val REQUEST_CODE_STORAGE = 3
    }
}
