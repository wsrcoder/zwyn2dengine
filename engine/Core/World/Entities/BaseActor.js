import BaseEntity from "./BaseEntity.js";
import AnimationHandler from "../../Graphics/AnimationHandler.js";
import TerrainType from "../Data/TerrainType.js";

export default class BaseActor extends BaseEntity {
    constructor({ x, y, width = 32, height = 32, sprite = null, spriteConfig = null, baseSpeed = 4 }) {
        // Repassa a sprite para a BaseEntity guardar
        super({ x, y, width, height, sprite });
        
        this.baseSpeed = baseSpeed; // Velocidade padrão de referência
        this.speed = baseSpeed;    // Velocidade atual (modificada por terreno)
        this.dx = 0;               // Direção horizontal atual
        this.dy = 0;               // Direção vertical atual

        // Inicializa o manipulador de animações se houver configuração
        this.animationHandler = spriteConfig ? new AnimationHandler(spriteConfig) : null;
        this.spriteColumns = spriteConfig ? spriteConfig.columns || 1 : 1;

        this.isMoving = false;
        this.isInWater = false;

    }

    update(dt, mapReference) {
        
        super.update(dt); // Chama o update do BaseEntity

        //verifica a variação de velocidade
        this.isMoving = (Math.abs(this.dx) > 0 || Math.abs(this.dy) > 0);

        // 2. Detecta se está na água checando o terreno abaixo dos pés
        this.checkWaterStatus(mapReference);

        this.speed = this.baseSpeed;

        if(this.isInWater){
            this.speed = this.baseSpeed * 0.5; // Lentidão na água
        }
        

        // Atualiza a animação e joga o corte atual direto na Sprite herdada
        if (this.animationHandler) {
            this.animationHandler.update(dt);

            if (this.sprite) {
                const source = this.animationHandler.getSpriteSourceCoordinates(this.spriteColumns);
                this.sprite.srcX = source.x;
                this.sprite.srcY = source.y;
                this.sprite.setSize(source.w, source.h);
            }
        }
    }

    checkWaterStatus(mapReference) {
        if (!mapReference || !mapReference.terrainData) {
            this.isInWater = false;
            return;
        }

        const footX = this.x + (this.width / 2);
        const footY = this.y + this.height;

        const mapTileW = mapReference.tileWidth || 32;
        const mapTileH = mapReference.tileHeight || 32;
    
        const col = Math.floor(footX / mapTileW);
        const row = Math.floor(footY / mapTileH);

        if (col < 0 || row < 0 || col >= mapReference.width || row >= mapReference.height) {
            this.isInWater = false;
            return;
        }

        // Lê direto o valor armazenado no terrainData naquela coordenada
        const terrainValue = mapReference.terrainData[`${col},${row}`];

        // Se o valor salvo for o identificador de água (ex: TerrainType.WATER ou string/número correspondente)
        this.isInWater = (terrainValue === TerrainType.WATER || terrainValue === 'water' || terrainValue === true);
    }
}