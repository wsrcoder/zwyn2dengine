
import ProjectModel from '../models/Project/ProjectModel.js';
import { MapDataModel } from '../models/MapDataModel/MapDataModel.js';

import { ImageUtils } from '../utils/ImageUtils.js';
import { JsonUtils } from '../utils/JsonUtils.js';
import SceneState from '../state/SceneState.js';


export default class ProjectService {
    /**
     * Cria um novo projeto do zero, estruturando pastas, copiando assets,
     * gerando o mundo/cena inicial no disco e populando a sessão.
     */
   async create(session, projectRootPath, projectName) {
        if (!projectRootPath || !projectName) {
            return {
                success: false,
                message: "Caminho raiz e nome do projeto são obrigatórios.",
                data: null
            };
        }

        const normalizedPath = projectRootPath.replace(/\\/g, '/');

        try {
            // 1. Configura o rootPath na sessão
            session.rootPath = normalizedPath;
            session.isModified = false;

            // 2. Cria a estrutura de diretórios base
            await window.electronAPI.createDirectory(`${session.rootPath}/Data/Maps`);
            await window.electronAPI.createDirectory(`${session.rootPath}/Assets/Tilesets`);

            // 3. Copia os tilesets padrão - TD: TOP DOWN
            const default_tileset = 'TTD1';
            const defaultTilesets = [
                {
                    fileName: default_tileset + '.png',
                    sourcePath: './Assets/Tilesets/' + default_tileset + '.png'
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
                console.log('[ProjectService] Tilesets padrão copiados com sucesso.');
            } catch (error) {
                console.warn("[ProjectService] Não foi possível copiar os tilesets padrão automaticamente:", error.message);
            }

            // 4. Instancia o ProjectModel e cria a estrutura padrão de Mundos/Cenas
            session.project = new ProjectModel({
                settings: {
                    projectName: projectName,
                    grid: {
                        default: { columns: 20, rows: 15 }
                    }
                }
            });

            const defaultWorld = session.project.worlds[0];
            const defaultScene = defaultWorld.scenes[0];

            // 5. Salva o arquivo project.json no disco
            await window.electronAPI.saveJsonFile(`${normalizedPath}/project.json`, session.project.toJSON());

            // 6. Cria e salva o arquivo de dados da cena inicial no disco
            const defaultRawMap = {
                id: defaultScene.id,
                worldId: defaultWorld.id,
                name: 'Scene' + defaultScene.id,
                fileName: 'W' + defaultWorld.id + 'S' + defaultScene.id + '.json',
                columns: defaultScene.columns || 20,
                rows: defaultScene.rows || 15,
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
                backgroundLayers: [{ id: 0, name: 'Background 1', visible: true, opacity: 1, columns: 20, rows: 15, data: new Array(20 * 15).fill(0) }],
                mapLayers: [{ id: 0, name: 'Map Layer 1', visible: true, opacity: 1, columns: 20, rows: 15, data: new Array(20 * 15).fill(0) }],
                eventLayers: [{ id: 0, name: 'Event Layer 1', visible: true, opacity: 1, columns: 20, rows: 15, data: new Array(20 * 15).fill(0) }],
                UILayer: [{ id: 0, name: 'UI Layer 1', visible: true, opacity: 1, columns: 20, rows: 15, data: new Array(20 * 15).fill(0) }]
            };

            const initialMapModel = new MapDataModel(defaultRawMap);
            const mapJsonString = JsonUtils.stringifyWithCompactArrays(initialMapModel.toJSON());

            await window.electronAPI.saveTextFile(
                `${normalizedPath}/Data/Maps/${defaultScene.fileName}`, 
                mapJsonString
            );

            // 7. Popula o cache global da sessão com a cena inicial (guardando a referência do worldId) e define a navegação na raiz
            if (!session.workingScenes) {
                session.workingScenes = new SceneState();
            }

            session.workingScenes.setScene(defaultScene.id, {
                worldId: defaultWorld.id, // Referência limpa de qual mundo essa cena pertence
                data: initialMapModel,
                fileName: defaultScene.fileName,
                isModified: false,
                isDeleted: false
            });

            // Ponteiros de navegação atualizados para a raiz da sessão
            session.navigation.activeWorldId = defaultWorld.id;
            session.navigation.activeSceneId = defaultScene.id;

            console.log("[ProjectService] Projeto criado e estruturado com sucesso no disco!");

            return {
                success: true,
                message: "Projeto criado com sucesso.",
                data: {
                    project: session.project,
                    rootPath: normalizedPath
                }
            };

        } catch (error) {
            console.error("[ProjectService] Erro crítico ao criar projeto:", error);
            return {
                success: false,
                message: `Erro ao criar projeto no disco: ${error.message}`,
                data: null
            };
        }
    }
    /**
     * Lê apenas o project.json e inicializa o ProjectModel na sessão.
     */
   async open(session, projectPath) {
        if (!projectPath) {
            return {
                success: false,
                message: "O caminho do projeto é obrigatório para a abertura.",
                data: null
            };
        }

        try {
            const normalizedPath = projectPath.replace(/\\/g, '/').replace(/\/+$/, '');
            session.rootPath = normalizedPath;

            const jsonFilePath = `${normalizedPath}/project.json`;
            console.log("[ProjectService] Tentando ler o arquivo em:", jsonFilePath);

            const response = await window.electronAPI.loadJsonFile(jsonFilePath);
            console.log("[ProjectService] Resposta bruta da API:", response);

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

            if (!projectInfo || typeof projectInfo !== 'object') {
                console.error("[ProjectService] Falha crítica: projectConfig é inválido ou nulo.");
                session.project = new ProjectModel();
                return {
                    success: false,
                    message: "O arquivo project.json é inválido ou está corrompido.",
                    data: null
                };
            }

            // Instancia o ProjectModel na sessão
            session.project = new ProjectModel(projectInfo);
            session.isModified = false;

            // Garante que workingScenes existe e limpa o cache corretamente (Map nativo)
            if (!session.workingScenes) {
                session.workingScenes = new SceneState();
            } else {
                session.workingScenes.clear();
            }

            // Define a navegação inicial de forma inteligente:
            // Se o projeto salvo tiver mundos, seleciona o primeiro automaticamente. Senão, deixa null.
            const firstWorld = session.project.worlds && session.project.worlds.length > 0 ? session.project.worlds[0] : null;
            session.navigation.activeWorldId = firstWorld ? firstWorld.id : null;
            session.navigation.activeSceneId = null; // A cena ativa pode ser carregada sob demanda ou se houver padrão

            console.log("[ProjectService] project.json carregado com sucesso.");

            return {
                success: true,
                message: "Projeto aberto com sucesso.",
                data: session.project
            };

        } catch (error) {
            console.error("[ProjectService] Erro crítico ao abrir o projeto:", error);
            return {
                success: false,
                message: `Erro ao abrir projeto: ${error.message}`,
                data: null
            };
        }
    }
}