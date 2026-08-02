
export class TileUtils {
    /**
     * Converte coordenadas de pixel do canvas para a coluna/linha do tile.
     */
    static pixelToTileCoords(pixelX, pixelY, tileWidth, tileHeight) {
        return {
            x: Math.floor(pixelX / tileWidth),
            y: Math.floor(pixelY / tileHeight)
        };
    }

    /**
     * Normaliza dois pontos de clique/arraste para lidar com qualquer direção de seleção.
     */
    static normalizeRect(startX, startY, endX, endY) {
        return {
            startX: Math.min(startX, endX),
            startY: Math.min(startY, endY),
            endX: Math.max(startX, endX),
            endY: Math.max(startY, endY)
        };
    }

    /**
     * Calcula a seleção completa (retângulo, dimensões e sub-matriz de tiles).
     */
    static calculateSelection(startTileX, startTileY, endTileX, endTileY, tilesetMatrix) {
        const rect = this.normalizeRect(startTileX, startTileY, endTileX, endTileY);
        
        const width = (rect.endX - rect.startX) + 1;
        const height = (rect.endY - rect.startY) + 1;
        
        const tiles = [];

        for (let y = rect.startY; y <= rect.endY; y++) {
            const row = [];
            for (let x = rect.startX; x <= rect.endX; x++) {
                // Pega o ID do tile da matriz original do tileset (com proteção para limites)
                const tileId = tilesetMatrix?.[y]?.[x] ?? 0;
                row.push(tileId);
            }
            tiles.push(row);
        }

        return {
            width,
            height,
            tiles,
            sourceRect: rect
        };
    }
}