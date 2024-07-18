package com.pontotech.app
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import java.util.Calendar

object ReminderScheduler {

    // Método para agendar uma notificação diária às 07:00
    fun scheduleDailyReminder(context: Context) {
        scheduleReminder(context, 7, 0, "Registre seu horário", "Não se esqueça de registrar seu horário de entrada!")
        scheduleReminder(context, 11, 50, "Registre seu horário", "Não se esqueça de registrar seu horário de intervalo!")
        scheduleReminder(context, 12, 50, "Registre seu horário", "Não se esqueça de registrar seu horário de retorno!")
        scheduleReminder(context, 16, 50, "Registre seu horário", "Não se esqueça de registrar seu horário de saída!")
    }

    // Método para agendar uma notificação em um horário específico
    fun scheduleCustomReminder(context: Context, hourOfDay: Int, minute: Int, title: String, message: String) {
        scheduleReminder(context, hourOfDay, minute, title, message)
    }

    // Método genérico para agendar uma notificação em um horário específico
    private fun scheduleReminder(context: Context, hourOfDay: Int, minute: Int, title: String, message: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, ReminderReceiver::class.java).apply {
            putExtra("title", title)
            putExtra("message", message)
        }
        val pendingIntent = PendingIntent.getBroadcast(context, (hourOfDay * 100) + minute, intent, PendingIntent.FLAG_UPDATE_CURRENT)

        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, hourOfDay)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
        }

        if (Calendar.getInstance().after(calendar)) {
            calendar.add(Calendar.DAY_OF_MONTH, 1)
        }

        alarmManager.setInexactRepeating(
            AlarmManager.RTC_WAKEUP,
            calendar.timeInMillis,
            AlarmManager.INTERVAL_DAY,
            pendingIntent
        )
    }
}

