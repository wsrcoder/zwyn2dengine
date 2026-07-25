export class TilesetModel {
    constructor(data = {}) {
        this.firstgid = data.firstgid || 1;
        this.name = data.name || "unknow";
        
        this.tile = {
            width: data.tile?.width || 32,
            height: data.tile?.height || 32,
            count: data.tile?.count || 1
        };

        this.columns = data.columns || 1;
        this.rows = data.rows || 1;
        
        this.image = {
            name: data.image?.name || '',
            width: data.image?.width || 0,
            height: data.image?.height || 0
        };

        // Para guardar propriedades especificas de tiles
        this.meta = data.meta || {};
    }

    getTileProperty(localTileId, propertyName) {
        if (this.meta[localTileId] && this.meta[localTileId].properties) {
            return this.meta[localTileId].properties[propertyName];
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

    /**
     * Retorna a representação em objeto plano JSON do tileset.
     * @returns {Object}
     */
    toJSON() {
        return {
            firstgid: this.firstgid,
            name: this.name,
            tile: {
                width: this.tile.width,
                height: this.tile.height,
                count: this.tile.count
            },
            columns: this.columns,
            rows: this.rows,
            image: {
                name: this.image.name,
                width: this.image.width,
                height: this.image.height
            },
            meta: this.meta
        };
    }
}