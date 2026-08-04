
import { LayerType } from "../../constants/LayerType";

export class TileLayerModel {
    constructor(data = {}) {
        this.id = data.id ?? 1;
        this.name = data.name ?? `Layer ${this.id}`;
        this.type = data.type ?? LayerType.TILE;
        this.visible = data.visible ?? true;
        this.opacity = data.opacity ?? 1.0;
        this.columns = data.columns ?? 20;
        this.rows = data.rows ?? 15;
        this.x = data.x ?? 0;
        this.y = data.y ?? 0;
        this.data = data.data ?? [];
        this.properties = data.properties ?? {};
    }

    getTileAt(x, y) {
        if (x < 0 || x >= this.columns || y < 0 || y >= this.rows) return null;
        
        if (this.type !== LayerType.TILE && this.type !== LayerType.BACKGROUND) {
            if (!this.data || this.data.length === 0) return null;
        }

        const index = y * this.columns + x;
        return this.data[index] ?? null;
    }

    setTileAt(x, y, newTileId) {
        if (x < 0 || x >= this.columns || y < 0 || y >= this.rows) return false;
        
        if (this.type !== LayerType.TILE && this.type !== LayerType.BACKGROUND) {
            return false; 
        }

        const index = y * this.columns + x;
        this.data[index] = newTileId;
        return true;
    }

    getTileSelection(startX, startY, width, height) {
        const selection = {
            width: width,
            height: height,
            tiles: []
        };

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const targetX = startX + x;
                const targetY = startY + y;
                
                const tileId = this.getTileAt(targetX, targetY);
                selection.tiles.push(tileId);
            }
        }

        return selection;
    }

    setTileSelection(startX, startY, selectionData) {
        if (!selectionData || !selectionData.tiles || selectionData.tiles.length === 0) return false;

        const { width, height, tiles } = selectionData;
        let modified = false;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const targetX = startX + x;
                const targetY = startY + y;
                
                const selectionIndex = y * width + x;
                const tileId = tiles[selectionIndex];

                if (targetX >= 0 && targetX < this.columns && targetY >= 0 && targetY < this.rows) {
                    const mapIndex = targetY * this.columns + targetX;
                    if (this.data[mapIndex] !== tileId) {
                        modified = true;
                    }
                    this.data[mapIndex] = tileId;
                }
            }
        }

        return modified;
    }

    getProperty(key) {
        return this.properties ? this.properties[key] : undefined;
    }

    setProperty(key, value) {
        if (!this.properties) {
            this.properties = {};
        }
        this.properties[key] = value;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            opacity: this.opacity,
            visible: this.visible,
            columns: this.columns,
            rows: this.rows,
            x: this.x,
            y: this.y,
            data: [...this.data],
            properties: {...this.properties}
        };
    }
}