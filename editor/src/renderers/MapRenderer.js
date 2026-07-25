
import { LayerType } from '../constants/LayerType.js';

export class MapRenderer {
    constructor(canvas, mapWidth = 20, mapHeight = 15, tileSize = 32) {
        if (!canvas) {
            throw new Error("Canvas element is required for MapRenderer.");
        }

        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        this.mapData = {
            mapWidth: mapWidth,
            mapHeight: mapHeight,
            tileSize: tileSize,
            backgroundLayers: [],
            mapLayers: [],
            eventLayers: []
        };

        this.activeLayer = {
            bucketId: 0,
            index: 0
        };

        this.showGrid = true;
        this.tilesetImages = {};

        this.initialize();
    }

    initialize() {
        this.canvas.width = this.mapData.mapWidth * this.mapData.tileSize;
        this.canvas.height = this.mapData.mapHeight * this.mapData.tileSize;
    }

    setMapSize(mapWidth, mapHeight, tileSize) {
        this.mapData.mapWidth = mapWidth;
        this.mapData.mapHeight = mapHeight;
        this.mapData.tileSize = tileSize;
        this.initialize();
    }

    setTilesetImage(tilesetName, imageElement) {
        this.tilesetImages[tilesetName] = imageElement;
    }

    updateMapData(mapData, activeLayer, showGrid = true) {

        if (mapData) {
            this.mapData = mapData;
            
            const cols = mapData.columns || mapData.mapWidth || 20;
            const rows = mapData.rows || mapData.mapHeight || 15;
            const tWidth = mapData.tile?.width || mapData.tileSize || 32;

            this.mapData.mapWidth = cols;
            this.mapData.mapHeight = rows;
            this.mapData.tileSize = tWidth;

            // Garante a separação correta ou inicializa os arrays caso o JSON venha estruturado diferente
            this.mapData.backgroundLayers = mapData.backgroundLayers || [];
            this.mapData.mapLayers = mapData.mapLayers || mapData.layers || [];
            this.mapData.eventLayers = mapData.eventLayers || [];

            this.initialize();
        }

        if (activeLayer !== undefined) {
            this.activeLayer = activeLayer; 
        }

        if (showGrid !== undefined) {
            this.showGrid = showGrid;
        }
    }

    getContext() {
        return this.ctx;
    }

    render() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Renderiza as camadas de fundo / paralaxes independentes
        this.renderBackgroundLayers();

        // 2. Renderiza as camadas estruturais do mapa
        this.renderMapLayers();

        // 3. Renderiza a camada de eventos
        this.renderEventLayer();

        // 4. Camada de Grid isolada por cima de tudo
        if (this.showGrid) {
            this.renderUILayer();
        }
    }

    renderBackgroundLayers() {
        if (!Array.isArray(this.mapData.backgroundLayers)) return;

        this.mapData.backgroundLayers.forEach(layer => {
            if (!layer.visible) return;
            // Lógica específica para desenhar paralaxes / background
        });
    }

    renderMapLayers() {
        const layers = this.mapData.mapLayers;
        if (!Array.isArray(layers) || layers.length === 0) return;

        layers.forEach(layer => {
            if (!layer.visible) return; 

            if (Array.isArray(layer.data)) {
                const tilesets = this.mapData.tilesets || [];
                const tileWidth = this.mapData.tile?.width || this.mapData.tileSize;
                const tileHeight = this.mapData.tile?.height || this.mapData.tileSize;
                const mapWidth = this.mapData.columns || this.mapData.mapWidth;

                layer.data.forEach((gid, index) => {
                    if (gid === 0) return; 

                    const tileset = tilesets.slice().reverse().find(ts => gid >= ts.firstgid);
                    if (!tileset) return;

                    const localTileId = gid - tileset.firstgid;
                    const img = this.tilesetImages[tileset.name];
                    
                    //console.log("render:");
                    if (!img) return; 

                    const col = index % mapWidth;
                    const row = Math.floor(index / mapWidth);

                    const destX = col * tileWidth;
                    const destY = row * tileHeight;

                    const rect = tileset.getTileRect(localTileId);

                    this.ctx.drawImage(
                        img,
                        rect.x, rect.y, rect.width, rect.height,
                        destX, destY, tileWidth, tileHeight
                    );
                });
            }
        });
    }

    renderEventLayer() {
        if (!Array.isArray(this.mapData.eventLayers)) return;

        this.mapData.eventLayers.forEach(layer => {
            if (!layer.visible) return;
            // Lógica para desenhar os ícones de eventos e colisões
        });
    }

    renderUILayer() {
        // Assume que a camada de grid/UI está armazenada em this.mapData.UILayer
        const uiLayers = this.mapData.UILayer || [];
        
        // Verifica se existe pelo menos uma camada de grid visível
        const shouldDrawGrid = uiLayers.some(layer => layer.visible !== false);
        
        if (!shouldDrawGrid || !this.showGrid) return;

        const { mapWidth, mapHeight, tileSize } = this.mapData;

        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        for (let x = 0; x <= mapWidth * tileSize; x += tileSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, mapHeight * tileSize);
        }

        for (let y = 0; y <= mapHeight * tileSize; y += tileSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(mapWidth * tileSize, y);
        }

        this.ctx.stroke();
    }

    handleClickEvent(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const tileX = Math.floor(mouseX / this.mapData.tileSize);
        const tileY = Math.floor(mouseY / this.mapData.tileSize);
        const tileIndex = tileX + (tileY * this.mapData.mapWidth);

        return {
            tileX,
            tileY,
            tileIndex,
            isOutOfBounds: tileX < 0 || tileY < 0 || tileX >= this.mapData.mapWidth || tileY >= this.mapData.mapHeight
        };
    }
}