import { LayerType } from '../Constants/LayerType.js';

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
            layers: []
        };

        this.activeLayer = {
            bucketId: 0,
            index: 0
        };

        this.showGrid = true;

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

    updateMapData(mapData, activeLayer, showGrid = true) {
        if (mapData) {
            this.mapData = mapData;
            this.initialize(); // Garante que o canvas redimensiona se o mapData externo mudar de tamanho!
        }

        if (activeLayer !== undefined) {
            this.activeLayer = activeLayer; // Espera { bucketId, index }
        }

        if (showGrid !== undefined) {
            this.showGrid = showGrid;
        }
    }

    getContext() {
        return this.ctx;
    }

    render() {
        if (!this.ctx) {
            console.error("Canvas context is not available.");
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        //desempacot os buckets de mapData (garantindo fallbacks caso venham vazios)
        const [baseLayers = [], dynamicLayers = [], eventLayers = []] = this.mapData.layers || [];


        this.renderBucket(baseLayers);

        this.renderBucket(dynamicLayers);

        this.renderBucket(eventLayers);

        if (this.showGrid) {
            this.renderGridOverlay();
        }
    }

    renderBucket(layerList) {
        if (!Array.isArray(layerList) || layerList.length === 0) {
            return; // Removi o console.warn para não poluir o console enquanto o mapa estiver vazio no início
        }

        layerList.forEach(layer => {
            if(!layer.visible) return; // Pula camadas invisíveis

            if (layer.type === LayerType.TILE) {
                // Futura renderização de tiles
            } else if (layer.type === LayerType.EVENT) {
                // Futura renderização de eventos
            } else if (layer.type === LayerType.MARKER){

            }
        });
    }

    renderGridOverlay() {
        const { mapWidth, mapHeight, tileSize } = this.mapData;

        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 1;

        this.ctx.beginPath();

        // Linhas verticais
        for (let x = 0; x <= mapWidth * tileSize; x += tileSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, mapHeight * tileSize);
        }

        // Linhas horizontais
        for (let y = 0; y <= mapHeight * tileSize; y += tileSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(mapWidth * tileSize, y);
        }

        this.ctx.stroke();
    }

    getActiveLayerObject() {
        if (!this.activeLayer || !this.mapData.layers) return null;
        const { bucketId, index } = this.activeLayer;
        
        const bucket = this.mapData.layers[bucketId];
        if (!bucket) return null;

        return bucket[index] || null;
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