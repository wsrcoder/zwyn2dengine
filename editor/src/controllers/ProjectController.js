

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
                currentId: null,      // Apenas o ID do mapa atual. Zero redundância!
                cache: new Map()      // O Map do JS que guarda tudo
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

        // 5. Define o mapa criado como o mapa atual na sessão (via cache)
        this.session.map.cache.set(initialMapModel.id, {
            mapDataModel: initialMapModel,
            fileName: firstMap.fileName,
            isModified: false
        });

        this.session.map.currentId = initialMapModel.id;
        this.session.project.isModified = false;

        console.log("[ProjectController] Projeto criado com sucesso!");
        console.log("[Debug Cache] Mapas na memória:", Array.from(this.session.map.cache.entries()));

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

        // Limpa o cache antigo antes de abrir um novo projeto
        this.session.map.cache.clear();
        this.session.map.currentId = null;

        // 4. Carrega o primeiro mapa utilizando o MapManager e armazena no cache
        const allMaps = this.mapManager.getMaps();
        if (allMaps.length > 0) {
            const firstMapMeta = allMaps[0];
            const result = await this.mapManager.fetchMapDataByIndex(0, this.session.project.path);
            
            if (result && result.mapModel) {
                // Insere o primeiro mapa no cache usando o padrão novo

                this.session.map.cache.set(firstMapMeta.id,{
                                            mapDataModel: result.mapModel,
                                             fileName: firstMapMeta.fileName,
                                            isModified: true
                                    });

                // Define o ID atual
                this.session.map.currentId = firstMapMeta.id;
                this.session.project.isModified = false;

                console.log("[ProjectController] Primeiro mapa carregado com sucesso para o cache da sessão.");
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

        // 1. Verifica se o projeto ou algum mapa no cache possui alterações não salvas
        let hasUnsavedChanges = this.session.project.isModified;
        
        if (!hasUnsavedChanges) {
            for (const entry of this.session.map.cache.values()) {
                if (entry.isModified) {
                    hasUnsavedChanges = true;
                    break;
                }
            }
        }

        if (hasUnsavedChanges) {
            console.warn("[ProjectController] Existem alterações não salvas no projeto ou em mapas abertos.");
            // Aqui no futuro você pode abrir um modal de confirmação (Salvar / Descartar / Cancelar)
        }

        // 2. Reseta totalmente a sessão para o estado inicial/vazio
        this.session.project.path = null;
        this.session.project.data = null;
        this.session.project.isModified = false;

        // Limpa a nova estrutura de mapas da sessão
        this.session.map.currentId = null;
        this.session.map.cache.clear();

        // 3. Limpa o gerenciador de mapas
        this.mapManager = new MapManager([]);

        console.log("[ProjectController] Projeto fechado com sucesso. Sessão e cache limpos.");
        return true;
    }

    
    // TODO: Atualizar o fluxo de modificações para garantir que o cache seja 
    // devidamente atualizado e marcado como modificado (isModified = true) quando:
    // 1. Um mapa existente sofrer alterações (tiles, eventos, etc.).
    // 2. Um novo mapa for criado (ele já deve ser inserido diretamente no cache).
    // 3. Uma nova camada for adicionada a um mapa.
    // Ajustar essa sincronização à medida que o editor continuar evoluindo.


    async saveProject() {
        if (!this.session.project.path || !this.session.project.data) {
            console.error("[ProjectController] Nenhum projeto aberto para salvar.");
            return false;
        }

        try {
            console.log("[ProjectController] Salvando projeto...");
            const projectPath = this.session.project.path;

            // 1. Salva o project.json
            await window.electronAPI.saveJsonFile(`${projectPath}/project.json`, this.session.project.data.toJSON());

            // 2. Percorre o cache de forma direta e eficiente
            for (const [mapId, cacheEntry] of this.session.map.cache.entries()) {
                if (cacheEntry.isModified) {
                    // O fileName já está guardado junto, zero buscas necessárias!
                    const mapFilePath = `${projectPath}/Data/Maps/${cacheEntry.fileName}`;
                
                    const mapJsonString = JsonUtils.stringifyWithCompactArrays(cacheEntry.mapDataModel.toJSON());
                    await window.electronAPI.saveTextFile(mapFilePath, mapJsonString);
                
                    cacheEntry.isModified = false;
                    console.log(`[ProjectController] Mapa ${cacheEntry.fileName} salvo.`);
                }
            }

            // 3. Otimização de Memória: limpa o cache e mantém APENAS o atual
            const currentId = this.session.map.currentId;
            const currentEntry = this.session.map.cache.get(currentId);

            this.session.map.cache.clear();

            if (currentEntry) {
                
                this.session.map.cache.set(currentId,{
                                            mapDataModel: currentEntry,
                                            fileName: currentEntry.fileName,
                                            isModified: true
                                    });
            }

            this.session.project.isModified = false;
            console.log("[ProjectController] Projeto salvo e cache limpo com sucesso!");
            return true;

        } catch (error) {
            console.error("[ProjectController] Erro crítico ao salvar o projeto:", error);
            return false;
        }
    }


    /**
     * Atalho para criar um novo mapa através do MapManager, mantendo o controle da sessão centralizado.
     */
    async createNewMap(columns = 20, rows = 15) {
        if (!this.mapManager || !this.session) {
            console.error("[ProjectController] MapManager ou Sessão não inicializados.");
            return null;
        }

        // Delega a criação para o MapManager, passando a sessão atual
        const result = this.mapManager.createNewMap(this.session, columns, rows);
        
        if (result) {
            // Se precisar disparar algum save automático do project.json ou atualizar listeners da UI, faz aqui.
            console.log("[ProjectController] Novo mapa criado via atalho do MapManager.");
        }

        return result;
    }
}