
import { MapDataModel } from "../models/MapDataModel/MapDataModel";

export default class MapManager {
    constructor(mapsList = []) {
        this.mapsList = mapsList;
    }


    createNewMap() {
        const nextId = this.mapsList.length > 0 
            ? Math.max(...this.mapsList.map(m => m.id)) + 1 
            : 1;

        const paddedId = String(nextId).padStart(4, '0');

        const newMapData = {
            id: nextId,
            name: `Map${paddedId}`,
            fileName: `Map${paddedId}.json`,
            columns: 20,
            rows: 15
        };

        this.mapsList.push(newMapData);
        return newMapData;
    }

    removeMap(id) {
        const initialLength = this.mapsList.length;
        this.mapsList = this.mapsList.filter(m => m.id !== id);
        return this.mapsList.length < initialLength;
    }

    updateMapName(id, newName) {
        const mapItem = this.mapsList.find(m => m.id === id);
        if (mapItem && newName) {
            mapItem.name = newName;
            return true;
        }
        return false;
    }

    getMaps() {
        return this.mapsList;
    }

    /**
     * Apenas lê o arquivo do disco com base no índice e retorna os dados brutos/modelo,
     * sem guardar estado de "mapa atual" aqui dentro.
     */
    async fetchMapDataByIndex(index, projectPath) {
        if (index < 0 || index >= this.mapsList.length) {
            console.error("[MapManager] Índice de mapa inválido:", index);
            return false;
        }

        const mapInfo = this.mapsList[index];
        console.log(`[MapManager] Carregando mapa [${index}]: ${mapInfo.name} (${mapInfo.fileName})`);

        try {
            const fullPath = `${projectPath}/Data/Maps/${mapInfo.fileName}`;
            const fileContent = await window.electronAPI.loadJsonFile(fullPath);
        
            if (!fileContent) {
                console.error("[MapManager] Erro ao ler arquivo do disco: Conteúdo vazio.");
                return null; // Retorna o modelo/dados brutos em vez de alterar o state diretamente aqui
            }

            const rawData = fileContent.data ? fileContent.data : fileContent;
            const mapModel = new MapDataModel(rawData);

            console.log("[MapManager] MapDataModel instanciado com sucesso:", mapModel);
            return { mapModel, index };
        } catch (error) {
            console.error("[MapManager] Erro ao carregar o mapa do disco:", error);
            return null;
        }
    }
}