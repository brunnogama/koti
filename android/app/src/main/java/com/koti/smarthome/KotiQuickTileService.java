package com.koti.smarthome;

import android.graphics.drawable.Icon;
import android.service.quicksettings.Tile;
import android.service.quicksettings.TileService;

public class KotiQuickTileService extends TileService {

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
            tile.setLabel("Koti Luz");
            tile.setIcon(Icon.createWithResource(this, R.drawable.ic_qs_light));
            tile.updateTile();
        }
    }

    @Override
    public void onClick() {
        super.onClick();
        Tile tile = getQsTile();
        if (tile == null) return;

        boolean isCurrentlyActive = (tile.getState() == Tile.STATE_ACTIVE);

        if (isCurrentlyActive) {
            tile.setState(Tile.STATE_INACTIVE);
            tile.setSubtitle("Desligado");
        } else {
            tile.setState(Tile.STATE_ACTIVE);
            tile.setSubtitle("Ligado");
        }
        tile.updateTile();

        // Toggle primary light (Luminaria)
        HomeAssistantApiHelper.toggleEntity(getApplicationContext(), "light.luminaria_socket_1");
    }
}
