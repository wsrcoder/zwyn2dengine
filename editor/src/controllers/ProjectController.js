

import ProjectStore from '../store/ProjectStore.js';
import ProjectService from '../services/ProjectService.js';

export default class ProjectController {
    constructor(projectStore, projectService) {
        this.projectStore = projectStore;
        this.projectService = projectService;
    }

    /**
     * Cria um novo projeto do zero, estruturando pastas, gerando o mundo/cena inicial
     * e populando o estado da sessão de forma limpa.
     */
    async create(projectRootPath, projectName) {
        if (!projectRootPath || !projectName) {
            return {
                success: false,
                message: "Caminho e nome do projeto são obrigatórios.",
                data: null
            };
        }

        try {
            // Pega a sessão atual da store
            const session = this.projectStore.getSession();

            // Delega a criação pesada para o projectService
            const serviceResult = await this.projectService.create(session, projectRootPath, projectName);

            if (!serviceResult.success) {
                return {
                    success: false,
                    message: serviceResult.message,
                    data: null
                };
            }

            return {
                success: true,
                message: serviceResult.message,
                data: serviceResult.data
            };

        } catch (error) {
            return {
                success: false,
                message: `Erro no controller ao criar projeto: ${error.message}`,
                data: null
            };
        }
    }

   /**
     * Abre o arquivo project.json e carrega a estrutura de mundos e cenas na sessão.
     * @param {string} projectPath - Caminho raiz do projeto.
     */
    async open(projectPath) {
        if (!projectPath) {
            return {
                success: false,
                message: "O caminho do projeto é obrigatório.",
                data: null
            };
        }

        try {
            const session = this.projectStore.getSession();

            // Delega para o service ler o project.json e montar a estrutura na sessão
            const serviceResult = await this.projectService.open(session, projectPath);

            if (!serviceResult.success) {
                return {
                    success: false,
                    message: serviceResult.message,
                    data: null
                };
            }

            return {
                success: true,
                message: serviceResult.message,
                data: {
                    project: session.project,
                    worlds: session.project.getAllWorlds() // Devolve a lista para quem chamou saber o que carregar
                }
            };

        } catch (error) {
            return {
                success: false,
                message: `Erro no controller ao abrir projeto: ${error.message}`,
                data: null
            };
        }
    }

   /**
     * Fecha o projeto atual, verificando se há alterações pendentes
     * e resetando completamente o estado da sessão.
     */
    async close() {
        console.log("[ProjectController] Fechando o projeto atual...");

        // Verifica de forma centralizada se há qualquer alteração pendente
        if (this.hasUnsavedChanges()) {
            console.warn("[ProjectController] Existem alterações não salvas no projeto ou em cenas abertas.");
            // Futuramente: abrir modal de confirmação (Salvar / Descartar / Cancelar)
        }

        // Reseta totalmente a sessão para o estado inicial/vazio
        this.session.rootPath = null;
        this.session.project = new ProjectModel();
        this.session.isModified = false;

        this.session.world.navigation.activeWorldId = null;
        this.session.world.navigation.activeSceneId = null;
        this.session.world.scenes.cache.clear();

        console.log("[ProjectController] Projeto fechado com sucesso. Sessão e cache limpos.");
        return true;
    }

    /**
     * Verifica centralmente se existem quaisquer alterações não salvas
     * no projeto (metadados ou cenas abertas em cache).
     */
    hasUnsavedChanges() {
        // 1. Verifica alterações no projeto geral
        if (this.session.isModified) {
            return true;
        }

        // 2. Delega para o ScenesState verificar se há cenas modificadas no cache
        if (this.session.world && this.session.world.scenes) {
            return this.session.world.scenes.hasModifiedScenes();
        }

        return false;
    }

    
    // TODO: Atualizar o fluxo de modificações para garantir que o cache seja 
    // devidamente atualizado e marcado como modificado (isModified = true) quando:
    // 1. Um mapa existente sofrer alterações (tiles, eventos, etc.).
    // 2. Um novo mapa for criado (ele já deve ser inserido diretamente no cache).
    // 3. Uma nova camada for adicionada a um mapa.
    // Ajustar essa sincronização à medida que o editor continuar evoluindo.

/**
     * Salva o projeto completo no disco: atualiza o project.json e todas as
     * cenas modificadas que estão presentes no cache de sessão.
     */
    async save() {
        if (!this.session.rootPath || !this.session.project) {
            console.error("[ProjectController] Nenhum projeto aberto para salvar.");
            return false;
        }

        try {
            console.log("[ProjectController] Salvando projeto...");
            const rootPath = this.session.rootPath;

            // 1. Salva o arquivo principal project.json
            await window.electronAPI.saveJsonFile(
                `${rootPath}/project.json`, 
                this.session.project.toJSON()
            );

            // 2. Percorre o cache de cenas da sessão para salvar as modificadas
            const scenesState = this.session.world.scenes;
            
            for (const [sceneId, cacheEntry] of scenesState.cache.entries()) {
                if (cacheEntry.isModified) {
                    // Busca os metadados da cena (incluindo o fileName correto) através do ProjectModel
                    const sceneDetails = this.session.project.getAllScenes().find(s => s.id === sceneId);
                    
                    if (!sceneDetails || !sceneDetails.fileName) {
                        console.error(`[ProjectController] Não foi possível encontrar o fileName para a cena ID ${sceneId}.`);
                        continue;
                    }

                    const mapFilePath = `${rootPath}/Data/Maps/${sceneDetails.fileName}`;
                    const mapJsonString = JsonUtils.stringifyWithCompactArrays(cacheEntry.mapDataModel.toJSON());
                    
                    await window.electronAPI.saveTextFile(mapFilePath, mapJsonString);
                    
                    // Reseta a flag de modificação da cena após salvar com sucesso
                    cacheEntry.isModified = false;
                    console.log(`[ProjectController] Cena ${sceneDetails.fileName} salva.`);
                }
            }

            // 3. Otimização de Memória: limpa o cache e mantém APENAS a cena ativa atual
            const activeSceneId = scenesState.activeSceneId;
            const activeCacheEntry = activeSceneId ? scenesState.cache.get(activeSceneId) : null;

            scenesState.cache.clear();

            if (activeCacheEntry && activeSceneId) {
                scenesState.cache.set(activeSceneId, {
                    mapDataModel: activeCacheEntry.mapDataModel,
                    isModified: activeCacheEntry.isModified,
                    isDeleted: false
                });
            }

            this.session.isModified = false;
            console.log("[ProjectController] Projeto salvo e cache otimizado com sucesso!");
            return true;

        } catch (error) {
            console.error("[ProjectController] Erro crítico ao salvar o projeto:", error);
            return false;
        }
    }

}