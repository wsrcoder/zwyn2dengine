

import { ProjectDataModel } from '../models/ProjectDataModel/ProjectDataModel.js';
import { MapDataModel } from '../models/MapDataModel/MapDataModel.js';
import { ImageUtils } from '../utils/ImageUtils.js';
import { JsonUtils } from '../utils/JsonUtils.js';
import MapManager from './MapManager.js'; 

export class ProjectController {
    constructor() {

        this.mapManager = new MapManager(); // <-- Instancia o gerenciador de mapas

        this.session = {
            project: {
                path: null,
                data: new ProjectDataModel(),
                isModified: false,
            },
            map: {
                current: null, //antingo currentMapData
                cache: [], //lista de mapas modificados que devem ficar em memoria até salvar
                index: 0 //antigo current MapIndex
            }
        }
    }

    // Atalho para manter compatibilidade com o restante do app que lê projectController.mapsList
    get mapsList() {
        return this.mapManager ? this.mapManager.getMaps() : [];
    }


    async createNewProject(projectRootPath, projectName) {
        const normalizedPath = projectRootPath.replace(/\\/g,'/');

        // 1. Salva o caminho na sessão logo no começo
        this.session.project.path = normalizedPath;

        await window.electronAPI.createDirectory(`${normalizedPath}/Data/Maps`);
        await window.electronAPI.createDirectory(`${normalizedPath}/Assets/Tilesets`);

        let default_tileset= 'TLS0000001';

        const defaultTilesets = [
            {
                fileName: default_tileset + '.png',
                sourcePath: './Assets/Tilesets/' + default_tileset + '.png'
            }
        ]; 

        try{
            for(const tileset of defaultTilesets){
                await ImageUtils.copyImageTo(
                    tileset.sourcePath,
                    normalizedPath,
                    'Assets/Tilesets',
                    tileset.fileName
                );
            }

            console.log('[ProjectController] Tilesets padrão copiados com sucesso.');
        }catch(error){
            console.warn("[ProjectController] Não foi possível copiar os tilesets padrão automaticamente:", error.message);
        }

        //inicializa os dados do projeto usando o projectDataModel
        this.session.project.data = new ProjectDataModel({
            settings:{
                projectName: projectName,
                grid:{
                    default: {
                        columns: 20,
                        rows: 15
                    }
                }
            }
        });


        // 2. Inicializa o MapManager com os mapas vindos do ProjectDataModel
        this.mapManager = new MapManager(this.session.project.data.maps);
        
        // Pega a referência do primeiro mapa gerado pelo modelo/gerenciador
        const firstMap = this.mapManager.getMaps()[0];


        // 3. Salva o arquivo project.json usando o método .toJSON() do model
        await window.electronAPI.saveJsonFile(`${normalizedPath}/project.json`, this.session.project.data.toJSON());

        // 4. Cria e salva o arquivo de dados do mapa inicial
        const defaultRawMap = {
            id: firstMap.id,
            name: firstMap.name,
            fileName: firstMap.fileName,
            columns: firstMap.columns,
            rows: firstMap.rows,
            tile: { width: 32, height: 32 },
            orientation: "orthogonal",
            renderorder: "right-down",
            tilesets: [
                {
                    firstgid: 1,
                    name: default_tileset,
                    columns: 32,
                    rows: 32,
                    image: { fileName: default_tileset + ".png", width: 1024, height: 1024 },
                    tile: { width: 32, height: 32, count: 1024 },
                    meta: {}
                }
            ],
            backgroundLayers: [{ id: 0, name: 'Background 1', visible: true, opacity: 1, columns: firstMap.columns, rows: firstMap.rows, data: new Array(firstMap.columns * firstMap.rows).fill(0) }],
            mapLayers: [{ id: 0, name: 'Map Layer 1', visible: true, opacity: 1, columns: firstMap.columns, rows: firstMap.rows, data: new Array(firstMap.columns * firstMap.rows).fill(0) }],
            eventLayers: [{ id: 0, name: 'Event Layer 1', visible: true, opacity: 1, columns: firstMap.columns, rows: firstMap.rows, data: new Array(firstMap.columns * firstMap.rows).fill(0) }],
            UILayer: [{ id: 0, name: 'UI Layer 1', visible: true, opacity: 1, columns: firstMap.columns, rows: firstMap.rows, data: new Array(firstMap.columns * firstMap.rows).fill(0) }]
        };


        const initialMapModel = new MapDataModel(defaultRawMap);
        const mapJsonString = JsonUtils.stringifyWithCompactArrays(initialMapModel.toJSON());

        await window.electronAPI.saveTextFile(
            `${normalizedPath}/Data/Maps/${firstMap.fileName}`, 
            mapJsonString
        );

        // 5. Define o mapa criado como o mapa atual na sessão
        this.session.map.current = initialMapModel;
        this.session.map.index = 0;
        this.session.project.isModified = false;

        console.log("[ProjectController] Projeto criado com sucesso!");

    }

