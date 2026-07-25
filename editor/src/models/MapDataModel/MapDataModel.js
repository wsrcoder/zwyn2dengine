import { LayerType } from "../../Constants/LayerType.js";
import { LayerModel } from "./LayerModel.js";
import { TilesetModel } from "./TilesetModel.js";

export class MapDataModel {
    constructor(rawJsonData) {
        this.columns = rawJsonData.columns;
        this.rows = rawJsonData.rows;
        this.tile = {
            width: rawJsonData.tile.width,
            height: rawJsonData.tile.height
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
                visible: rawJsonData.backgroundLayers.visible || true, 
                opacity:  rawJsonData.backgroundLayers.opacity || 1, 
                columns: rawJsonData.backgroundLayers.columns || this.columns, 
                rows: rawJsonData.backgroundLayers.rows || this.rows, 
                type: rawJsonData.backgroundLayers.type || LayerType.BACKGROUND,
                data: rawJsonData.backgroundLayers.data || []
            })
        ];

        // 2. Map Layers vindos do JSON do Tiled
        this.mapLayers = [
            this.createLayer({ 
                id: 0,
                name: 'Map Layer 1', 
                visible: rawJsonData.mapLayers.visible || true, 
                opacity:  rawJsonData.mapLayers.opacity || 1, 
                columns: rawJsonData.mapLayers.columns || this.columns, 
                rows: rawJsonData.mapLayers.rows || this.rows, 
                type: rawJsonData.mapLayers.type || LayerType.TILE, 
                data: rawJsonData.mapLayers.data || []
            })
        ];

        // 3. Event Layer inicial garantido com dimensões padrão
        this.eventLayers = [
            this.createLayer({ 
                id: 0,
                name: 'Event Layer 1', 
                visible: rawJsonData.eventLayers.visible || true, 
                opacity:  rawJsonData.eventLayers.opacity || 1, 
                columns: rawJsonData.eventLayers.columns || this.columns, 
                rows: rawJsonData.eventLayers.rows || this.rows, 
                type: rawJsonData.eventLayers.type || LayerType.EVENT, 
                data: rawJsonData.eventLayers.data || []
            })
        ];
        
        // 4. UI Layer inicial garantido
        this.UILayer = [
            this.createLayer({ 
                id: 0, 
                name: 'UI Layer 1', 
                visible: rawJsonData.UILayer.visible || true, 
                opacity:  rawJsonData.UILayer.opacity || 1, 
                columns: rawJsonData.UILayer.columns || this.columns, 
                rows: rawJsonData.UILayer.rows || this.rows,
                type: rawJsonData.UILayer.type || LayerType.UI, 
                data: rawJsonData.UILayer.data || [] 
            })
        ];
    }

    createLayer(layerData) {
        return new LayerModel(layerData);
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
            columns: this.columns,
            rows: this.rows,
            tile:{
                width: this.tile.width,
                height: this.tile.height
            },
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