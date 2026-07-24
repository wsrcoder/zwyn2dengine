import { LayerType } from "../../Constants/LayerType.js";
import { LayerModel } from "./LayerModel.js";
import { TilesetModel } from "./TilesetModel.js";

export class MapDataModel {
    constructor(rawJsonData) {
        this.columns = rawJsonData.width;
        this.rows = rawJsonData.height;
        this.tile = {
            width: rawJsonData.tilewidth,
            height: rawJsonData.tileheight
        };

        this.orientation = rawJsonData.orientation || 'orthogonal';
        this.renderOrder = rawJsonData.renderorder || 'right-down';

        const rawTilesetData = rawJsonData.tilesets;
        if (Array.isArray(rawTilesetData)) {
            this.tilesets = rawTilesetData.map(tsData => this.createTilesetData(tsData));
        } else {
            this.tilesets = [];
        }

        // 1. Background Layer inicial garantido
        this.backgroundLayers = [
            this.createLayer({ name: 'Background 1', visible: true, opacity: 1, type: LayerType.BACKGROUND }, LayerType.BACKGROUND)
        ];

        // 2. Map Layers vindos do JSON do Tiled
        const rawLayers = rawJsonData.layers;
        if (Array.isArray(rawLayers)) {
            this.mapLayers = rawLayers.map(layerData => this.createLayer(layerData, LayerType.TILE));
        } else {
            this.mapLayers = [];
        }

        // 3. Event Layer inicial garantido
        this.eventLayers = [
            this.createLayer({ name: 'Event Layer 1', visible: true, opacity: 1, type: LayerType.EVENT, data: [] }, LayerType.EVENT)
        ];
        
        // 4. UI Layer inicial garantido
        this.UILayer = [
            this.createLayer({ name: 'UI Layer 1', visible: true, opacity: 1, type: LayerType.UI }, LayerType.UI)
        ];
    }

    createLayer(layerData, layerType) {
        return new LayerModel(layerData, layerType);
    }

    createTilesetData(tilesetData) {
        return new TilesetModel(tilesetData);
    }

    getLayerByName(name) {
        // Procura em todas as categorias de layers caso precise buscar por nome globalmente
        const allLayers = [
            ...this.backgroundLayers,
            ...this.mapLayers,
            ...this.eventLayers,
            ...this.UILayer
        ];
        return allLayers.find(layer => layer.name === name);
    }
}