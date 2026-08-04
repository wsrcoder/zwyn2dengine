
import { ProjectParams } from '../../constants/ProjectParams.js';

export default class TilesetCache {
    constructor() {
        this.cache = new Map(); // Armazena { tilesetId, name, image, data, isModified }
    }

    /**
     * Retorna true se o tileset já estiver carregado no cache de memória.
     */
    hasTileset(tilesetId) {
        return this.cache.has(tilesetId);
    }

    /**
     * Retorna o tileset do cache se existir.
     */
    getTileset(tilesetId) {
        return this.cache.get(tilesetId) || null;
    }

    /**
     * Carrega um tileset do disco (via Electron binary) se já não estiver em cache,
     * ou o recupera instantaneamente da memória.
     * 
     * @param {string|number} tilesetId - ID único do tileset
     * @param {Object} tilesetManifest - Metadados do tileset contendo o arquivo de imagem (ex: { id, name, imageFile: { name: '...' } })
     * @param {string} rootPath - Caminho raiz do projeto atual
     * @returns {Promise<HTMLImageElement|null>} Retorna o objeto de imagem pronto para uso
     */
    async getOrLoadTileset(tilesetId, tilesetManifest, rootPath) {
        // 1. Verifica se já está em cache
        if (this.hasTileset(tilesetId)) {
            console.log(`[TilesetCache] Tileset ${tilesetId} encontrado em cache.`);
            return this.cache.get(tilesetId);
        }

        if (!tilesetManifest || !tilesetManifest.imageFile?.name) {
            console.warn(`[TilesetCache] Manifesto inválido para o tileset ${tilesetId}`);
            return null;
        }

        console.log(`[TilesetCache] Tileset ${tilesetId} não está na memória. Carregando binário do disco...`);

        // 2. Monta o caminho do arquivo de imagem do tileset
        const imagePath = `${rootPath}/${ProjectParams.DIR.TILESETS}/${tilesetManifest.imageFile.name}`;

        try {
            // Pede para o Electron carregar o binário em base64 com segurança
            const dataUrl = await window.electronAPI.loadBinaryFile(imagePath);

            if (!dataUrl) {
                throw new Error(`Falha ao carregar binário do arquivo: ${imagePath}`);
            }

            // 3. Instancia a imagem assincronamente via Data URL
            const imageElement = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = (err) => reject(err);
                img.src = dataUrl;
            });

            // 4. Salva no cache estruturado
            const cacheEntry = {
                tilesetId: tilesetId,
                name: tilesetManifest.name || `Tileset_${tilesetId}`,
                image: imageElement,
                data: tilesetManifest,
                isModified: false // Tilesets são estáticos de leitura
            };

            this.cache.set(tilesetId, cacheEntry);
            console.log(`[TilesetCache] Tileset ${tilesetId} carregado e armazenado em cache com sucesso.`);

            return cacheEntry;

        } catch (error) {
            console.error(`[TilesetCache] Erro ao carregar tileset ${tilesetId} do disco:`, error);
            return null;
        }
    }

    /**
     * Limpa todo o cache de tilesets da memória.
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Mantém apenas os tilesets informados (útil para otimização de memória pós-save ou troca de contexto).
     * @param {Array<string|number>} activeTilesetIds - Lista de IDs de tilesets que devem ser preservados na RAM.
     */
    keepOnly(activeTilesetIds = []) {
        const keepSet = new Set(activeTilesetIds);
        
        for (const [tilesetId] of this.cache.entries()) {
            if (!keepSet.has(tilesetId)) {
                this.cache.delete(tilesetId);
                console.log(`[TilesetCache] Tileset ${tilesetId} descarregado da memória por ociosidade.`);
            }
        }
    }

    /**
     * Retorna todas as entradas do cache.
     */
    getAllTilesets() {
        return this.cache;
    }
}