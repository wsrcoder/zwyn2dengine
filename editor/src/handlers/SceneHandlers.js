import { LayerCategoryEnum } from "../enums/LayerCategoryEnum.js";

/**
 * src/handlers/sceneHandlers.js
 * * Orquestra as interações da UI relativas às cenas e suas camadas.
 * Retorna um objeto padronizado: { success, message, data }
 */
export function createSceneHandlers(sceneController, projectStore) {
    
    return {
        /**
         * Cria uma nova cena e a registra no estado do projeto
         */
        handleCreateScene: async (columns = 20, rows = 15) => {
            console.info("[SceneHandlers] Solicitando criação de nova cena...");
            
            try {
                const result = await sceneController.createScene(columns, rows);
                
                if (!result.success) {
                    console.error("[SceneHandlers] Falha ao criar cena:", result.message);
                    return { success: false, message: result.message, data: null };
                }

                //integração com a store do projeto
                const _sceneCache = projectStore.getSceneCache();
                    if (_sceneCache) {
                        _sceneCache.addScene(result.data);
                }

                console.info("[SceneHandlers] Cena criada com sucesso:", result.data);
                return { success: true, message: "Cena criada com sucesso", data: result.data };
                
            } catch (error) {
                console.error("[SceneHandlers] Erro inesperado:", error);
                return { success: false, message: "Erro interno ao criar cena.", data: null };
            }
        },

        /**
         * Adiciona uma nova camada baseada no LayerCategoryEnum
         */
        handleAddLayer: async (layerType, sceneId = null, customData = {}) => {
            console.info(`[SceneHandlers] Adicionando camada do tipo: ${layerType}`);
            
            let result;
            
            try {
                switch (layerType) {
                    case LayerCategoryEnum.BACKGROUND:
                        result = await sceneController.addBackgroundLayer(sceneId, customData);
                        break;
                    case LayerCategoryEnum.TILE:
                        result = await sceneController.addTileLayer(sceneId, customData);
                        break;
                    case LayerCategoryEnum.TERRAIN:
                        result = await sceneController.addTerrainLayer(sceneId, customData);
                        break;
                    case LayerCategoryEnum.EVENT:
                        result = await sceneController.addEventLayer(sceneId, customData);
                        break;
                    default:
                        console.warn(`[SceneHandlers] Tipo de camada desconhecido: ${layerType}`);
                        return { 
                            success: false, 
                            message: `Tipo de camada inválido: ${layerType}`, 
                            data: null 
                        };
                }

                if (!result.success) {
                    return { success: false, message: result.message, data: null };
                }

                return { success: true, message: "Camada adicionada com sucesso", data: result.data };
                
            } catch (error) {
                console.error("[SceneHandlers] Erro ao adicionar camada:", error);
                return { success: false, message: "Erro interno ao adicionar camada.", data: null };
            }
        },

        /**
         * Alterna a visibilidade de uma camada específica
         */
        handleToggleLayerVisibility: async (layerId, sceneId = null) => {
            try {
                const result = await sceneController.toggleLayerVisibility(sceneId, layerId);
                
                if (!result.success) {
                    return { success: false, message: result.message, data: null };
                }
                
                return { success: true, message: "Visibilidade alterada", data: result.data };
                
            } catch (error) {
                return { success: false, message: "Erro ao alternar visibilidade", data: null };
            }
        },

        /**
         * Remove uma cena com validação
         */
        handleDeleteScene: async (sceneId) => {
            try {
                const result = await sceneController.deleteScene(sceneId);
                
                if (!result.success) {
                    return { success: false, message: result.message, data: null };
                }

                // Atualiza a store do projeto para refletir a remoção
                if (projectStore && projectStore.removeScene) {
                    projectStore.removeScene(sceneId);
                }

                return { success: true, message: "Cena excluída com sucesso", data: result.data };
                
            } catch (error) {
                return { success: false, message: "Erro interno ao excluir cena.", data: null };
            }
        }
    };
}