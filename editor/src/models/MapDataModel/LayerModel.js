
import { LayerType } from "../../Constants/LayerType";
export class LayerModel{

    constructor(rawLayerData, layerType){
        this.id = rawLayerData.id;
        this.name = rawLayerData.name;
        this.type = layerType; //tileLayer, imageLayer, eventLayer, uiLayer
        this.visible = rawLayerData.visible !== undefined ? rawLayerData.visible : true;
        this.opacity = rawLayerData.opacity !== undefined ? rawLayerData.opacity : 1.0;
        
        this.columns = rawLayerData.width || 0;
        this.rows = rawLayerData.height || 0;
        
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

    getTileAt(x, y) {
        // Validação usando os novos nomes descritivos
        if (x < 0 || x >= this.columns || y < 0 || y >= this.rows) return null;
        if (this.type !== 'tilelayer') return null;

        // O cálculo matemático continua o mesmo (y * colunas + x)
        const index = y * this.columns + x;
        return this.data[index];
    }

    setTileAt(x, y, newTileId) {
        if (x < 0 || x >= this.columns || y < 0 || y >= this.rows) return false;
        if (this.type !== 'tilelayer') return false;

        const index = y * this.columns + x;
        this.data[index] = newTileId;
        return true;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            opacity: this.opacity,
            visible: this.visible,
            // Ao exportar de volta para o Tiled, mapeamos de volta para a chave que ele espera ('width')
            width: this.columns,
            height: this.rows,
            x: this.x,
            y: this.y,
            data: [...this.data]
        };
    }

}