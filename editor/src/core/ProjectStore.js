
import ProjectModel from '../models/Project/ProjectModel.js';
import SceneState from './SceneState.js'; // Futuramente SceneCache
import ToolState from './ToolState.js';
import TilesetCache from './cache/TilesetCache.js';

export default class ProjectStore {
    constructor() {
        // O estado da sessão vive aqui dentro, blindado!
        this.session = {
            rootPath: null,
            project: null,
            isModified: false,
            navigation: {
                activeWorldId: null,
                activeSceneId: null,
            },
            // Cache de Cenas GLOBAL na sessão
            workingScenes: new SceneState(),

            // Cache de Tilesets GLOBAL e compartilhado na sessão
            tilesetCache: new TilesetCache(),

            // Estrutura de Ferramentas Baseada no Modelo Dinâmico
            tools: new ToolState()
        };
    }

    /**
     * Retorna a sessão atual inteira.
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

    // ==========================================
    // MÉTODOS DE GERENCIAMENTO DE SCENE CACHE
    // ==========================================

    /**
     * Retorna o gerenciador de cache de cenas (workingScenes).
     * @returns {SceneState}
     */
    getSceneCache() {
        return this.session.workingScenes;
    }

    /**
     * Define ou substitui o gerenciador de cache de cenas na sessão.
     * @param {SceneState} newSceneState 
     */
    setSceneCache(newSceneState) {
        if (this.session) {
            this.session.workingScenes = newSceneState;
        }
    }

    // ==========================================
    // MÉTODOS DE GERENCIAMENTO DE TILESET CACHE
    // ==========================================

    /**
     * Retorna o gerenciador de cache de tilesets.
     * @returns {TilesetCache}
     */
    getTilesetCache() {
        return this.session.tilesetCache;
    }

    /**
     * Define ou substitui o gerenciador de cache de tilesets na sessão.
     * @param {TilesetCache} newTilesetCache 
     */
    setTilesetCache(newTilesetCache) {
        if (this.session) {
            this.session.tilesetCache = newTilesetCache;
        }
    }

    // ==========================================
    // MÉTODOS DE TOOL STATE
    // ==========================================

    /**
     * Retorna o estado atual das ferramentas.
     */
    getToolState() {
        return this.session.tools;
    }

    /**
     * Define ou atualiza o estado das ferramentas na sessão.
     */
    setToolState(newToolState) {
        if (this.session) {
            this.session.tools = newToolState;
        }
    }
}