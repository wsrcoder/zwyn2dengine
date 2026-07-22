export default class TileLayer {
    constructor({ type = 'worldGround', name = '', width = 0, height = 0, tileWidth = 32, tileHeight = 32, opacity = 1.0 } = {}) {
        
        this.type = type;                   // Tipo do layer (ground, overlay, etc.)
        this.name = name;                   // Nome da camada
        this.width = width;                 // Largura da camada em quantidade de blocos
        this.height = height;               // Altura da camada em quantidade de blocos
        this.tileWidth = tileWidth;         // Largura de cada bloco em pixels
        this.tileHeight = tileHeight;       // Altura de cada bloco em pixels
        
        // Inicializa a camada vazia (preenchida com 0 = vazio)
        this.data = new Array(this.width * this.height).fill(0);
        
        this.visible = true;                // Permite ocultar/exibir a camada inteira
        this.opacity = opacity;             // Para efeitos de transparência (ex: 0.8 para a água)
    }

    /**
     * Define o ID de um bloco em uma coordenada X, Y específica desta camada
     */
    setTile(x, y, tileId) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        
        const index = x + y * this.width;
        this.data[index] = tileId;
    }

    /**
     * Retorna o ID do bloco em uma coordenada X, Y específica desta camada
     */
    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
        
        const index = x + y * this.width;
        return this.data[index];
    }
}