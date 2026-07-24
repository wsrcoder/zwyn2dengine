import { MapDataModel } from '../models/MapDataModel/MapDataModel.js';
import { TilesetRenderer } from '../renderers/TilesetRenderer.js';
// MapRenderer can be imported here later when needed

export class EditorController {
    constructor() {
        this.mapDataModel = null;
        this.tilesetRenderer = null;
        
        // Global editor states
        this.activeLayerIndex = { bucketId: 0, index: 0 };
        this.selectedBrush = { x: 0, y: 0, width: 32, height: 32 };
        this.activeTab = 'tilesets';
    }

    // Set the loaded map data model
    setMapDataModel(mapDataModel) {
        this.mapDataModel = mapDataModel;
    }

    // Mount and initialize the TilesetRenderer when the UI canvas is ready
    mountTilesetCanvas(canvasElement) {
        if (!canvasElement) return;

        const tileSize = this.mapDataModel?.tile?.width || 32;
        this.tilesetRenderer = new TilesetRenderer(canvasElement, null, tileSize);

        // Load the first tileset image if data model is already loaded
        this.loadActiveTilesetImage();
    }

    // Load the active tileset image into the renderer
    loadActiveTilesetImage() {
        if (!this.tilesetRenderer || !this.mapDataModel) return;

        const activeTileset = this.mapDataModel.tilesets?.[0];
        if (activeTileset && activeTileset.image) {
            const img = new Image();
            img.src = activeTileset.image;
            img.onload = () => {
                this.tilesetRenderer.setTilesetData(activeTileset, img);
                // Apply current selection if exists
                this.tilesetRenderer.setSelectedRect(this.selectedBrush);
            };
        }
    }

    // Handle user clicking on the tileset view
    handleTilesetClick(event) {
        if (!this.tilesetRenderer) return;

        const rect = this.tilesetRenderer.handleInputClick(event);
        this.setSelectedBrush(rect);
        
        return rect;
    }

    // Update selected brush/tile and notify renderer
    setSelectedBrush(rect) {
        this.selectedBrush = rect;
        if (this.tilesetRenderer) {
            this.tilesetRenderer.setSelectedRect(rect);
        }
    }

    // Getters for UI synchronization
    getSelectedBrush() {
        return this.selectedBrush;
    }
}