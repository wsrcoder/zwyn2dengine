
import ProjectModel from '../models/Project/ProjectModel.js';
import SceneModel from '../models/Scene/SceneModel.js';

import { ImageUtils } from '../utils/ImageUtils.js';
import { JsonUtils } from '../utils/JsonUtils.js';
import IdUtils from '../utils/IdUtils.js';
import SceneState from '../core/SceneState.js';

import { ProjectParams } from '../constants/ProjectParams.js';
import { TilesetEnum, SceneOrientationEnum, SceneRenderOrderEnum } from '../constants/Enums.js';
import { TilesetDTO } from '../models/Scene/TilesetDTO.js';


export default class ProjectService {
    /**
     * Cria um novo projeto do zero, estruturando pastas, copiando assets,
     * gerando o mundo/cena inicial no disco e populando a sessão.
     */
    async create(session, projectRootPath, projectName) {
        if(!projectRootPath || !projectName){
            return{
                sucess: false,
                message: "Caminho raiz e nome do projeto são obrigatórios.",
                data: null
            }
        }

        const normalizedPath = projectRootPath.replace(/\\/g, '/');

        try{
             // 1. Configura o rootPath na sessão
            session.rootPath = normalizedPath;
            session.isModified = false;

            // 2. Cria a estrutura de diretórios base
            await window.electronAPI.createDirectory(`${session.rootPath}/${ProjectParams.DIR.SCENES}`);
            await window.electronAPI.createDirectory(`${session.rootPath}/${ProjectParams.DIR.TILESETS}`);

            const _tileset = new TilesetDTO({
                        firstgid:  1,
                        name: "TTD1",
                        type: TilesetEnum.TOP_DOWN,

                        tile: {
                            width:  32,
                            height: 32,
                            count:  1024
                        },

                        columns:  32,
                        rows:  32,

                        imageFile: {
                            name: "TTD1.png", 
                            width:  1024,
                            height:  1024
                        },
                    });

            await ImageUtils.copyImageTo(
                        `${ProjectParams.DIR.TILESETS}/${_tileset.imageFile.name}`,
                        normalizedPath,
                        `${ProjectParams.DIR.TILESETS}`,
                        _tileset.imageFile.name
                    );

            // 3. Instancia o ProjectModel e cria a estrutura padrão de Mundos/Cenas
            session.project = new ProjectModel({
                settings: {
                    projectName: projectName,
                    grid: {
                        default: { columns: 20, rows: 20 }
                    }
                }
            });


            const _worldManifest = session.project.worlds[0];
            const _sceneManifest = _worldManifest.scenes[0];

            // 5. Salva o arquivo project.json no disco
            await window.electronAPI.saveJsonFile(`${normalizedPath}/${ProjectParams.PROJECT_MANIFEST_FILE}`, session.project.toJSON());

            // 6. Cria e salva o arquivo de dados da cena inicial no disco
            const sceneModel = new SceneModel({
                id: _sceneManifest.id,
                worldId: _worldManifest.id,
                name: `Scene${_sceneManifest.id}`,
                fileName: `W${_worldManifest.id}S${_sceneManifest.id}.json`,
                columns: _sceneManifest.columns || 20,
                rows: _sceneManifest.rows || 15,
                tile: { width: 32, height: 32 },
                orientation: SceneOrientationEnum.ORTHOGONAL,
                renderorder: SceneRenderOrderEnum.RIGHT_DOWN,
                tilesets: [_tileset],
                backgroundLayers: [{ id: 0, name: 'Background 1', visible: true, opacity: 1, columns: 20, rows: 15, data: new Array(20 * 15).fill(0) }],
                tileLayers: [{ id: 0, name: 'Scene 1', visible: true, opacity: 1, columns: 20, rows: 15, data: new Array(20 * 15).fill(0) }],
                eventLayers: [{ id: 0, name: 'Event Layer 1', visible: true, opacity: 1, columns: 20, rows: 15}],
                terrainLayers: [{ id: 0, name: 'Terrain Layer 1', visible: true, opacity: 1, columns: 20, rows: 15, data: new Array(20 * 15).fill(0) }]
            });

            const jsonScene = JsonUtils.stringifyWithCompactArrays(sceneModel.toJSON());

            await window.electronAPI.saveTextFile(
                `${normalizedPath}/${ProjectParams.DIR.SCENES}/W${_worldManifest.id}S${_sceneManifest.id}.json`, 
                jsonScene
            );

            // 7. Popula o cache global da sessão com a cena inicial (guardando a referência do worldId) e define a navegação na raiz
            if (!session.workingScenes) {
                session.workingScenes = new SceneState();
            }

            session.workingScenes.setScene(_worldManifest.id, _sceneManifest.id, {
                worldId: _worldManifest.id, // Referência limpa de qual mundo essa cena pertence
                sceneId: _sceneManifest.id,
                data: sceneModel,
                fileName: sceneModel.fileName,
                isModified: false,
                isDeleted: false
            });

            // Ponteiros de navegação atualizados para a raiz da sessão
            session.navigation.activeWorldId = _worldManifest.id;
            session.navigation.activeSceneId = _sceneManifest.id;

            console.log("[ProjectService] Projeto criado e estruturado com sucesso no disco!");

            return {
                success: true,
                message: "Projeto criado com sucesso.",
                data: {
                    project: session.project,
                    rootPath: normalizedPath
                }
            };

        }catch(error){
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

            const jsonFilePath = `${normalizedPath}/${ProjectParams.PROJECT_MANIFEST_FILE}`;
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
            session.navigation.activeSceneId = session.project.activeSceneId || 1; // A cena ativa pode ser carregada sob demanda ou se houver padrão

            /*session.workingScenes.setScene(session.project.activeSceneId, {
                worldId: defaultWorld.id, // Referência limpa de qual mundo essa cena pertence
                data: initialMapModel,
                fileName: defaultScene.fileName,
                isModified: false,
                isDeleted: false
            });*/
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

   async saveProject(session) {
        try {
            if (!session || !session.project || !session.rootPath) {
                return {
                    success: false,
                    message: "Nenhum projeto aberto ou com caminho definido para salvar.",
                    data: null
                };
            }

            console.log("[ProjectService] Salvando projeto em:", session.rootPath);

            // 1. Salva o arquivo principal project.json
            const projectJsonData = typeof session.project.toJSON === 'function' 
                ? session.project.toJSON() 
                : session.project;
                
            const projectFilePath = `${session.rootPath}/${ProjectParams.PROJECT_MANIFEST_FILE}`;
            
            const saveProjectResult = await window.electronAPI.saveJsonFile(projectFilePath, projectJsonData);
            
            if (saveProjectResult && saveProjectResult.success === false) {
                throw new Error(saveProjectResult.message || "Falha ao salvar o arquivo project.json");
            }

            // 2. Salva todas as cenas modificadas no workingScenes
            if (session.workingScenes && typeof session.workingScenes.getModifiedScenes === 'function') {
                const modifiedScenes = session.workingScenes.getModifiedScenes() || [];

                console.log(`[ProjectService] Cenas modificadas encontradas para salvar: ${modifiedScenes.length}`);

                for (const sceneEntry of modifiedScenes) {
                    const { worldId, sceneId, fileName, data } = sceneEntry;
                    
                    if (!fileName) {
                        console.warn(`[ProjectService] Cena ID ${sceneId} (Mundo ${worldId}) marcada como modificada, mas não possui fileName.`);
                        continue;
                    }

                    const sceneFilePath = `${session.rootPath}/${ProjectParams.DIR.SCENES}/${fileName}`;
            
                    const sceneDataObj = data && typeof data.toJSON === 'function' ? data.toJSON() : data;
                    
                    // Proteção extra caso o JsonUtils não esteja no escopo global deste arquivo
                    const sceneJsonString = typeof JsonUtils !== 'undefined' && typeof JsonUtils.stringifyWithCompactArrays === 'function'
                        ? JsonUtils.stringifyWithCompactArrays(sceneDataObj, ["data"])
                        : JSON.stringify(sceneDataObj);

                    const saveSceneResult = await window.electronAPI.saveTextFile(sceneFilePath, sceneJsonString);
                    
                    if (saveSceneResult && saveSceneResult.success === false) {
                        throw new Error(`Falha ao salvar o arquivo de cena ${fileName}: ${saveSceneResult.message}`);
                    }

                    // Reseta a flag de modificação da cena individual no cache
                    const originalEntry = session.workingScenes.getScene(worldId, sceneId);
                    if (originalEntry) {
                        originalEntry.isModified = false;
                    }
                    
                    console.log(`[ProjectService] Cena ${fileName} salva com sucesso.`);
                }
            }

            // 3. APLICA A REGRA DE OURO COM BLINDAGEM: Descarrega tudo e mantém apenas a cena corrente
            const activeWorldId = session.navigation?.activeWorldId;
            const activeSceneId = session.navigation?.activeSceneId;

            if (activeWorldId !== undefined && activeWorldId !== null && 
                activeSceneId !== undefined && activeSceneId !== null && 
                session.workingScenes && typeof session.workingScenes.keepOnly === 'function') {
                
                console.log(`[ProjectService] Limpando cache pós-save. Mantendo apenas a cena ativa (W:${activeWorldId}, S:${activeSceneId})...`);
                session.workingScenes.keepOnly(activeWorldId, activeSceneId);
            } else {
                console.warn("[ProjectService] Impossível aplicar keepOnly pós-save: ponteiros de navegação ativos ou workingScenes inválidos.");
            }

            // 4. Reseta a flag geral da sessão
            session.isModified = false;

            return {
                success: true,
                message: "Projeto salvo e memória otimizada com sucesso.",
                data: null
            };

        } catch (error) {
            console.error("[ProjectService] Erro crítico ao salvar projeto:", error);
            return {
                success: false,
                message: `Erro ao salvar o projeto: ${error.message}`,
                data: null
            };
        }
    }

    
}