
import { LayerType } from "../../constants/LayerType";
export class LayerModel{

    constructor(rawLayerData){
        this.id = rawLayerData.id;
        this.name = rawLayerData.name;
        this.type = rawLayerData.type; //tileLayer, imageLayer, eventLayer, uiLayer
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

    // Pega um bloco de tiles da camada a partir de uma coordenada inicial (útil para copiar/selecionar no mapa)
    getTileSelection(startX, startY, width, height) {
        if (this.type !== 'tilelayer') return null;

        const selection = {
            width: width,
            height: height,
            tiles: []
        };

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const targetX = startX + x;
                const targetY = startY + y;
                
                // Pega o tile se estiver dentro do mapa, ou 0/null se estiver fora
                const tileId = this.getTileAt(targetX, targetY);
                selection.tiles.push(tileId);
            }
        }

        return selection;
    }

    // Aplica um bloco inteiro de tiles (sub-matriz) na camada a partir de uma coordenada de clique (startX, startY)
    setTileSelection(startX, startY, selectionData) {
        if (this.type !== 'tilelayer') return false;
        if (!selectionData || !selectionData.tiles || selectionData.tiles.length === 0) return false;

        const { width, height, tiles } = selectionData;
        let modified = false;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const targetX = startX + x;
                const targetY = startY + y;
                
                // Índice dentro do array de tiles da seleção
                const selectionIndex = y * width + x;
                const tileId = tiles[selectionIndex];

                // Só aplica se estiver dentro dos limites do mapa
                if (targetX >= 0 && targetX < this.columns && targetY >= 0 && targetY < this.rows) {
                    const mapIndex = targetY * this.columns + targetX;
                    if (this.data[mapIndex] !== tileId) {
                        this.data[mapIndex] !== tileId; // Correção simples: this.data[mapIndex] = tileId
                        modified = true;
                    }
                    this.data[mapIndex] = tileId; // Garante a atribuição correta
                }
            }
        }

        return modified; // Retorna true se alterou algo no mapa
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            opacity: this.opacity,
            visible: this.visible,
            // Ao exportar de volta para o Tiled, mapeamos de volta para a chave que ele espera ('width')
            columns: this.columns,
            rows: this.rows,
            x: this.x,
            y: this.y,
            data: [...this.data]
        };
    }

}