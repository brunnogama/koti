package com.koti.smarthome;

import android.service.quicksettings.Tile;
import android.service.quicksettings.TileService;

public class KotiQuickTileService extends TileService {

    @Override
    public void onStartListening() {
        super.onStartListening();
        Tile tile = getQsTile();
        if (tile != null) {
            tile.setLabel("Koti Luz Sala");
            tile.updateTile();
        }
    }

    @Override
    public void onClick() {
        super.onClick();
        Tile tile = getQsTile();
        if (tile == null) return;

        boolean isCurrentlyActive = (tile.getState() == Tile.STATE_ACTIVE);

        // Toggle state
        if (isCurrentlyActive) {
            tile.setState(Tile.STATE_INACTIVE);
            tile.setSubtitle("Desligado");
        } else {
            tile.setState(Tile.STATE_ACTIVE);
            tile.setSubtitle("Ligado");
        }
        tile.updateTile();

        // Send Home Assistant command
        HomeAssistantApiHelper.toggleEntity(getApplicationContext(), "light.living_room_main");
    }
}
