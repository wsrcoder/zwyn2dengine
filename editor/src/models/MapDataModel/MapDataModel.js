import { LayerType } from "../../constants/LayerType.js";
import { LayerModel } from "./LayerModel.js";
import { TilesetModel } from "./TilesetModel.js";

export class MapDataModel {
    constructor(rawJsonData) {
        this.id = rawJsonData.id;
        this.worldId = rawJsonData.worldId;
        this.name = rawJsonData.name;
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

        // 1. Background Layer
        this.backgroundLayers = (rawJsonData.backgroundLayers || []).map((layerData, index) => 
            this.createLayer(layerData, LayerType.BACKGROUND, 'Background Layer', index)
        );

        // 2. Map Layers
        this.mapLayers = (rawJsonData.mapLayers || []).map((layerData, index) => 
            this.createLayer(layerData, LayerType.TILE, 'Map Layer', index)
        );

        // 3. Event Layer
        this.eventLayers = (rawJsonData.eventLayers || []).map((layerData, index) => 
            this.createLayer(layerData, LayerType.EVENT, 'Event Layer', index)
        );
        
        // 4. UI Layer
        this.UILayer = (rawJsonData.UILayer || []).map((layerData, index) => 
            this.createLayer(layerData, LayerType.UI, 'UI Layer', index)
        );
    }

    createLayer(layerData = {}, defaultType = LayerType.TILE, defaultNamePrefix = 'Layer', index = 0) {
        const layerNum = index + 1;
        
        const normalizedData = {
            id: layerData.id !== undefined ? layerData.id : index,
            name: layerData.name || `${defaultNamePrefix} ${layerNum}`,
            visible: layerData.visible ?? true,
            opacity: layerData.opacity ?? 1,
            columns: layerData.columns || this.columns,
            rows: layerData.rows || this.rows,
            type: layerData.type || defaultType,
            data: layerData.data || new Array(this.columns * this.rows).fill(0)
        };

        return new LayerModel(normalizedData);
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
            id: this.id,
            worldId: this.worldId,
            name: this.name,
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