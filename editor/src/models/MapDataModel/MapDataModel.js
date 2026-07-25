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
            this.createLayer({ 
                id: 0,
                name: 'Background Layer 1', 
                visible: true, 
                opacity: 1, 
                width: this.columns, 
                height: this.rows, 
                type: LayerType.BACKGROUND 
            }, LayerType.BACKGROUND)
        ];

        // 2. Map Layers vindos do JSON do Tiled
        const rawLayers = rawJsonData.layers;
        this.mapLayers = [
            this.createLayer({ 
                id: 0,
                name: 'Map Layer 1', 
                visible: true, 
                opacity: 1, 
                width: this.columns, 
                height: this.rows, 
                type: LayerType.TILE 
            }, LayerType.TILE)
        ];

        // 3. Event Layer inicial garantido com dimensões padrão
        this.eventLayers = [
            this.createLayer({ 
                id: 0,
                name: 'Event Layer 1', 
                visible: true, 
                opacity: 1, 
                width: this.columns, 
                height: this.rows, 
                type: LayerType.EVENT, 
                data: [] 
            }, LayerType.EVENT)
        ];
        
        // 4. UI Layer inicial garantido
        this.UILayer = [
            this.createLayer({ 
                id: 0, 
                name: 'UI Layer 1', 
                visible: true, 
                opacity: 1, 
                width: this.columns, 
                height: this.rows, 
                type: LayerType.UI, 
                data: [] 
            }, LayerType.UI)
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

    toJSON() {
        return {
            width: this.columns,
            height: this.rows,
            tilewidth: this.tile.width,
            tileheight: this.tile.height,
            orientation: this.orientation,
            renderorder: this.renderOrder,
            
            tilesets: this.tilesets.map(ts => (ts.toJSON ? ts.toJSON() : { ...ts })),
            
            // Exporta todas as categorias de camadas para o arquivo JSON
            backgroundLayers: this.backgroundLayers.map(l => (l.toJSON ? l.toJSON() : { ...l })),
            mapLayers: this.mapLayers.map(l => (l.toJSON ? l.toJSON() : { ...l })),
            eventLayers: this.eventLayers.map(l => (l.toJSON ? l.toJSON() : { ...l })),
            UILayer: this.UILayer.map(l => (l.toJSON ? l.toJSON() : { ...l }))
        };
    }
}