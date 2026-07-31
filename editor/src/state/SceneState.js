
export default class SceneState {
    constructor() {
        this.activeSceneId = null;
        this.cache = new Map(); // Armazena { worldId, fileName, mapDataModel, isModified, isDeleted }
    }

    /**
     * Retorna a entrada do cache da cena ativa atual, se existir.
     */
    getActiveCacheEntry() {
        if (!this.activeSceneId) return null;
        return this.cache.get(this.activeSceneId) || null;
    }

    /**
     * Retorna o mapDataModel da cena ativa atual.
     */
    getActiveScene() {
        const entry = this.getActiveCacheEntry();
        return entry ? entry.mapDataModel : null;
    }

    /**
     * Busca uma cena específica diretamente no cache pelo ID (retorna apenas o model).
     */
    getFromCache(sceneId) {
        const entry = this.cache.get(sceneId);
        return entry ? entry.mapDataModel : null;
    }

    /**
     * Retorna a entrada completa do cache para um ID de cena específico (incluindo metadados, isModified, etc).
     */
    getSceneById(sceneId) {
        return this.cache.get(sceneId) || null;
    }

    /**
     * Adiciona ou atualiza uma cena no cache.
     */
    setScene(sceneId, sceneData) {
        this.cache.set(sceneId, {
            worldId: sceneData.worldId,
            fileName: sceneData.fileName,
            data: sceneData.mapDataModel || sceneData.data || null,
            isModified: sceneData.isModified ?? true,
            isDeleted: sceneData.isDeleted ?? false
        });
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

    /**
     * Retorna apenas as cenas que possuem alterações não salvas (isModified = true).
     * @returns {Array<Object>} Lista de entradas modificadas com seus IDs.
     */
    getModifiedScenes() {
        const modified = [];
        for (const [sceneId, entry] of this.cache.entries()) {
            if (entry.isModified === true && !entry.isDeleted) {
                modified.push({ sceneId, ...entry });
            }
        }
        return modified;
    }

    markAsModified(sceneId) {
        const entry = this.cache.get(sceneId);
        if (entry) {
            entry.isModified = true;
        }
    }
}