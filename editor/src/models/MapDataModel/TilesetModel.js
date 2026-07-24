
export class TilesetModel {
    constructor(data) {
        this.firstgid = data.firstgid || 1;
        this.name = data.name || "unknow";
        
        this.tile = {
            width: data.tilewidth || 32,
            height: data.tileheight || 32
        };

        this.tilecount = data.tilecount || 0;
        this.columns = data.columns || 1;
        this.rows = data.rows || 1;
        
        this.image = {
            name: data.image || '',
            width: data.imagewidth || 0,
            height: data.imageheight || 0
        };

        // Para guardar propriedades especificas de tiles
        this.tiles = data.tiles || {};
    }

    getTileProperty(localTileId, propertyName) {
        if (this.tiles[localTileId] && this.tiles[localTileId].properties) {
            return this.tiles[localTileId].properties[propertyName];
        }
        return undefined;
    }

    isWater(localTileId) {
        return !!this.getTileProperty(localTileId, "isWater");
    }

    isSolid(localTileId) {
        return !!this.getTileProperty(localTileId, "isSolid");
    }

    getTileRect(localTileId) {
        const col = localTileId % this.columns;
        const row = Math.floor(localTileId / this.columns);

        const x = col * this.tile.width;
        const y = row * this.tile.height;

        return {
            x,
            y,
            width: this.tile.width,
            height: this.tile.height
        };
    }
}