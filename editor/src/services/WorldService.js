import {ProjectParams} from "../constants/ProjectParams";
import SceneModel from "../models/Scene/SceneModel";
import SceneState from "../core/SceneState";


export default class WorldService {
    constructor() {
        // Serviço stateless: não armazena listas de mapas ou estado interno.
    }


    createWorld(session, worldName = null) {
        try {
            // 1. Garante que o array de mundos existe no projeto
            if (!session.project.worlds) {
                session.project.worlds = [];
            }

            const worlds = session.project.worlds;

            // 2. Calcula o ID e o nome do novo mundo de forma automática
            const newId = worlds.length > 0 ? Math.max(...worlds.map(w => w.id || 0)) + 1 : 1;
            const name = worldName || `World${newId}`;

            // 3. Monta a estrutura padrão do objeto World (com seu array de cenas vazio)
            const newWorldData = {
                id: newId,
                name: name,
                //folder: folderName,
                scenes: [], // Cada mundo já nasce com sua própria lista de cenas vazia!
                metadata: {
                    description: "",
                    properties:{}
                }
            };

            // 1. Adiciona o mundo na lista
            worlds.push(newWorldData);

            // 2. Define o mundo como ativo PRIMEIRO para o createScene achar ele
            session.navigation.activeWorldId = newId;

            // 3. Agora cria a cena inicial vinculada a este mundo ativo
            const sceneResult = this.createScene(session);
        
            if (sceneResult.success) {
                session.navigation.activeSceneId = sceneResult.data.id;
            }

            session.isModified = true;

            console.log(`[WorldService] Novo mundo criado com sucesso: ${name} (ID: ${newId})`);
            console.log(worlds);

            return {
                success: true,
                message: "Mundo criado com sucesso no service.",
                data: newWorldData
            };

        } catch (error) {
            console.error("[WorldService] Erro ao criar novo mundo:", error);
            return {
                success: false,
                message: `Erro interno no service ao criar mundo: ${error.message}`,
                data: null
            };
        }
    }

    /**
     * Define um mundo como ativo na sessão do projeto.
     * @param {Object} session - A sessão atual do projeto
     * @param {number|string} worldId - ID do mundo a ser ativado
     * @returns {Object} Resultado da operação com sucesso e dados do mundo
     */
    async setActiveWorld(session, worldId) {
        if (!session || !session.project) {
            return {
                success: false,
                message: "Nenhum projeto ou sessão ativa encontrada.",
                data: null
            };
        }

        // 1. Busca o mundo no projeto
        const world = session.project.getWorldById(worldId);

        if (!world) {
            return {
                success: false,
                message: `Mundo ${worldId} não encontrado no projeto.`,
                data: null
            };
        }

        // 2. Atualiza o ponteiro de mundo ativo na navegação da sessão
        session.navigation.activeWorldId = worldId;

        // Opcional inteligente: Se o mundo mudou e a cena ativa atual não pertence a este mundo,
        // podemos opcionalmente selecionar a primeira cena deste novo mundo por padrão (ou deixar null).
        // Vamos manter seguro: se o mundo não tiver a cena ativa atual, podemos resetar ou manter.
        const currentSceneId = session.navigation.activeSceneId;
        const hasSceneInNewWorld = world.scenes.some(s => s.id === currentSceneId);

        if (!hasSceneInNewWorld && world.scenes.length > 0) {
            // Opcionalmente seleciona a primeira cena do novo mundo para evitar conflitos visuais
            // session.navigation.activeSceneId = world.scenes[0].id;
        }

        console.log(`[WorldService] Mundo ${worldId} (${world.name}) ativado com sucesso.`);

        return {
            success: true,
            message: "Mundo ativado com sucesso.",
            data: world
        };
    }