    async openProject(projectPath) {
        // 1. Normaliza o caminho do projeto e salva na sessão
        const normalizedPath = projectPath.replace(/\\/g, '/').replace(/\/+$/, '');
        this.session.project.path = normalizedPath;

        const jsonFilePath = `${normalizedPath}/project.json`;
        console.log("[ProjectController] Tentando ler o arquivo em:", jsonFilePath);

        const response = await window.electronAPI.loadJsonFile(jsonFilePath);
        console.log("[ProjectController] Resposta bruta da API:", response);

        let projectInfo = null;
        if (response) {
            if (response.data) {
                projectInfo = response.data;
            } else if (response.content) {
                projectInfo = typeof response.content === 'string' ? JSON.parse(response.content) : response.content;
            } else {
                projectInfo = response;
            }
        }

        console.log("[ProjectController] projectConfig processado:", projectInfo);

        if (projectInfo && typeof projectInfo === 'object') {
            // 2. Instancia o ProjectDataModel e guarda na sessão
            this.session.project.data = new ProjectDataModel(projectInfo);
            this.session.project.isModified = false;

            // 3. Inicializa o MapManager usando a lista de mapas do modelo da sessão
            const mapsSource = this.session.project.data.maps || [];
            this.mapManager = new MapManager(mapsSource);
            
            console.log("[ProjectController] mapsList populada com sucesso via MapManager:", this.mapManager.mapsList);
        } else {
            console.error("[ProjectController] Falha crítica: projectConfig é inválido ou nulo.");
            this.session.project.data = new ProjectDataModel();
            this.mapManager = new MapManager([]);
            return false;
        }

        // 4. Carrega o primeiro mapa utilizando o novo fluxo (fetchMapDataByIndex) se houver mapas
        if (this.mapManager.mapsList.length > 0) {
            const result = await this.mapManager.fetchMapDataByIndex(0, this.session.project.path);
            
            if (result) {
                this.session.map.current = result.mapModel;
                this.session.map.index = result.index;
                this.session.project.isModified = false;
                console.log("[ProjectController] Primeiro mapa carregado com sucesso para a sessão.");
                return true;
            } else {
                console.warn("[ProjectController] Não foi possível carregar os dados do primeiro mapa do disco.");
                return false;
            }
        }

        return true;
    }

    async closeProject() {
        console.log("[ProjectController] Fechando o projeto atual...");

        // Opcional: Se quiser checar se há alterações não salvas antes de fechar de vez:
        if (this.session.project.isModified) {
            console.warn("[ProjectController] Existem alterações não salvas no projeto.");
            // Aqui você pode decidir retornar false ou abrir um modal de confirmação no futuro
        }

        // Reseta totalmente a sessão para o estado inicial/vazio
        this.session.project.path = null;
        this.session.project.data = null;
        this.session.project.isModified = false;

        this.session.map.current = null;
        this.session.map.index = null;

        // Limpa o gerenciador de mapas
        this.mapManager = new MapManager([]);

        console.log("[ProjectController] Projeto fechado com sucesso. Sessão limpa.");
        return true;
    }

