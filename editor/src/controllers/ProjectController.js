
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
        // Padroniza as barras para evitar conflito do Windows com o Electron
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

    async loadMapByIndex(index) {
        if (index < 0 || index >= this.mapsList.length) {
            console.error("[ProjectController] Índice de mapa inválido:", index);
            return false;
        }

        const mapInfo = this.mapsList[index];
        console.log(`[ProjectController] Carregando mapa [${index}]: ${mapInfo.name} em ${mapInfo.dirPath}`);

        try {
            // Constrói o caminho completo do arquivo do mapa
            const fullPath = `${mapInfo.dirPath}/${mapInfo.name}`;

            
            // Lê o arquivo do disco usando a API do Electron
            const fileContent = await window.electronAPI.loadJsonFile(fullPath);
            
            if (!fileContent) {
                console.error("[ProjectController] Erro ao ler arquivo do disco: Conteúdo vazio.");
                return false;
            }
            console.log(fileContent.data);

            // Instancia o nosso MapDataModel com os dados limpos do nosso próprio formato
            this.currentMapData = new MapDataModel(fileContent.data);
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

    async createNewProject(projectRootPath, projectName){
        const normalizedPath = projectRootPath.replace(/\\/g, '/');

        // 1. Cria a estrutura de pastas física
        await window.electronAPI.createDirectory(`${normalizedPath}/Data/Maps`);
        await window.electronAPI.createDirectory(`${normalizedPath}/Assets/Tilesets`);


        // 1.1 Lista de tilesets padrão para copiar na inicialização do projeto
        const defaultTilesets = [
            {
                fileName: 'TLS0000001.png',
                sourcePath: './Assets/Tilesets/TLS0000001.png'
            }
            // Quando precisar de mais, basta adicionar novos objetos aqui:
            // { fileName: 'TLS0000002.png', sourcePath: './Assets/Tilesets/TLS0000002.png' }
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

        // 2. Cria o arquivo de configuração do projeto (project.json)
        const projectConfig = {
                projectName: projectName,
                version: "1.0",
                maps: [
                        { id: "map_0001", name: "Map0001.json" }
                    ]
                };
        
        await window.electronAPI.saveTextFile(
            `${normalizedPath}/project.json`, 
            JSON.stringify(projectConfig, null, 2)
        );

        // 3. Cria o Map001.json inicial limpo usando o MapDataModel padrão
        const defaultRawMap = {
            columns: 20,
            rows: 15,
            tile:{
                width: 32,
                height: 32
            } ,
            orientation: "orthogonal",
            renderorder: "right-down",
            tilesets: [
                {
                    firstgid: 1,
                    name: "TLS0000001",
                    columns: 32,
                    rows: 32,
                    image:{
                        name: "TLS0000001.png",
                        width: 1024,
                        height: 1024
                    } ,

                    tile:{
                        width: 32,
                        height: 32,
                        count: 1024
                    },
                    meta: {}
                }
            ],
            backgroundLayers: [
                { id: 0,
                    name: 'Background 1', 
                    visible: true, 
                    opacity: 1, 
                    columns: 20, 
                    rows: 15, 
                    data: new Array(20 * 15).fill(0) }
            ],
            mapLayers: [
                { id:0,
                    name: 'Map Layer 1', 
                    visible: true, 
                    opacity: 1, 
                    columns: 20, 
                    rows: 15, 
                    data: new Array(20 * 15).fill(0) }
            ],
            eventLayers: [
                { id:0,
                    name: 'Event Layer 1', 
                    visible: true, 
                    opacity: 1, 
                    columns: 20, 
                    rows: 15, 
                    data: new Array(20 * 15).fill(0) }
            ],
            UILayer: [
                { id:0,
                    name: 'UI Layer 1', 
                    visible: true, 
                    opacity: 1, 
                    columns: 20, 
                    rows: 15, 
                    data: new Array(20 * 15).fill(0) }
            ]
        };
    
        // Instancia o model e serializa para garantir o formato correto da engine
        const initialMapModel = new MapDataModel(defaultRawMap);
        const mapJsonString = JsonUtils.stringifyWithCompactArrays(initialMapModel.toJSON());

        await window.electronAPI.saveTextFile(
            `${normalizedPath}/Data/Maps/Map0001.json`, 
            mapJsonString
        );

        console.log("[ProjectController] Projeto criado com sucesso!");
    }

    
}