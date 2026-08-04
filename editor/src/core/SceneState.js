
export default class SceneState {
    constructor() {
        this.cache = new Map(); // Armazena { worldId, fileName, mapDataModel, isModified, isDeleted }
    }

    /**
     * Adiciona ou atualiza uma cena no cache.
     */
    setScene(worldId = 1, sceneId = 1, sceneData) {
        const uniquekey = `${worldId}_${sceneId}`;
        this.cache.set(uniquekey, {
            worldId: worldId,
            sceneId: sceneId,
            fileName: sceneData.fileName,
            data: sceneData.mapDataModel || sceneData.data || null,
            isModified: sceneData.isModified ?? true,
            isDeleted: sceneData.isDeleted ?? false
        });
    }

    /**
     * Retorna true se a cena especificada já estiver no cache de memória.
     */
    hasScene(worldId, sceneId) {
        const uniqueKey = `${worldId}_${sceneId}`;
        return this.cache.has(uniqueKey);
    }

    /**
     * Retorna a cena do cache.
     */
    getScene(worldId, sceneId) {
        return this.cache.get(`${worldId}_${sceneId}`) || null;
    }

    /**
     * Limpa todo o cache e reseta a cena ativa.
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Descarrega tudo da memória, mantendo estritamente apenas a cena corrente informada.
     * Perfeito para rodar logo após o save bem-sucedido!
     */
    keepOnly(worldId, sceneId) {
        const uniqueKey = `${worldId}_${sceneId}`;
        const currentScene = this.cache.get(uniqueKey);
        
        this.cache.clear();

        if (currentScene) {
            this.cache.set(uniqueKey, currentScene);
        }
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

    markAsModified(worldId, sceneId) {
        const uniqueKey = `${worldId}_${sceneId}`;
        const entry = this.cache.get(uniqueKey);
        if (entry) {
            entry.isModified = true;
        }
    }

    getModifiedScenes() {
        const modified = [];
        for (const [uniqueKey, entry] of this.cache.entries()) {
            if (entry.isModified === true && !entry.isDeleted) {
                modified.push({ 
                    uniqueKey, 
                    worldId: entry.worldId,
                    sceneId: sceneId, 
                    ...entry 
                });
            }
        }
        return modified;
    }
}