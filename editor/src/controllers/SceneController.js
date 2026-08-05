
import {EventHandler} from '../core/EventBus.js'; // Ajuste conforme o caminho real do seu barramento
import { EDITOR_EVENTS } from '../core/EventTypes.js';
import SceneService from '../services/SceneService.js';

/**
 * src/controllers/SceneController.js
 * Orquestra as interações entre a UI/Handlers e o SceneService,
 * mantendo o estado global da sessão e do projeto atualizado.
 */
export default class SceneController {
    
    constructor(projectStore) {
        this.projectStore = projectStore;
        this.sceneService = new SceneService();
    }

    /**
     * Auxiliar privado para notificar mudanças gerais no projeto/sessão
     */
    _notifyChange() {
        // Se houver um evento geral de modificação de cena/projeto
        EventHandler.notify(EDITOR_EVENTS.SCENE_MODIFIED, { timestamp: Date.now() });
    }

    /**
     * Auxiliar privado para buscar a cena ativa na sessão/workingScenes
     */
    getActiveScene() {
        const session = this.projectStore.getSession();
        if (!session || !session.navigation || !session.workingScenes) return null;
        
        const activeSceneId = session.navigation.activeSceneId;
        if (!activeSceneId) return null;

        const cachedScene = session.workingScenes.getScene(activeSceneId);
        return cachedScene ? cachedScene.data : null;
    }

    /**
     * Auxiliar privado para buscar uma cena específica por ID
     */
    getSceneById(sceneId) {
        const session = this.projectStore.getSession();
        if (!session || !session.workingScenes) return null;

        const cachedScene = session.workingScenes.getScene(sceneId);
        return cachedScene ? cachedScene.data : null;
    }

    /**
     * Cria uma nova cena no mundo ativo da sessão.
     */
    async createScene(columns = 20, rows = 15) {
        try {
            const session = this.projectStore.getSession();
            if (!session) {
                return { success: false, message: "Sessão do projeto não encontrada.", data: null };
            }

            const result = this.sceneService.createScene(session, columns, rows);
            if (result.success) {
                this._notifyChange();
                EventHandler.notify(EDITOR_EVENTS.SCENE_CREATED, result.data);
            }
            return result;
        } catch (error) {
            console.error("[SceneController] Erro em createScene:", error);
            return { success: false, message: error.message, data: null };
        }
    }

    /**
     * Atualiza dados de uma cena existente.
     */
    async updateScene(sceneId, sceneData) {
        try {
            const sceneModel = sceneId ? this.getSceneById(sceneId) : this.getActiveScene();
            if (!sceneModel) {
                return { success: false, message: "Cena alvo não encontrada para atualização.", data: null };
            }

            const updated = await this.sceneService.updateScene(sceneModel, sceneData);
            this._notifyChange();
            return { success: true, message: "Cena atualizada com sucesso.", data: updated };
        } catch (error) {
            console.error("[SceneController] Erro em updateScene:", error);
            return { success: false, message: error.message, data: null };
        }
    }

    /**
     * Marca uma cena como deletada na sessão.
     */
    async deleteScene(sceneId) {
        try {
            const session = this.projectStore.getSession();
            if (!session) {
                return { success: false, message: "Sessão do projeto não encontrada.", data: null };
            }

            const result = await this.sceneService.deleteScene(session, sceneId);
            if (result.success) {
                this._notifyChange();
                EventHandler.notify(EDITOR_EVENTS.SCENE_DELETED, { sceneId });
            }
            return result;
        } catch (error) {
            console.error("[SceneController] Erro em deleteScene:", error);
            return { success: false, message: error.message, data: null };
        }
    }

    /**
     * Adiciona uma camada de Background na cena ativa (ou informada por ID).
     */
    async addBackgroundLayer(sceneId = null, layerData = {}) {
        try {
            const sceneModel = sceneId ? this.getSceneById(sceneId) : this.getActiveScene();
            if (!sceneModel) {
                return { success: false, message: "Nenhuma cena ativa encontrada para adicionar o Background.", data: null };
            }

            const newLayer = await this.sceneService.addBackgroundLayer(sceneModel, layerData);
            this._notifyChange();
            
            // Dispara evento específico de camada criada
            EventHandler.notify(EDITOR_EVENTS.LAYER_CREATED, { sceneId: sceneModel.id, layer: newLayer, type: 'background' });

            return { success: true, message: "Camada de Background criada com sucesso.", data: newLayer };
        } catch (error) {
            console.error("[SceneController] Erro em addBackgroundLayer:", error);
            return { success: false, message: error.message, data: null };
        }
    }

