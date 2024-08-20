package com.pontotech_cyber.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

class NotificationReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val notificationSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        val builder = NotificationCompat.Builder(context, MainActivity.CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification_2)
            .setContentTitle("Lembrete")
            .setContentText("Não se esqueça de registrar seus horários!")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setSound(notificationSound)

        with(NotificationManagerCompat.from(context)) {
            notify(1, builder.build())
        }
    }
}
