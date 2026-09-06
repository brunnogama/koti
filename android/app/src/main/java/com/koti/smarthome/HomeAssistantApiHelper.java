package com.koti.smarthome;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class HomeAssistantApiHelper {
    private static final String TAG = "KotiHAHelper";
    private static final String PREFS_NAME = "CapacitorStorage";

    public static void toggleEntity(Context context, String entityId) {
        new Thread(() -> {
            try {
                SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                String configJson = prefs.getString("koti_ha_connection_config", null);

                String host = "192.168.1.100:8123";
                String token = "";

                if (configJson != null) {
                    // Simple parse or extraction
                    if (configJson.contains("\"host\":\"")) {
                        int start = configJson.indexOf("\"host\":\"") + 8;
                        int end = configJson.indexOf("\"", start);
                        if (end > start) host = configJson.substring(start, end);
                    }
                    if (configJson.contains("\"token\":\"")) {
                        int start = configJson.indexOf("\"token\":\"") + 9;
                        int end = configJson.indexOf("\"", start);
                        if (end > start) token = configJson.substring(start, end);
                    }
                }

                String cleanHost = host.replace("http://", "").replace("https://", "").replace("/", "");
                String protocol = host.startsWith("https") ? "https" : "http";

                String domain = entityId.contains(".") ? entityId.split("\\.")[0] : "light";
                String service = "toggle";

                URL url = new URL(protocol + "://" + cleanHost + "/api/services/" + domain + "/" + service);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                if (!token.isEmpty()) {
                    conn.setRequestProperty("Authorization", "Bearer " + token);
                }
                conn.setDoOutput(true);
                conn.setConnectTimeout(3000);
                conn.setReadTimeout(3000);

                String jsonPayload = "{\"entity_id\":\"" + entityId + "\"}";
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(jsonPayload.getBytes("UTF-8"));
                }

                int code = conn.getResponseCode();
                Log.d(TAG, "HA Toggle Response: " + code);
                conn.disconnect();
            } catch (Exception e) {
                Log.e(TAG, "Error toggling entity: " + entityId, e);
            }
        }).start();
    }
}