    async saveProject() {
        if (!this.session.project.path || !this.session.project.data) {
            console.error("[ProjectController] Nenhum projeto aberto para salvar.");
            return false;
        }

        try {
            console.log("[ProjectController] Salvando projeto...");

            const projectPath = this.session.project.path;

            // 1. Salva o project.json usando o método .toJSON() do model
            const projectJsonPath = `${projectPath}/project.json`;
            const projectDataJson = this.session.project.data.toJSON();
            await window.electronAPI.saveJsonFile(projectJsonPath, projectDataJson);
            console.log("[ProjectController] project.json salvo com sucesso.");

            // 2. Salva o mapa atual (se houver um carregado na sessão)
            if (this.session.map.current && this.session.map.index !== null) {
                const currentMapInfo = this.mapManager.getMaps()[this.session.map.index];
                
                if (currentMapInfo && currentMapInfo.fileName) {
                    const mapFilePath = `${projectPath}/Data/Maps/${currentMapInfo.fileName}`;
                    
                    // Usa o MapDataModel para serializar e aplica o compact arrays se necessário
                    const mapDataJson = this.session.map.current.toJSON();
                    const mapJsonString = JsonUtils.stringifyWithCompactArrays(mapDataJson);

                    await window.electronAPI.saveTextFile(mapFilePath, mapJsonString);
                    console.log(`[ProjectController] Mapa atual (${currentMapInfo.fileName}) salvo com sucesso.`);
                }
            }

            // 3. Reseta a flag de modificação
            this.session.project.isModified = false;
            console.log("[ProjectController] Projeto salvo por completo!");
            return true;

        } catch (error) {
            console.error("[ProjectController] Erro crítico ao salvar o projeto:", error);
            return false;
        }
    }





    
    async saveProjectInfo(){
        if(!this.projectPath){
            console.error(`[ProjectController] Impossivel salvar: Nenhum projectPath definido.`);
            return;
        }

        const jsonFilePath = `${this.projectPath}/project.json`;

        const projectInfo = {
            projectName: this.projectName,
            version: "1.0.0",
            maps: this.mapManager.getMaps() // Salva o array padronizado vindo do MapManager
        }

        try{
            await window.electronAPI.saveJsonFile(jsonFilePath, projectInfo);
            console.log(`[ProjectController] project.json salvo com sucesso.`)
        }catch(error){
            console.log(`[ProjectController] Erro ao salvar o projeto`, error);
            throw error;
        }
    }

    async removeFromMapsList(mapId){
        const removed = this.mapManager.removeMap(mapId);
        if(!removed){
            console.warn(`[ProjectController] Mapa com ID ${mapId} não encontrado para remoção.`);
            return;
        }

        console.log(`[ProjectController] Mapa removido com ID:`, mapId);
        await this.saveProjectInfo();
        return true;
    }

    async updateMapInfo(mapId, newName) {
        const updated = this.mapManager.updateMapName(mapId, newName);
        if(!updated) {
            throw new Error(`Mapa com ID ${mapId} não encontrado.`);
        }

        console.log(`[ProjectController] Informações do mapa ${mapId} atualizadas.`);
        await this.saveProjectInfo();
        return true;
    }

    async createNewMap() {
        try {
            // 1. Pede para o MapManager gerar a nova estrutura limpa
            const newMapItem = this.mapManager.createNewMap();
            newMapItem.dirPath = `${this.projectPath}/Data/Maps`;

            // 2. Montar a estrutura Json padrão do novo mapa baseada no modelo novo
            const defaultRawMap = {
                id: newMapItem.id,
                name: newMapItem.name,
                columns: newMapItem.width,
                rows: newMapItem.height,
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
                backgroundLayers: [{ id: 0, name: 'Background 1', visible: true, opacity: 1, columns: newMapItem.width, rows: newMapItem.height, data: new Array(newMapItem.width * newMapItem.height).fill(0) }],
                mapLayers: [{ id: 0, name: 'Map Layer 1', visible: true, opacity: 1, columns: newMapItem.width, rows: newMapItem.height, data: new Array(newMapItem.width * newMapItem.height).fill(0) }],
                eventLayers: [{ id: 0, name: 'Event Layer 1', visible: true, opacity: 1, columns: newMapItem.width, rows: newMapItem.height, data: new Array(newMapItem.width * newMapItem.height).fill(0) }],
                UILayer: [{ id: 0, name: 'UI Layer 1', visible: true, opacity: 1, columns: newMapItem.width, rows: newMapItem.height, data: new Array(newMapItem.width * newMapItem.height).fill(0) }]
            };

            const newMapData = new MapDataModel(defaultRawMap);
            const mapJsonString = JsonUtils.stringifyWithCompactArrays(newMapData.toJSON());

            // 3. Salva o arquivo físico no disco
            await window.electronAPI.saveTextFile(`${newMapItem.dirPath}/${newMapItem.fileName}`, mapJsonString);

            // 4. Atualiza o arquivo project.json global
            await this.saveProjectInfo();

            console.log("[ProjectController] Novo mapa criado com sucesso:", newMapItem.name);
            return newMapData;
        } catch(error) {
            console.error("[ProjectController] Erro ao criar novo mapa:", error);
            return null;
        }
    }
}