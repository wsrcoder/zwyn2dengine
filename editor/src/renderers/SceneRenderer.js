
import { ProjectParams } from "../constants/ProjectParams";

export default class SceneRenderer {
    constructor(canvasElement, tilesetCache) {
        this.canvas = canvasElement;
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.tilesetCache = tilesetCache;
        this.currentScene = null;
        this.tileWidth = 32;
        this.tileHeight = 32;

        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        
        setTimeout(() => this.handleResize(), 0);

        this.animating = false; // TODO: se true o editor renderiza animações configuradas
    }

    setScene(sceneModel) {
        this.currentScene = sceneModel;
        if (sceneModel) {
            this.tileWidth = sceneModel.tileWidth || 32;
            this.tileHeight = sceneModel.tileHeight || 32;
            this.handleResize();
        }
    }

    handleResize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        if (parent) {
            this.canvas.width = parent.clientWidth;
            this.canvas.height = parent.clientHeight;
            this.render();
        }
    }

    render(selectionRect = null, showGrid = true) {
        if (!this.ctx || !this.currentScene || !this.tilesetCache) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.imageSmoothingEnabled = false;

        // 1. Camadas de Fundo (Background)
        this.renderBackgroundLayers();

        // 2. Camadas de Tiles padrão (Tile Layers)
        this.renderTileLayers();

        // 3. Camadas de Terreno (Terrain Layers - Cores semitransparentes)
        this.renderTerrainLayers();

        // 4. Camada de Eventos (Event Layer - Quadrados identificadores)
        this.renderEventLayer();

        // 5. Grid do mapa
        if (showGrid) {
            this.renderGrid();
        }

        // 6. Overlay de Seleção (se houver)
        if (selectionRect) {
            this.renderSelectionOverlay(selectionRect);
        }
    }

    renderBackgroundLayers() {
        if (!this.currentScene.backgroundLayers || !Array.isArray(this.currentScene.backgroundLayers)) return;
        for (const layer of this.currentScene.backgroundLayers) {
            if (layer.visible !== false) {
                this.renderLayer(layer);
            }
        }
    }

    renderTileLayers() {
        // Suporta tanto uma lista unificada 'layers' quanto a separada 'tileLayers'
        const layers = this.currentScene.tileLayers || this.currentScene.layers;
        if (!layers || !Array.isArray(layers)) return;

        for (const layer of layers) {
            if (layer.visible !== false) {
                this.renderLayer(layer);
            }
        }
    }

    renderTerrainLayers() {
        if (!this.currentScene.terrainLayers || !Array.isArray(this.currentScene.terrainLayers)) return;

        const cols = this.currentScene.columns;

        this.ctx.save();
        for (const layer of this.currentScene.terrainLayers) {
            if (layer.visible === false) continue;

            const data = layer.data || layer.tiles;
            if (!data || !Array.isArray(data)) continue;

            const fillColor = layer.color || 'rgba(46, 204, 113, 0.35)';
            const strokeColor = layer.borderColor || 'rgba(39, 174, 96, 0.6)';

            data.forEach((terrainId, index) => {
                if (terrainId <= 0) return;

                const x = (index % cols) * this.tileWidth;
                const y = Math.floor(index / cols) * this.tileHeight;

                this.ctx.fillStyle = fillColor;
                this.ctx.fillRect(x, y, this.tileWidth, this.tileHeight);

                this.ctx.strokeStyle = strokeColor;
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, this.tileWidth, this.tileHeight);
            });
        }
        this.ctx.restore();
    }

    renderEventLayer() {
        if (!this.currentScene.eventLayer && !this.currentScene.events) return;

        const eventsData = this.currentScene.eventLayer || this.currentScene.events;
        const cols = this.currentScene.columns;

        this.ctx.save();
        
        if (Array.isArray(eventsData)) {
            eventsData.forEach((eventItem) => {
                if (!eventItem) return;
                
                const index = eventItem.index !== undefined ? eventItem.index : (eventItem.y * cols + eventItem.x);
                if (index < 0) return;

                const x = (index % cols) * this.tileWidth;
                const y = Math.floor(index / cols) * this.tileHeight;

                this.ctx.fillStyle = 'rgba(241, 196, 15, 0.45)';
                this.ctx.fillRect(x, y, this.tileWidth, this.tileHeight);

                this.ctx.strokeStyle = '#f39c12';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, this.tileWidth, this.tileHeight);

                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '10px sans-serif';
                this.ctx.fillText('EV', x + 4, y + 14);
            });
        }
        
        this.ctx.restore();
    }

    renderGrid() {
        if (!this.ctx || !this.currentScene) return;

        const mapWidth = this.canvas.width;
        const mapHeight = this.canvas.height;
        const cols = this.currentScene.columns;
        const rows = this.currentScene.rows;

        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        this.ctx.lineWidth = 1;

        for (let c = 0; c <= cols; c++) {
            const x = c * this.tileWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, mapHeight);
            this.ctx.stroke();
        }

        for (let r = 0; r <= rows; r++) {
            const y = r * this.tileHeight;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(mapWidth, y);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    renderSelectionOverlay(rect) {
        if (!rect) return;

        const startX = rect.startX ?? rect.x ?? 0;
        const startY = rect.startY ?? rect.y ?? 0;
        const endX = rect.endX ?? startX;
        const endY = rect.endY ?? startY;

        const minX = Math.min(startX, endX);
        const minY = Math.min(startY, endY);
        const maxX = Math.max(startX, endX);
        const maxY = Math.max(startY, endY);

        const pixelX = minX * this.tileWidth;
        const pixelY = minY * this.tileHeight;
        const pixelWidth = (maxX - minX + 1) * this.tileWidth;
        const pixelHeight = (maxY - minY + 1) * this.tileHeight;

        this.ctx.save();
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(pixelX, pixelY, pixelWidth, pixelHeight);
        
        this.ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
        this.ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
        this.ctx.restore();
    }

    renderLayer(layer) {
        const data = layer.data || layer.tiles;
        if (!data || !Array.isArray(data)) return;

        const cols = this.currentScene.columns;

        data.forEach((tileId, index) => {
            if (tileId <= 0) return;

            const x = (index % cols) * this.tileWidth;
            const y = Math.floor(index / cols) * this.tileHeight;

            const found = this.findTilesetForTile(tileId);

            if (found && found.entry && found.entry.image) {
                const { sx, sy } = this.calculateSourceCoordinates(tileId, found.tilesetData);

                // --- DEBUG DE PONTO DE CORTE ---
                console.log(`[DEBUG TILE] ID: ${tileId} | Index na Matriz: ${index} | X_Grid: ${x/this.tileWidth}, Y_Grid: ${y/this.tileHeight} | Recortando da Imagem em: sx=${sx}, sy=${sy}`);
                // ---------------------------------

                this.ctx.drawImage(
                    found.entry.image,
                    sx, sy, this.tileWidth, this.tileHeight,
                    x, y, this.tileWidth, this.tileHeight
                );
            }
        });
    }

    findTilesetForTile(tileId) {
        if (!this.currentScene.tilesets || !Array.isArray(this.currentScene.tilesets)) return null;

        const sortedTilesets = [...this.currentScene.tilesets].sort((a, b) => (b.firstgid || 1) - (a.firstgid || 1));

        for (const t of sortedTilesets) {
            const firstgid = t.firstgid || 1;
            if (tileId >= firstgid) {
                const entry = this.tilesetCache.cache.get(t.name);
                if (entry) {
                    return { entry, firstgid, tilesetData: t };
                }
            }
        }
        return null;
    }

    calculateSourceCoordinates(tileId, tilesetData) {
        const firstgid = tilesetData.firstgid || 1;
        
        // Adicionamos +1 aqui para compensar o deslocamento de 1 coluna que estava empurrando o recorte
        const localId = Math.max(0, (tileId - firstgid) + 1);
        
        const tWidth = (tilesetData.tile && tilesetData.tile.width) || tilesetData.tileWidth || this.tileWidth;
        const tHeight = (tilesetData.tile && tilesetData.tile.height) || tilesetData.tileHeight || this.tileHeight;

        let colsInSheet = tilesetData.columns;
        if (!colsInSheet) {
            const cacheEntry = this.tilesetCache.cache.get(tilesetData.name);
            const image = cacheEntry ? cacheEntry.image : null;
            const imageWidth = image ? image.width : (tilesetData.imageFile ? tilesetData.imageFile.width : 0);
            colsInSheet = Math.max(1, Math.floor(imageWidth / tWidth));
        }

        const col = localId % colsInSheet;
        const row = Math.floor(localId / colsInSheet);

        const sx = col * tWidth;
        const sy = row * tHeight;

        return { sx, sy };
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize);
    }
}