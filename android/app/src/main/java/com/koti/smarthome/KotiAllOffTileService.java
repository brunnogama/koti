package com.koti.smarthome;

import android.graphics.drawable.Icon;
import android.os.Handler;
import android.os.Looper;
import android.service.quicksettings.Tile;
import android.service.quicksettings.TileService;

public class KotiAllOffTileService extends TileService {

    @Override
    public void onTileAdded() {
        super.onTileAdded();
        updateTileState();
    }

    @Override
    public void onStartListening() {
        super.onStartListening();
        updateTileState();
    }

    private void updateTileState() {
        Tile tile = getQsTile();
        if (tile != null) {
            tile.setLabel("Apagar Tudo");
            tile.setIcon(Icon.createWithResource(this, R.drawable.ic_qs_power));
            tile.setState(Tile.STATE_INACTIVE);
            tile.setSubtitle("Toque para apagar");
            tile.updateTile();
        }
    }

    @Override
    public void onClick() {
        super.onClick();
        Tile tile = getQsTile();
        if (tile != null) {
            tile.setState(Tile.STATE_ACTIVE);
            tile.setSubtitle("Apagando...");
            tile.updateTile();

            HomeAssistantApiHelper.callService(getApplicationContext(), "light", "turn_off", "all");

            new Handler(Looper.getMainLooper()).postDelayed(() -> {
                Tile t = getQsTile();
                if (t != null) {
                    t.setState(Tile.STATE_INACTIVE);
                    t.setSubtitle("Tudo apagado");
                    t.updateTile();
                }
            }, 1200);
        }
    }
}
