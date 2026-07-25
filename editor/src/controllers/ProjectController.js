
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

        // O TiledLoader retorna o resultado da leitura
        const result = await TiledLoader.loadTiledJsonMap(mapInfo.dirPath, mapInfo.name);
        console.log("Resultado bruto do TiledLoader:", result);

        // Se o seu TiledLoader retorna diretamente o objeto JSON parseado (ou se a estrutura muda),
        // adaptamos a validação aqui:
        const mapJsonData = result.data || result; // Garante que pega o JSON de um jeito ou de outro

        if (!mapJsonData) {
            console.error("[ProjectController] Erro ao ler arquivo do disco: Dados vazios ou inválidos.");
            return false;
        }

        // Instancia o nosso MapDataModel com os dados corretos
        this.currentMapData = new MapDataModel(mapJsonData);
        this.currentMapIndex = index;
        this.isModified = false;

        console.log("[ProjectController] MapDataModel instanciado com sucesso:", this.currentMapData);
        return true;
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
            width: 20,
            height: 15,
            tilewidth: 32,
            tileheight: 32,
            orientation: "orthogonal",
            renderorder: "right-down",
            tilesets: [
                {
                    firstgid: 1,
                    name: "TLS0000001",
                    image: "TLS0000001.png",
                    imagewidth: 1024,   // Ajuste se souber a largura exata da imagem do tileset
                    imageheight: 1024,  // Ajuste se souber a altura exata da imagem do tileset
                    tilewidth: 32,
                    tileheight: 32,
                    spacing: 0,
                    margin: 0
                }
            ],
            backgroundLayers: [
                { name: 'Background 1', visible: true, opacity: 1, width: 20, height: 15, data: new Array(20 * 15).fill(0) }
            ],
            mapLayers: [
                { name: 'Map Layer 1', visible: true, opacity: 1, width: 20, height: 15, data: new Array(20 * 15).fill(0) }
            ],
            eventLayers: [
                { name: 'Event Layer 1', visible: true, opacity: 1, width: 20, height: 15, data: [] }
            ],
            UILayer: [
                { name: 'UI Layer 1', visible: true, opacity: 1, width: 20, height: 15, data: [] }
            ]
        };
    
        // Instancia o model e serializa para garantir o formato correto da engine
        const initialMapModel = new MapDataModel(defaultRawMap);
        const mapJsonString = JsonUtils.stringifyWithCompactArrays(initialMapModel.toJSON());

        await window.electronAPI.saveTextFile(
            `${normalizedPath}/Data/Maps/Map0001.json`, 
            mapJsonString
        );

        // 4. Inicializa o projeto recém-criado no próprio controller para já deixá-lo ativo
        await this.initProject(projectName, `${normalizedPath}/Data/Maps`, ["Map001.json"]);

        console.log("[ProjectController] Projeto criado e inicializado com sucesso!");
    }

    
}