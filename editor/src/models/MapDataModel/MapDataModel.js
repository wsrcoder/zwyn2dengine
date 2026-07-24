
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

        const rawLayers = rawJsonData.layers;
        if (Array.isArray(rawLayers)) {
            this.layers = rawLayers.map(layerData => this.createLayer(layerData));
        } else {
            this.layers = [];
        }
    }

    createLayer(layerData) {
        return new LayerModel(layerData);
    }

    createTilesetData(tilesetData) {
        return new TilesetModel(tilesetData);
    }

    getLayerByName(name) {
        return this.layers.find(layer => layer.name === name);
    }
}