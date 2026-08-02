import ProjectModel from '../models/Project/ProjectModel.js';
import SceneState from './SceneState.js'; // Ajuste o caminho se necessário
import { ToolCategory } from '../constants/ToolType.js';
import { TileToolType } from '../constants/ToolType.js';

export default class ProjectStore {
    constructor() {

        // O estado da sessão agora vive aqui dentro, blindado!
        this.session = {
            rootPath: null,
            project: null,
            isModified: false,
            navigation: {
                    activeWorldId: null,
            },
            // 2. O Cache de Cenas é GLOBAL na sessão, mapeando qualquer cena aberta em memória
            // Chave: ID da cena (ou 'W{worldId}S{sceneId}'), Valor: { mapDataModel, fileName, isModified }
            workingScenes: new SceneState(),

            // --- Passo 1: Estrutura de Ferramentas Baseada no Modelo Dinâmico ---
            tools: {
                activeCategory: ToolCategory.TILE, // Categoria ativa padrão (ex: 'tile', 'entity', etc.)
        
                tile: {
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
           
        };

        this.listeners = new Set();
    }

    /**
     * Retorna a sessão atual inteira (caso algum serviço precise).
     */
    getSession() {
        return this.session;
    }

    /**
     * Reseta ou define uma nova sessão completa (quando um projeto é aberto).
     */
    setSession(newSessionData) {
        this.session = newSessionData;
    }


}