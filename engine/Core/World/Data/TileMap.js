import TileLayer from "./TileLayer.js";

export default class TileMap {
    constructor(width, height, tileWidth, tileHeight) {
        this.width = width;             // Dimensões globais do mapa (em quantidade de blocos)
        this.height = height;
        this.tileWidth = tileWidth;     // Tamanho padrão dos blocos em pixels
        this.tileHeight = tileHeight;
        
        // Gerencia a hierarquia de profundidade em 5 buckets
        this.buckets = [[], [], [], [], []];
        this.tilesets = [];             // Guarda as referências visuais (imagens/texturas)

        this.collisionData = null;      // Matriz ou camada dedicada para colisões (isSolid)
        this.terrainData = {};          // Camadas lógicas para terreno (isWater, isSnow, etc.)
    }

    /**
     * Mapeia o tipo de camada para o índice correto do bucket
     */
    getBucketIndexByType(layerType) {
        const bucketMap = {
            'deepBackground': 0, // O que fica lá no fundo (buracos, poços, alicerces sob o chão)
            'worldGround':     1, // A camada base de chão/terreno navegável (padrão)
            'dynamicEntities': 2, // O plano onde habitam os atores (player, NPCs, monstros, itens)
            'foreheadOverlay': 3, // Elementos elevados que criam oclusão parcial (copas de árvores, beiradas, tetos)
            'skyAtmosphere':   4  // Elementos de clima, névoa, luz ambiente ou pós-processamento final
        };
        return bucketMap[layerType] ?? 1; // Se não achar, joga no ground (1)
    }

    /**
     * Cria, adiciona e retorna uma nova camada de blocos vinculada a este mapa
     */
    createLayer(layerType = 'worldGround', customName = null) {
        const newLayer = new TileLayer({
            name: customName || layerType,
            width: this.width,
            height: this.height,
            tileWidth: this.tileWidth,
            tileHeight: this.tileHeight
        });

        const bucketIndex = this.getBucketIndexByType(layerType);
        this.buckets[bucketIndex].push(newLayer);

        return newLayer;
    }

    /**
     * Adiciona uma instância de TileLayer já criada diretamente no bucket correspondente ao seu tipo
     */
    addLayer(tileLayer, layerType = 'worldGround') {
        const bucketIndex = this.getBucketIndexByType(layerType);
        this.buckets[bucketIndex].push(tileLayer);
    }

    /**
     * Adiciona especificamente uma camada gerada dinamicamente no Bucket 3 (Overlay)
     */
    addOverlayLayer(tileLayer) {
        // O bucket 3 é reservado para oclusões e overlays visuais
        this.buckets[3].push(tileLayer);
    }

    /**
     * Remove uma camada de um bucket específico
     */
    removeLayer(bucketIndex, layerIndex) {
        if (this.buckets[bucketIndex] && this.buckets[bucketIndex][layerIndex]) {
            this.buckets[bucketIndex].splice(layerIndex, 1);
        }
    }

    /**
     * Helper para o Pipeline pegar todas as camadas ordenadas
     */
    getLayersInOrder() {
        return [
            ...this.buckets[0],
            ...this.buckets[1],
            ...this.buckets[2],
            ...this.buckets[3],
            ...this.buckets[4],
        ];
    }

    isSolidAt(worldX, worldY) {
        if (!this.collisionData) return false;

        // Converte pixels do mundo para coluna/linha do tile
        const col = Math.floor(worldX / this.tileWidth);
        const row = Math.floor(worldY / this.tileHeight);

        // Bordas do mapa também são barreiras sólidas
        if (col < 0 || row < 0 || col >= this.width || row >= this.height) {
            return true;
        }

        // Retorna true se houver colisão registrada nessa coordenada
        return !!this.collisionData[`${col},${row}`];
    }

    /**
     * Verifica se existe um tipo específico de terreno (ex: 'water') em uma coordenada do mundo (pixels)
     */
    hasTerrainAt(worldX, worldY, terrainType) {
        if (!this.terrainData) return false;

        // Converte pixels do mundo para coluna/linha do tile
        const col = Math.floor(worldX / this.tileWidth);
        const row = Math.floor(worldY / this.tileHeight);

        // Se estiver fora dos limites do mapa, não tem o terreno lógico
        if (col < 0 || row < 0 || col >= this.width || row >= this.height) {
            return false;
        }

        // Retorna true se o terreno gravado naquela coordenada bater com o procurado
        return this.terrainData[`${col},${row}`] === terrainType;
    }
}