
/**
 * TerrainLayerModel.js
 * 
 * Propósito:
 * Representa uma camada lógica e invisível (durante o jogo) focada estritamente 
 * na mecânica de gameplay, física e regras espaciais do mapa (como colisão customizada, 
 * pisos especiais, zonas de dano ou áreas de oclusão).
 * 
 * Utilização:
 * Diferente das camadas de tiles visuais, esta matriz armazena IDs de "regras" ou 
 * "tipos de terreno" em vez de gráficos. O motor de jogo consulta esta camada sob 
 * demanda (durante a física/movimento) para validar se um espaço é caminhável ou 
 * aplicar modificadores de estado (ex: gelo, lama, lava).
 */
export class TerrainLayerModel {
    constructor(data = {}) {
        this.id = data.id ?? 0;
        this.name = data.name ?? "Terrain Layer";
        this.visible = data.visible ?? true; // Útil no editor para ligar/desligar a visualização da grade lógica
        this.opacity = data.opacity ?? 1; 
        this.type = data.type ?? "terrain";

        // Dimensões do grid lógico (geralmente acompanham as dimensões da cena)
        this.columns = data.columns ?? 20;
        this.rows = data.rows ?? 15;

        // Matriz unidimensional contendo os IDs de terreno/região (0 = Neutro/Livre)
        this.data = data.data || new Array(this.columns * this.rows).fill(0);

        // Propriedades customizadas adicionais para metadados da camada
        this.properties = data.properties ?? {};
    }

    /**
     * Retorna o ID do terreno em uma coordenada específica do grid.
     * @param {number} x - Coluna
     * @param {number} y - Linha
     * @returns {number} ID do terreno ou 0 se estiver fora dos limites.
     */
    getTerrainAt(x, y) {
        if (x < 0 || x >= this.columns || y < 0 || y >= this.rows) {
            return 0; // Fora do mapa é considerado neutro/livre (ou tratado pelas bordas da cena)
        }
        return this.data[y * this.columns + x];
    }

    /**
     * Define o ID do terreno em uma coordenada específica do grid.
     * @param {number} x - Coluna
     * @param {number} y - Linha
     * @param {number} terrainId - ID do terreno a ser pintado
     */
    setTerrainAt(x, y, terrainId) {
        if (x >= 0 && x < this.columns && y >= 0 && y < this.rows) {
            this.data[y * this.columns + x] = terrainId;
        }
    }

    /**
     * Serializa o modelo da camada de terreno para formato JSON puro 
     * (ideal para salvar os dados do mapa em arquivo).
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            visible: this.visible,
            opacity: this.opacity,
            type: this.type,
            columns: this.columns,
            rows: this.rows,
            data: [...this.data],
            properties: JSON.parse(JSON.stringify(this.properties))
        };
    }
}