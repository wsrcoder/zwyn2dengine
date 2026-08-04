
import { TilesetEnum } from '../../constants/Enums.js';

export class TilesetDTO{

    constructor(data = {}){

        this.firstgid = data.firstgid || 1;
        this.name = data.name || "unknow";
        this.type = data.type || TilesetEnum.TOP_DOWN;

        this.tile = {
            width: data.tile?.width || 32,
            height: data.tile?.height || 32,
            count: data.tile?.count || 1
        }

        this.columns = data.columns || 1;
        this.rows = data.rows || 1;

        this.imageFile = {
            name: data.imageFile?.name || '',
            width: data.imageFile?.width || 0,
            height: data.imageFile?.height || 0
        };

        // Mapeia as propriedades customizadas dos tiles (chave = localTileId)
        this.properties = data.properties || {};
    }
}