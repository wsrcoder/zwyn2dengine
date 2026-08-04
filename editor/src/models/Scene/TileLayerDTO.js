
import { LayerType } from "../../constants/LayerType";

export class TileLayerDTO {
    constructor(rawLayerData = {}) {
        this.id = rawLayerData.id;
        this.name = rawLayerData.name;
        this.type = rawLayerData.type; // tileLayer, imageLayer, eventLayer, uiLayer
        this.visible = rawLayerData.visible !== undefined ? rawLayerData.visible : true;
        this.opacity = rawLayerData.opacity !== undefined ? rawLayerData.opacity : 1.0;
        
        this.columns = rawLayerData.columns || 0;
        this.rows = rawLayerData.rows || 0;
        
        this.x = rawLayerData.x || 0;
        this.y = rawLayerData.y || 0;
        
        // Se vierem dados válidos, usa eles; senão, preenche com zeros baseado em columns * rows
        if (Array.isArray(rawLayerData.data) && rawLayerData.data.length > 0) {
            this.data = [...rawLayerData.data];
        } else {
            const totalCells = this.columns * this.rows;
            this.data = totalCells > 0 ? new Array(totalCells).fill(0) : [];
        }

        this.properties = rawLayerData.properties ? {...rawLayerData.properties} : {};
    }
}