    createScene(session, columns = 20, rows = 15) {
        try {
            const activeWorldId = session.navigation?.activeWorldId;
            if (activeWorldId === null || activeWorldId === undefined) {
                return {
                    success: false,
                    message: "Nenhum mundo ativo selecionado para criar a cena.",
                    data: null
                };
            }

            // Busca o mundo ativo na árvore de dados do projeto
            const world = session.project.getWorldById(activeWorldId);
            if (!world) {
                return {
                    success: false,
                    message: `Mundo com ID ${activeWorldId} não foi encontrado no projeto.`,
                    data: null
                };
            }

            if (!world.scenes) {
                world.scenes = [];
            }

            // Calcula o ID com base nas cenas do mundo ativo
            const newId = world.scenes.length > 0 ? Math.max(...world.scenes.map(m => m.id)) + 1 : 1;
            const newName = `Scene${newId}`;
            const newFileName = `W${world.id}S${newId}.json`;

            const newSceneMeta = {
                id: newId,
                worldId: world.id,
                type: "scene",
                name: newName,
                fileName: newFileName,
                columns: columns,
                rows: rows
            };

            // Adiciona na lista de metadados de cenas do mundo
            world.scenes.push(newSceneMeta);

            const default_tileset = 'TTD1'; // Mantendo o mesmo padrão de tileset
            const defaultRawMap = {
                id: newId,
                worldId: world.id,
                name: newName,
                columns: columns,
                rows: rows,
                tile: { width: ProjectParams.TILE_SIZE, height: ProjectParams.TILE_SIZE },
                orientation: ProjectParams.MAP_ORIENTATION,
                renderorder: ProjectParams.MAP_RENDER_ORDER,

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

                backgroundLayers: [{ id: 0, name: 'Background 1', visible: true, opacity: 1, columns: columns, rows: rows, data: new Array(columns * rows).fill(0) }],
                tileLayers: [{ id: 0, name: 'Tile Layer 1', visible: true, opacity: 1, columns: columns, rows: rows, data: new Array(columns * rows).fill(0) }],
                eventLayers: [{ id: 0, name: 'Event Layer 1', visible: true, opacity: 1, columns: columns, rows: rows, data: new Array(columns * rows).fill(0) }],
                terrainLayers: [{ id: 0, name: 'Terrain Layer 1', visible: true, opacity: 1, columns: columns, rows: rows, data: new Array(columns * rows).fill(0) }]
            };

            // Instancia o novo modelo
            const newSceneModel = new SceneModel(defaultRawMap);

            // Garante que o workingScenes existe na session
            if (!session.workingScenes) {
                session.workingScenes = new SceneState();
            }

            session.workingScenes.setScene(world.id, newId, {
                worldId: world.id, // Referência limpa de qual mundo essa cena pertence
                data: newSceneModel,
                fileName: newFileName,
                isModified: true,
                isDeleted: false
            });

            // Atualiza os ponteiros de navegação e flag de modificação
            session.navigation.activeSceneId = newId;
            session.isModified = true;

            console.log(`[worldService] Nova cena criada em cache: ${newName} no mundo ID ${activeWorldId}`);
            
            return {
                success: true,
                message: "Cena criada com sucesso no service.",
                data: newSceneModel
            };

        } catch (error) {
            console.error("[worldService] Erro ao criar nova cena:", error);
            return {
                success: false,
                message: `Erro interno no service ao criar cena: ${error.message}`,
                data: null
            };
        }
    }
    /**
    * Marca uma cena como deletada apenas no cache da sessão.
    * A cena some da interface, mas seus dados e o ProjectModel 
    * permanecem intactos até que o projeto seja salvo de fato.
    */
    deleteScene(session, sceneId) {
        try {
            const activeWorldId = session.navigation?.activeWorldId;
            if (activeWorldId === null || activeWorldId === undefined) {
                return {
                    success: false,
                    message: "Nenhum mundo ativo selecionado para deletar a cena.",
                    data: null
                };
            }

            const world = session.project.getWorldById(activeWorldId);
            if (!world || !world.scenes) {
                return {
                    success: false,
                    message: "Mundo ativo não encontrado ou sem cenas.",
                    data: null
                };
            }

            // Verifica se a cena realmente existe no projeto
            const sceneExists = session.project.getSceneById(sceneId);
            if (!sceneExists) {
                return {
                    success: false,
                    message: `Scene ID ${sceneId} não encontrada no projeto.`,
                    data: null
                };
            }

            // Garante que o Map de workingScenes existe
            if (!session.workingScenes) {
                session.workingScenes = new SceneState();
            }

            // Marca como deletada APENAS no cache da sessão (mantém o ProjectModel intacto até o Save)
            let cachedScene = session.workingScenes.getScene(sceneId);
            if (cachedScene) {
                cachedScene.isDeleted = true;
                cachedScene.isModified = true;
            } else {
                // Se a cena não estava carregada no cache, injetamos ela lá só com a flag de deleção
                session.workingScenes.setScene(world.id, sceneId, {
                    worldId: world.id,
                    sceneId: sceneId,
                    fileName: sceneExists.fileName,
                    data: null,
                    isDeleted: true,
                    isModified: true,
                    
                });
            }

            // Se a cena deletada era a ativa, limpa a seleção da navegação
            if (session.navigation.activeSceneId === sceneId) {
                session.navigation.activeSceneId = null;
            }

            // Marca o projeto como modificado para acionar o botão de salvar
            session.isModified = true;

            console.log(`[worldService] Cena ID ${sceneId} marcada para exclusão no cache.`);
            
            return {
                success: true,
                message: "Cena marcada para exclusão com sucesso.",
                data: { sceneId }
            };

        } catch (error) {
            console.error("[worldService] Erro ao marcar cena para exclusão:", error);
            return {
                success: false,
                message: `Erro interno no service ao deletar cena: ${error.message}`,
                data: null
            };
        }
    }


 
  /**
     * Carrega os dados de uma cena específica do disco (ou do cache da sessão),
     * utilizando o session.rootPath e a nova estrutura do ProjectModel.
     */
    async getScene(session, worldId, sceneId) {
        try {

            // Garante que o Map de workingScenes existe na sessão
            if (!session.workingScenes) {
                session.workingScenes = new SceneState();
            }

            // 1. Verifica se já está no cache da sessão para evitar leitura desnecessária do disco
            const cachedScene = session.workingScenes.getScene(worldId, sceneId);
            console.log("cachedScene");
            console.log(cachedScene);
            if (cachedScene && cachedScene.data) {
                console.log(`[worldService] Cena ID ${sceneId} encontrada no cache.`);
                return {
                    success: true,
                    message: "Cena recuperada do cache com sucesso.",
                    data: cachedScene.data
                };
            }

            // 2. Busca os metadados da cena no ProjectModel
            const result = session.project.getSceneById(worldId, sceneId);
            console.log("result");
            console.log(result);
            if (!result) {
                return {
                    success: false,
                    message: `Cena ID ${sceneId} não encontrada no mundo ID ${worldId}.`,
                    data: null
                };
            }

            const { scene: sceneMeta } = result;
            console.log(`[worldService] Carregando cena: ${sceneMeta.name} (${sceneMeta.fileName})`);

            // 3. Monta o caminho usando o rootPath da sessão
            const rootPath = session.rootPath;
            if (!rootPath) {
                return {
                    success: false,
                    message: "RootPath da sessão não definido.",
                    data: null
                };
            }

            const fullPath = `${rootPath}/${ProjectParams.DIR.SCENES}/${sceneMeta.fileName}`;
            const fileContent = await window.electronAPI.loadJsonFile(fullPath);

            if (!fileContent) {
                return {
                    success: false,
                    message: `Erro ao ler arquivo do disco para a cena ID ${sceneId}: Conteúdo vazio.`,
                    data: null
                };
            }

            // 4. Instancia o modelo de dados do mapa
            const rawData = fileContent.data ? fileContent.data : fileContent;
            const sceneModel = new SceneModel(rawData);

            // 5. Guarda no cache da sessão para as próximas consultas
            session.workingScenes.setScene(worldId,sceneId, {
                worldId: worldId,
                sceneId: sceneId,
                fileName: sceneMeta.fileName,
                data: sceneModel,
                isModified: false,
                isDeleted: false
            });

            console.log("[worldService] SceneModel instanciado e cacheado com sucesso.");
            return {
                success: true,
                message: "Cena carregada do disco com sucesso.",
                data: sceneModel
            };

        } catch (error) {
            console.error("[worldService] Erro ao carregar a cena do disco:", error);
            return {
                success: false,
                message: `Erro interno no service ao carregar cena: ${error.message}`,
                data: null
            };
        }
    }


