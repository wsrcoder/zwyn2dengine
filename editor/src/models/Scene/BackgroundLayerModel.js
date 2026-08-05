
import { BackgroundLayerEnum, LayerCategoryEnum } from "../../constants/Enums.js";

export class BackgroundLayerModel {
    constructor(data = {}) {
        this.id = data.id ?? 0;
        this.name = data.name ?? "Background Layer";
        this.type = LayerCategoryEnum.BACKGROUND; // "background" ou LayerType.BACKGROUND
        this.BackgroundType = data.BackgroundType ?? BackgroundLayerEnum.IMAGE; // "image" ou "tiles"
        this.visible = data.visible ?? true;
        this.opacity = data.opacity ?? 1;

        // Propriedades comuns de Paralaxe e Movimento
        this.parallaxFactor = {
            x: data.parallaxFactor?.x ?? 1.0,
            y: data.parallaxFactor?.y ?? 1.0
        };
        this.scrollSpeed = {
            x: data.scrollSpeed?.x ?? 0,
            y: data.scrollSpeed?.y ?? 0
        };

        // Atributo condicional baseado no tipo (Economia de dados!)
        if (this.BackgroundType === BackgroundLayerEnum.IMAGE) {
            this.imagePath = data.imagePath ?? "";
            this.repeatX = data.repeatX ?? true;
            this.repeatY = data.repeatY ?? false;
        } else if (this.BackgroundType === BackgroundLayerEnum.TILE) {
            this.columns = data.columns ?? 20;
            this.rows = data.rows ?? 15;
            this.data = data.data || new Array(this.columns * this.rows).fill(0);
        }

        this.properties = data.properties ?? {};
    }

    toJSON() {
        const baseJson = {
            id: this.id,
            name: this.name,
            type: this.type,
            BackgroundType: this.BackgroundType,
            visible: this.visible,
            opacity: this.opacity,
            parallaxFactor: { ...this.parallaxFactor },
            scrollSpeed: { ...this.scrollSpeed },
            properties: JSON.parse(JSON.stringify(this.properties))
        };

        // Salva apenas os dados pertinentes ao tipo escolhido
        if (this.type === BackgroundLayerEnum.IMAGE) {
            baseJson.imagePath = this.imagePath;
            baseJson.repeatX = this.repeatX;
            baseJson.repeatY = this.repeatY;
        } else if (this.type === BackgroundLayerEnum.TILE) {
            baseJson.columns = this.columns;
            baseJson.rows = this.rows;
            baseJson.data = [...this.data];
        }

        return baseJson;
    }
}