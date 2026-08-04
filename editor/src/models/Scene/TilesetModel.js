
import { TileType } from "../../constants/TileType"; // Ajuste o caminho se necessário

export class TilesetModel {
    constructor(data = {}) {
        this.firstgid = data.firstgid ?? 1;
        this.name = data.name ?? "DefaultTileset";
        this.type = data.type ?? "tileset";
        this.tile = {
            width: data.tile?.width ?? 32,
            height: data.tile?.height ?? 32,
            count: data.tile?.count ?? 0
        };
        this.columns = data.columns ?? 8;
        this.rows = data.rows ?? 8;
        this.imageFile = {
            name: data.imageFile?.name ?? "",
            width: data.imageFile?.width ?? 256,
            height: data.imageFile?.height ?? 256
        };
        this.properties = data.properties ?? {};
    }

    // Retorna uma propriedade genérica de um tile específico
    getTileProperty(localTileId, propertyName) {
        const tileProps = this.properties[localTileId];
        if (tileProps) {
            return tileProps[propertyName];
        }
        return undefined;
    }

    // Define ou atualiza uma propriedade para um tile específico
    setTileProperty(localTileId, propertyName, value) {
        if (!this.properties[localTileId]) {
            this.properties[localTileId] = {};
        }
        this.properties[localTileId][propertyName] = value;
    }

    // Métodos utilitários baseados no TileType
    getTileType(localTileId) {
        return this.getTileProperty(localTileId, "type") ?? TileType.EMPTY;
    }

    setTileType(localTileId, tileType) {
        this.setTileProperty(localTileId, "type", tileType);
    }

    isSolid(localTileId) {
        const explicitSolid = this.getTileProperty(localTileId, "isSolid");
        if (explicitSolid !== undefined) return !!explicitSolid;

        return this.getTileType(localTileId) === TileType.SOLID;
    }

    isWater(localTileId) {
        const explicitWater = this.getTileProperty(localTileId, "isWater");
        if (explicitWater !== undefined) return !!explicitWater;

        return this.getTileType(localTileId) === TileType.WATER;
    }

    // Calcula o retângulo (bounding box/coords) do tile na spritesheet
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
     * Retorna a representação em objeto plano JSON pronta para salvar.
     * @returns {Object}
     */
    toJSON() {
        return {
            firstgid: this.firstgid,
            name: this.name,
            type: this.type,
            tile: {
                width: this.tile.width,
                height: this.tile.height,
                count: this.tile.count
            },
            columns: this.columns,
            rows: this.rows,
            imageFile: {
                name: this.imageFile.name,
                width: this.imageFile.width,
                height: this.imageFile.height
            },
            properties: JSON.parse(JSON.stringify(this.properties || {}))
        };
    }
}