    async setActiveScene(session, worldId, sceneId) {
        // 1. Descobre qual é o arquivo da cena no manifesto do projeto
        const world = session.project.getWorldById(worldId);
        const sceneManifest = world?.scenes.find(s => s.id === sceneId);

        if (!sceneManifest) {
            return {
                success: false,
                message: `Manifesto da cena ${sceneId} não encontrado no mundo ${worldId}`,
                data: null
            };
        }

        // 2. Verifica se a cena já está carregada no cache da sessão (workingScenes)
        if (!session.workingScenes.hasScene(worldId, sceneId)) {
            console.log(`[WorldService] Cena ${sceneId} não está na memória. Carregando do disco...`);
        
            const filePath = `${session.rootPath}/${ProjectParams.DIR.SCENES}/${sceneManifest.fileName}`;
            const rawData = await window.electronAPI.loadJsonFile(filePath);

            if (!rawData) {
                return {
                    success: false,
                    message: `Falha ao carregar o arquivo da cena do disco: ${filePath}`,
                    data: null
                };
            }

            // Instancia o Model da Cena estritamente aqui no Service
            const sceneModel = new SceneModel(rawData);

            // Injeta no workingScenes
            session.workingScenes.setScene(worldId, sceneId, {
                worldId: worldId,
                sceneId: sceneId,
                data: sceneModel,
                fileName: sceneManifest.fileName,
                isModified: false,
                isDeleted: false
            });
        } else {
            console.log(`[WorldService] Cena ${sceneId} já está em cache na memória.`);
        }

        return {
            success: true,
            message: "Cena ativada com sucesso.",
            data: session.workingScenes.getScene(worldId, sceneId).data
        };
    }

    
}