
export default class SceneState {
    constructor() {
        this.cache = new Map(); // Armazena { worldId, fileName, mapDataModel, isModified, isDeleted }
    }


    /**
     * Adiciona ou atualiza uma cena no cache.
     */
    setScene(worldId=1, sceneId=1, sceneData) {
        const uniquekey = `${worldId}_${sceneId}`
        this.cache.set(uniquekey, {
            worldId: worldId,
            sceneId: sceneId,
            fileName: sceneData.fileName,
            data: sceneData.mapDataModel || sceneData.data || null,
            isModified: sceneData.isModified ?? true,
            isDeleted: sceneData.isDeleted ?? false
        });
    }

    //novo metodo para obter a scene
    getScene(worldId, sceneId) {
        return this.cache.get(`${worldId}_${sceneId}`) || null;
    }

    /**
     * Limpa todo o cache e reseta a cena ativa.
     */
    clear() {
        this.cache.clear();
        this.activeSceneId = null;
    }

    /**
     * Retorna true se houver alguma cena modificada no cache.
     */
    hasModifiedScenes() {
        for (const entry of this.cache.values()) {
            if (entry.isModified) {
                return true;
            }
        }
        return false;
    }

    /**
     * Retorna todas as entradas do cache de cenas.
     * @returns {Map<string, Object>} O Map completo do cache.
     */
    getAllScenes() {
        return this.cache;
    }

    // Atualizado para receber o worldId e usar a chave composta
    markAsModified(worldId, sceneId) {
        const uniqueKey = `${worldId}_${sceneId}`;
        const entry = this.cache.get(uniqueKey);
        if (entry) {
            entry.isModified = true;
        }
    }

    // Atualizado para desestruturar ou extrair corretamente a chave composta se necessário
    getModifiedScenes() {
        const modified = [];
        for (const [uniqueKey, entry] of this.cache.entries()) {
            if (entry.isModified === true && !entry.isDeleted) {
                modified.push({ 
                    uniqueKey, 
                    worldId: entry.worldId,
                    sceneId: entry.sceneId, 
                    ...entry 
                });
            }
        }
        return modified;
    }
}