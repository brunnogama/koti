package com.koti.smarthome;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

public class MultiButtonWidget extends AppWidgetProvider {
    public static final String ACTION_BTN_1 = "com.koti.smarthome.ACTION_BTN_1";
    public static final String ACTION_BTN_2 = "com.koti.smarthome.ACTION_BTN_2";
    public static final String ACTION_BTN_3 = "com.koti.smarthome.ACTION_BTN_3";
    public static final String ACTION_BTN_4 = "com.koti.smarthome.ACTION_BTN_4";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_multi_button);

        setupButton(context, views, R.id.widget_btn_1, ACTION_BTN_1, appWidgetId);
        setupButton(context, views, R.id.widget_btn_2, ACTION_BTN_2, appWidgetId);
        setupButton(context, views, R.id.widget_btn_3, ACTION_BTN_3, appWidgetId);
        setupButton(context, views, R.id.widget_btn_4, ACTION_BTN_4, appWidgetId);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static void setupButton(Context context, RemoteViews views, int viewId, String action, int appWidgetId) {
        Intent intent = new Intent(context, MultiButtonWidget.class);
        intent.setAction(action);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            viewId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(viewId, pendingIntent);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        String action = intent.getAction();

        if (ACTION_BTN_1.equals(action)) {
            HomeAssistantApiHelper.toggleEntity(context, "light.living_room_main");
        } else if (ACTION_BTN_2.equals(action)) {
            HomeAssistantApiHelper.toggleEntity(context, "light.bedroom_ceiling");
        } else if (ACTION_BTN_3.equals(action)) {
            HomeAssistantApiHelper.toggleEntity(context, "scene.movie_night");
        } else if (ACTION_BTN_4.equals(action)) {
            HomeAssistantApiHelper.toggleEntity(context, "switch.desk_power");
        }
    }
}
