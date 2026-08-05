

import { LayerCategoryEnum } from "../../constants/Enums.js";
import { TileLayerModel } from "./TileLayerModel.js";
import { BackgroundLayerModel } from "./BackgroundLayerModel.js";
import { TilesetModel } from "./TilesetModel.js";
import { EventLayerModel } from "./EventLayerModel.js";
import { TerrainLayerModel } from "./TerrainLayerModel.js";
import {SceneOrientationEnum, SceneRenderOrderEnum} from "../../constants/Enums.js";

export default class SceneModel {
    constructor(data = {}) {
        this.id = data.id ?? 1;
        this.worldId = data.worldId ?? 1;
        this.type = data.type ?? "scene";
        this.name = data.name ?? "Scene";
        this.columns = data.columns ?? 20;
        this.rows = data.rows ?? 15;
        this.tile = {
            width: data.tile?.width ?? 32,
            height: data.tile?.height ?? 32
        };
        this.orientation = data.orientation ?? SceneOrientationEnum.ORTHOGONAL;
        this.renderOrder = data.renderorder ?? data.renderOrder ?? SceneRenderOrderEnum.RIGHT_DOWN;
        this.properties = data.properties ?? {};

        // Inicializa as coleções usando os Models correspondentes
        this.tilesets = Array.isArray(data.tilesets)
            ? data.tilesets.map(tsData => new TilesetModel(tsData))
            : [];

        // 1. Backgrounds (Agora usando BackgroundLayerModel)
        this.backgroundLayers = (data.backgroundLayers || []).map((layerData, index) => 
            this.createBackgroundLayer(layerData, LayerCategoryEnum.BACKGROUND, 'Background Layer', index)
        );

        // 2. Tile Layers
        this.tileLayers = (data.tileLayers || []).map((layerData, index) => 
            this.createTileLayer(layerData, LayerCategoryEnum.TILE, 'Tile Layer', index)
        );

         // 3. Terrain Layers
        this.terrainLayers = (data.terrainLayers || []).map((layerData, index) => 
            this.createTerrainLayer(layerData, LayerCategoryEnum.TERRAIN, 'Terrain Layer', index)
        );

        // 4. Events
        this.eventLayers = (data.eventLayers || []).map((layerData, index) => 
            this.createGameEventLayer(layerData, LayerCategoryEnum.EVENT, 'Event Layer', index)
        );

       
    }

    createBackgroundLayer(layerData = {}, defaultType = LayerCategoryEnum.BACKGROUND, defaultNamePrefix = 'Background Layer', index = 0) {
        const layerNum = index + 1;
        
        const normalizedData = {
            id: layerData.id !== undefined ? layerData.id : index,
            name: layerData.name || `${defaultNamePrefix} ${layerNum}`,
            visible: layerData.visible ?? true,
            opacity: layerData.opacity ?? 1,
            type: layerData.type || defaultType, // "image" ou "tiles"
            
            // Paralaxe e Movimento
            parallaxFactor: {
                x: layerData.parallaxFactor?.x ?? 1.0,
                y: layerData.parallaxFactor?.y ?? 1.0
            },
            scrollSpeed: {
                x: layerData.scrollSpeed?.x ?? 0,
                y: layerData.scrollSpeed?.y ?? 0
            },

            // Atributos condicionais baseados no tipo do background
            imagePath: layerData.imagePath ?? "",
            repeatX: layerData.repeatX ?? true,
            repeatY: layerData.repeatY ?? false,
            
            columns: layerData.columns || this.columns,
            rows: layerData.rows || this.rows,
            data: layerData.data || new Array(this.columns * this.rows).fill(0),
            
            properties: layerData.properties ?? {}
        };

        return new BackgroundLayerModel(normalizedData);
    }

    createTileLayer(layerData = {}, defaultType = LayerCategoryEnum.TILE, defaultNamePrefix = 'Layer', index = 0) {
        const layerNum = index + 1;
        
        const normalizedData = {
            id: layerData.id !== undefined ? layerData.id : index,
            name: layerData.name || `${defaultNamePrefix} ${layerNum}`,
            visible: layerData.visible ?? true,
            opacity: layerData.opacity ?? 1,
            columns: layerData.columns || this.columns,
            rows: layerData.rows || this.rows,
            type: layerData.type || defaultType,
            data: layerData.data || new Array(this.columns * this.rows).fill(0),
            properties: layerData.properties ?? {}
        };

        return new TileLayerModel(normalizedData);
    }

    createGameEventLayer(layerData = {}, defaultType = LayerCategoryEnum.EVENT, defaultNamePrefix = 'Event Layer', index = 0) {
        const layerNum = index + 1;
        
        const normalizedData = {
            id: layerData.id !== undefined ? layerData.id : index,
            name: layerData.name || `${defaultNamePrefix} ${layerNum}`,
            visible: layerData.visible ?? true,
            opacity: layerData.opacity ?? 1,
            type: layerData.type || defaultType,
            events: layerData.events || [],
            properties: layerData.properties ?? {}
        };

        return new EventLayerModel(normalizedData);
    }

    createTerrainLayer(layerData = {}, defaultType = LayerCategoryEnum.TERRAIN, defaultNamePrefix = 'Terrain Layer', index = 0) {
        const layerNum = index + 1;
        
        const normalizedData = {
            id: layerData.id !== undefined ? layerData.id : index,
            name: layerData.name || `${defaultNamePrefix} ${layerNum}`,
            visible: layerData.visible ?? true,
            opacity: layerData.opacity ?? 0.5, // Padrão semi-transparente para o overlay no editor
            type: layerData.type || defaultType,
            columns: layerData.columns || this.columns,
            rows: layerData.rows || this.rows,
            data: layerData.data || new Array(this.columns * this.rows).fill(0),
            properties: layerData.properties ?? {}
        };

        return new TerrainLayerModel(normalizedData);
    }

    getLayerByName(name) {
        const allLayers = [
            ...this.backgroundLayers,
            ...this.tileLayers,
            ...this.terrainLayers,
            ...this.eventLayers,
        ];
        return allLayers.find(layer => layer.name === name);
    }

    getLayersByType(type) {
        const allLayers = [
            ...this.backgroundLayers,
            ...this.tileLayers,
            ...this.terrainLayers,
            ...this.eventLayers,
        ];
        return allLayers.filter(layer => layer.type === type);
    }

    getProperty(key) {
        return this.properties ? this.properties[key] : undefined;
    }

    setProperty(key, value) {
        if (!this.properties) {
            this.properties = {};
        }
        this.properties[key] = value;
    }

    toJSON() {
        return {
            id: this.id,
            worldId: this.worldId,
            type: this.type,
            name: this.name,
            columns: this.columns,
            rows: this.rows,
            tile: {
                width: this.tile.width,
                height: this.tile.height
            },
            orientation: this.orientation,
            renderorder: this.renderOrder,
            
            tilesets: this.tilesets.map(ts => (ts.toJSON ? ts.toJSON() : { ...ts })),
            
            backgroundLayers: this.backgroundLayers.map(l => (l.toJSON ? l.toJSON() : { ...l })),
            tileLayers: this.tileLayers.map(l => (l.toJSON ? l.toJSON() : { ...l })),
            terrainLayers: this.terrainLayers.map(l => (l.toJSON ? l.toJSON() : { ...l })),
            eventLayers: this.eventLayers.map(l => (l.toJSON ? l.toJSON() : { ...l })),
            properties: this.properties
        };
    }
}