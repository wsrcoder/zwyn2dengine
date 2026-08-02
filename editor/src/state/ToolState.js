
import { ToolCategory, TileToolType } from '../constants/ToolType.js';

export default class ToolState {
    constructor() {

        this.activeCategory = ToolCategory.TILE; // Categoria ativa padrão (ex: 'tile', 'entity', etc.)
        
        this.tile= {
                    activeTool: TileToolType.BRUSH,      // Ferramenta ativa ('brush', 'bucket', 'eraser')
                    activeTilesetId: null,    // ID ou nome do tileset selecionado
                    selection: {
                            width: 1,
                            height: 1,
                            tiles: [[0]],         // Matriz bidimensional de GIDs
                            sourceRect: {
                                startX: 0,
                                startY: 0,
                                endX: 0,
                                endY: 0
                            }
                        }
                 }
    }

    /**
     * Reseta o estado das ferramentas para os valores padrão iniciais.
     */
    reset() {
        this.activeCategory = ToolCategory.TILE;
        
        this.tile = {
            activeTool: TileToolType.BRUSH,
            activeTilesetId: null,
            selection: {
                width: 1,
                height: 1,
                tiles: [[0]],
                sourceRect: {
                    startX: 0,
                    startY: 0,
                    endX: 0,
                    endY: 0
                }
            }
        };
    }

    /**
     * Retorna todo o estado atual das ferramentas ou uma categoria específica.
     * @param {string} [category] - Opcional: 'tile', 'entity', etc.
     */
    getActiveTool(category) {
        if (category) {
            return this[category];
        }
        // Retorna o objeto completo de estado das ferramentas
        return {
            activeCategory: this.activeCategory,
            tile: this.tile,
            // Outras categorias futuras entram aqui
        };
    }

    /**
     * Define a categoria ativa de ferramentas (ex: ToolCategory.TILE)
     */
    setToolCategory(category) {
        this.activeCategory = category;
    }

    /**
     * Define a ferramenta ativa dentro de uma categoria específica.
     * Ex: setActiveTool(ToolCategory.TILE, TileToolType.BRUSH)
     */
    setActiveTool(category, toolName) {
        if (this[category]) {
            this[category].activeTool = toolName;
        }
    }

    /**
     * Define os dados de seleção do tileset (Passo 2 / Passo 3).
     */
    setTileSelection(width, height, tiles, sourceRect) {
        this.tile.selection = {
            width,
            height,
            tiles,
            sourceRect
        };
    }

    /**
     * Limpa/reseta os dados do ToolState para o padrão inicial.
     */
    clear() {
        this.reset();
    }
}