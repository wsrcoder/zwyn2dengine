import { TiledLoader } from '../parsers/Tiled/TiledLoader.js';
import { MapDataModel } from '../models/MapDataModel/MapDataModel.js';
import { ImageUtils } from '../utils/ImageUtils.js';
import { JsonUtils } from '../utils/JsonUtils.js';

export class ProjectController {
    constructor() {
        this.projectPath = null;
        this.projectName = null;
        this.isModified = false;

        this.mapsList = []; 
        this.currentMapIndex = 0;
        this.currentMapData = null; // Instância do MapDataModel

    }

    async initProject(projectName, projectPath, mapFileNames = []) {
        this.projectPath = projectPath.replace(/\\/g, '/').replace(/\/+$/, '');
        this.projectName = projectName;
        
        this.mapsList = mapFileNames.map((fileName, index) => ({
            id: `map_${index}`,
            name: fileName,
            dirPath: this.projectPath
        }));

        if (this.mapsList.length > 0) {
            await this.loadMapByIndex(0);
        }
    }

    async openProject(projectPath) {
        this.projectPath = projectPath.replace(/\\/g, '/').replace(/\/+$/, '');
        
        const jsonFilePath = `${this.projectPath}/project.json`;
        console.log("[ProjectController] Tentando ler o arquivo em:", jsonFilePath);

        const response = await window.electronAPI.loadJsonFile(jsonFilePath);
        console.log("[ProjectController] Resposta bruta da API:", response);

        // Extrai o objeto de configuração independentemente de vir puro ou encapsulado em .data / .content
        let projectConfig = null;
        if (response) {
            if (response.data) {
                projectConfig = response.data;
            } else if (response.content) {
                projectConfig = typeof response.content === 'string' ? JSON.parse(response.content) : response.content;
            } else {
                projectConfig = response; // Caso venha direto o objeto JSON
            }
        }

        console.log("[ProjectController] projectConfig processado:", projectConfig);

        if (projectConfig && typeof projectConfig === 'object') {
            this.projectName = projectConfig.projectName || "Unnamed Project";

            if (Array.isArray(projectConfig.maps)) {
                this.mapsList = projectConfig.maps.map(mapItem => ({
                    id: mapItem.id,
                    name: mapItem.name, 
                    dirPath: `${this.projectPath}/Data/Maps`
                }));
                console.log("[ProjectController] mapsList populada com sucesso:", this.mapsList);
            } else {
                console.warn("[ProjectController] O arquivo project.json não possui um array de 'maps' válido.");
            }
        } else {
            console.error("[ProjectController] Falha crítica: projectConfig é inválido ou nulo.");
        }

        if (this.mapsList.length > 0) {
            await this.loadMapByIndex(0);
        }
    }

    async loadMapByIndex(index) {
        if (index < 0 || index >= this.mapsList.length) {
            console.error("[ProjectController] Índice de mapa inválido:", index);
            return false;
        }

        const mapInfo = this.mapsList[index];
        console.log(`[ProjectController] Carregando mapa [${index}]: ${mapInfo.name} em ${mapInfo.dirPath}`);

        try {
            const fullPath = `${mapInfo.dirPath}/${mapInfo.name}`;
            const fileContent = await window.electronAPI.loadJsonFile(fullPath);
            
            

            if (!fileContent) {
                console.error("[ProjectController] Erro ao ler arquivo do disco: Conteúdo vazio.");
                return false;
            }

            // Suporta tanto formato direto quanto encapsulado em .data
            const rawData = fileContent.data ? fileContent.data : fileContent;
  

            this.currentMapData = new MapDataModel(rawData);
            this.currentMapIndex = index;
            this.isModified = false;

            console.log("[ProjectController] MapDataModel instanciado com sucesso:", this.currentMapData);
            return true;
        } catch (error) {
            console.error("[ProjectController] Erro ao carregar o mapa do disco:", error);
            return false;
        }
    }

    getCurrentMap() {
        return this.currentMapData;
    }

    async createNewProject(projectRootPath, projectName) {
        const normalizedPath = projectRootPath.replace(/\\/g, '/');

        await window.electronAPI.createDirectory(`${normalizedPath}/Data/Maps`);
        await window.electronAPI.createDirectory(`${normalizedPath}/Assets/Tilesets`);

        const defaultTilesets = [
            {
                fileName: 'TLS0000001.png',
                sourcePath: './Assets/Tilesets/TLS0000001.png'
            }
        ];

        try {
            for (const tileset of defaultTilesets) {
                await ImageUtils.copyImageTo(
                    tileset.sourcePath, 
                    normalizedPath, 
                    'Assets/Tilesets', 
                    tileset.fileName
                );
            }
            console.log("[ProjectController] Tilesets padrão copiados com sucesso!");
        } catch (error) {
            console.warn("[ProjectController] Não foi possível copiar os tilesets padrão automaticamente:", error.message);
        }

        const projectInfo = {
            projectName: projectName,
            version: "1.0",
            maps: [
                { id: "map_0001", name: "Map0001.json" }
            ]
        };
        
        await window.electronAPI.saveJsonFile(`${normalizedPath}/project.json`, projectInfo);

        const defaultRawMap = {
            id: "map_0001",
            name: "Map0001.json",
            columns: 20,
            rows: 15,
            tile: { width: 32, height: 32 },
            orientation: "orthogonal",
            renderorder: "right-down",
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
            backgroundLayers: [{ id: 0, name: 'Background 1', visible: true, opacity: 1, columns: 20, rows: 15, data: new Array(20 * 15).fill(0) }],
            mapLayers: [{ id: 0, name: 'Map Layer 1', visible: true, opacity: 1, columns: 20, rows: 15, data: new Array(20 * 15).fill(0) }],
            eventLayers: [{ id: 0, name: 'Event Layer 1', visible: true, opacity: 1, columns: 20, rows: 15, data: new Array(20 * 15).fill(0) }],
            UILayer: [{ id: 0, name: 'UI Layer 1', visible: true, opacity: 1, columns: 20, rows: 15, data: new Array(20 * 15).fill(0) }]
        };
    
        const initialMapModel = new MapDataModel(defaultRawMap);
        const mapJsonString = JsonUtils.stringifyWithCompactArrays(initialMapModel.toJSON());

        await window.electronAPI.saveTextFile(
            `${normalizedPath}/Data/Maps/Map0001.json`, 
            mapJsonString
        );

        console.log("[ProjectController] Projeto criado com sucesso!");

        // Garante que o projeto recém-criado já carregue as configurações e o mapa inicial
        await this.openProject(normalizedPath);
    }