    /**
     * Adiciona uma camada de Tile na cena ativa (ou informada por ID).
     */
    async addTileLayer(sceneId = null, layerData = {}) {
        try {
            const sceneModel = sceneId ? this.getSceneById(sceneId) : this.getActiveScene();
            if (!sceneModel) {
                return { success: false, message: "Nenhuma cena ativa encontrada para adicionar o Tile Layer.", data: null };
            }

            const newLayer = await this.sceneService.addTileLayer(sceneModel, layerData);
            this._notifyChange();

            EventHandler.notify(EDITOR_EVENTS.LAYER_CREATED, { sceneId: sceneModel.id, layer: newLayer, type: 'tile' });

            return { success: true, message: "Camada de Tile criada com sucesso.", data: newLayer };
        } catch (error) {
            console.error("[SceneController] Erro em addTileLayer:", error);
            return { success: false, message: error.message, data: null };
        }
    }

    /**
     * Adiciona uma camada de Terrain na cena ativa (ou informada por ID).
     */
    async addTerrainLayer(sceneId = null, layerData = {}) {
        try {
            const sceneModel = sceneId ? this.getSceneById(sceneId) : this.getActiveScene();
            if (!sceneModel) {
                return { success: false, message: "Nenhuma cena ativa encontrada para adicionar o Terrain Layer.", data: null };
            }

            const newLayer = await this.sceneService.addTerrainLayer(sceneModel, layerData);
            this._notifyChange();

            EventHandler.notify(EDITOR_EVENTS.LAYER_CREATED, { sceneId: sceneModel.id, layer: newLayer, type: 'terrain' });

            return { success: true, message: "Camada de Terrain criada com sucesso.", data: newLayer };
        } catch (error) {
            console.error("[SceneController] Erro em addTerrainLayer:", error);
            return { success: false, message: error.message, data: null };
        }
    }

    /**
     * Adiciona uma camada de Event na cena ativa (ou informada por ID).
     */
    async addEventLayer(sceneId = null, layerData = {}) {
        try {
            const sceneModel = sceneId ? this.getSceneById(sceneId) : this.getActiveScene();
            if (!sceneModel) {
                return { success: false, message: "Nenhuma cena ativa encontrada para adicionar o Event Layer.", data: null };
            }

            const newLayer = await this.sceneService.addEventLayer(sceneModel, layerData);
            this._notifyChange();

            EventHandler.notify(EDITOR_EVENTS.LAYER_CREATED, { sceneId: sceneModel.id, layer: newLayer, type: 'event' });

            return { success: true, message: "Camada de Eventos criada com sucesso.", data: newLayer };
        } catch (error) {
            console.error("[SceneController] Erro em addEventLayer:", error);
            return { success: false, message: error.message, data: null };
        }
    }

    /**
     * Alterna a visibilidade de uma camada na cena.
     */
    async toggleLayerVisibility(sceneId = null, layerId) {
        try {
            const sceneModel = sceneId ? this.getSceneById(sceneId) : this.getActiveScene();
            if (!sceneModel) {
                return { success: false, message: "Cena alvo não encontrada.", data: null };
            }

            const layer = await this.sceneService.toggleLayerVisibility(sceneModel, layerId);
            if (!layer) {
                return { success: false, message: `Camada com ID ${layerId} não encontrada.`, data: null };
            }

            this._notifyChange();

            // Dispara evento de alternância de visibilidade
            EventHandler.notify(EDITOR_EVENTS.LAYER_VISIBILITY_TOGGLED, { sceneId: sceneModel.id, layer });

            return { success: true, message: "Visibilidade da camada alterada.", data: layer };
        } catch (error) {
            console.error("[SceneController] Erro em toggleLayerVisibility:", error);
            return { success: false, message: error.message, data: null };
        }
    }
}