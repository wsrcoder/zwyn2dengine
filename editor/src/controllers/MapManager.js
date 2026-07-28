import {ProjectParams} from "../constants/ProjectParams";
import { MapDataModel } from "../models/MapDataModel/MapDataModel";


export default class MapManager {
    constructor(mapsList = []) {
        this.mapsList = mapsList;
    }


    createNewMapOld() {
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

    createNewMap(session, columns = 20, rows = 15) {
        try {
            const newId = this.mapsList.length > 0 ? Math.max(...this.mapsList.map(m => m.id)) + 1 : 1;
            const paddedId = String(newId).padStart(ProjectParams.MAX_MAP_INTERVAL, '0');
            const newName = `Map${paddedId}`;
            const newFileName = `${newName}.json`; // <--- Ajustado a interpolação

            const newMapMeta = {
                id: newId,
                name: newName,
                fileName: newFileName,
                columns: columns, // <--- Ajustado de width para columns
                rows: rows        // <--- Ajustado de height para rows
            };

            // Adiciona na lista de mapas da sessão
            this.mapsList.push(newMapMeta);

            const defaultRawMap = { // <--- Corrigido o typo de defaultRawNap para defaultRawMap
                id: newId,
                name: newName,
                columns: columns,
                rows: rows,
                tile: { width: ProjectParams.TILE_SIZE, height: ProjectParams.TILE_SIZE },
                orientation: ProjectParams.MAP_ORIENTATION,
                renderOrder: ProjectParams.MAP_RENDER_ORDER,

                tilesets: [
                    {
                        firstgid: 1,
                        name: "TLS0000001",
                        columns: 32,
                        rows: 32,
                        image: { name: "TLS0000001.png", width: 1024, height: 1024 },
                        tile: { width: 32, height: 32, count: 1024 },
                        meta: {}
                    }
                ],

                // Criação limpa dos buckets (tamanho correto: columns * rows)
                backgroundLayers: [{ id: 0, name: 'Background 1', visible: true, opacity: 1, columns: columns, rows: rows, data: new Array(columns * rows).fill(0) }],
                mapLayers: [{ id: 0, name: 'Map Layer 1', visible: true, opacity: 1, columns: columns, rows: rows, data: new Array(columns * rows).fill(0) }],
                eventLayers: [{ id: 0, name: 'Event Layer 1', visible: true, opacity: 1, columns: columns, rows: rows, data: new Array(columns * rows).fill(0) }],
                UILayer: [{ id: 0, name: 'UI Layer 1', visible: true, opacity: 1, columns: columns, rows: rows, data: new Array(columns * rows).fill(0) }]
            };

            // Instancia o novo modelo
            const newMapModel = new MapDataModel(defaultRawMap);

            // Jogar direto no Cache da Sessão (Marcado como modificado)
            session.map.cache.set(newId,{
                                    mapDataModel: newMapModel,
                                    fileName: newFileName,
                                    isModified: true
            });

            // Atualiza o estado global da sessão
            session.map.currentId = newId;
            session.project.isModified = true;

            console.log(`[MapManager] Novo mapa criado em cache: ${newName}`);
            
            return { meta: newMapMeta, mapDataModel: newMapModel };
        } catch (error) {
            console.error("[MapManager] Erro ao criar novo mapa:", error);
            return null;
        }
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