    //adiciona um novo mapa a lista do projeto
    async addToMapsList(mapId, mapName){
        if(!this.projectPath){
            throw new Error("Nenhum projeto aberto para adicionar mapas.");
        }

        const exists = this.mapsList.some(m => m.id === mapId || m.name === mapName);

        if(exists){
            console.warn(`[ProjectController] O mapa ${mapName} (${mapId}) já existe na lista.`);
            return false;
        }

        const newMapItem = {
            id: mapId,
            name: mapName,
            dirPath: `${this.projectPath}/Data/Maps`
        };

        this.mapsList.push(newMapItem);
        console.log(`[ProjectController] Mapa ${mapName} adicionado à lista.`);

        await this.saveProjectInfo();
        return true;
    }

    async saveProjectInfo(){
        if(!this.projectPath){
            console.error(`[ProjectController] Impossivel salvar: Nenhum projectPath definido.`);
            return;
        }

        const jsonFilePath = `${this.projectPath}/project.json`;

        const projectInfo = {
            projectName: this.projectName,
            maps: this.mapsList.map(mapItem => ({
                id: mapItem.id,
                name: mapItem.name
            }))
        }

        try{
            //
            await window.electronAPI.saveJsonFile(jsonFilePath, projectInfo);
            console.log(`[ProjectController] project.json salvo com sucesso.`)
        }catch(error){
            console.log(`[ProjectController] Erro ao salvar o projeto`, error);
            throw error;
        }
    }

    async removeFromMapsList(mapId){
        const index = this.mapsList.findIndex(m => m.id === mapId);

        if(index === -1){
            console.warn(`[ProjectController] Mapa com ID ${mapId} não encontrado para remoção.`)
            return;
        }

        const removed = this.mapsList.splice(index, 1);
        console.log(`[ProjectController] Mapa removido:`, removed);

        await this.saveProjectInfo();
        return true;

    }

    async updateMapInfo(mapId, newName) {
        const mapItem = this.mapsList.find(m => m.id === mapId); // Corrigido para 'this.mapsList' e removido o 'await' desnecessário

        if (!mapItem) {
            throw new Error(`Mapa com ID ${mapId} não encontrado.`); // Corrigido para crases (``)
        }

        if (newName) {
            mapItem.name = newName;
        }

        console.log(`[ProjectController] Informações do mapa ${mapId} atualizadas.`);
        await this.saveProjectInfo();
        return true;
    }

    async createNewMap(){

        try{

            //descobrir o proximo número sequencial baseado na lista atual de mapas
            const mapsList = this.mapsList || [];

            let nextIdNumber = 1;

            if(mapsList.length > 0){
                //Extrai números dos nomes existentes (ex: "Map0001" => 1)
                const numbers = mapsList.map(m => {
                    const name = typeof m === 'string' ? m: (m.name || '');
                    const match = name.match(/\d+/);
                    return match ? parseInt(match[0], 10): 0;
                });

                nextIdNumber = Math.max(...numbers) + 1;
            }

            //Formata com zeros a esquerda(ex: 2 vira "Map0002")
            const mapId = `Map${String(nextIdNumber).padStart(4,'0')}`;
            const fileName = `${mapId}.json`;

            //Montar a estrutura Json padrão do novo mapa
            const defaultRawMap = {
                id: mapId,
                name: mapId,
                columns: 20,
                rows: 15,
                tile: { width: 32, height: 32 },
                orientation: "orthogonal",
                renderorder: "right-down",
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
                backgroundLayers: [{ id: 0, name: 'Background 1', visible: true, opacity: 1, columns: 20, rows: 15, data: new Array(20 * 15).fill(0) }],
                mapLayers: [{ id: 0, name: 'Map Layer 1', visible: true, opacity: 1, columns: 20, rows: 15, data: new Array(20 * 15).fill(0) }],
                eventLayers: [{ id: 0, name: 'Event Layer 1', visible: true, opacity: 1, columns: 20, rows: 15, data: new Array(20 * 15).fill(0) }],
                UILayer: [{ id: 0, name: 'UI Layer 1', visible: true, opacity: 1, columns: 20, rows: 15, data: new Array(20 * 15).fill(0) }]
            };

            const newMapData = new MapDataModel(defaultRawMap);
            const mapJsonString = JsonUtils.stringifyWithCompactArrays(newMapData.toJSON());

            await window.electronAPI.saveTextFile(`${this.projectPath}/Data/Maps/${fileName}`, mapJsonString);

            // Adiciona à lista local do controller
            this.addToMapsList(mapId, fileName);

            //Atualizar o project.json
            this.saveProjectInfo();

            console.log("[ProjectController] Projeto criado com sucesso!");

            return newMapData;
        }catch(error){
            console.error("[ProjectController] Erro ao criar novo mapa:", error);
            return null;
        }
    }


}