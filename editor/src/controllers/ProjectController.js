

import ProjectStore from '../state/ProjectStore.js';
import ProjectService from '../services/ProjectService.js';
import { EDITOR_EVENTS } from '../state/EventTypes.js';
import { EventHandler } from '../state/EventBus.js';

import { JsonUtils } from '../utils/JsonUtils.js';


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

            // 🎯 O PONTO-CHAVE: Notifica o ecossistema que o projeto foi carregado/criado com sucesso!
            // Assumindo que serviceResult.data traga o objeto do projeto ou que ele esteja na session
            EventHandler.notify(EDITOR_EVENTS.PROJECT_LOADED);

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

            EventHandler.notify(EDITOR_EVENTS.PROJECT_LOADED);

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

        EventHandler.notify(EDITOR_EVENTS.PROJECT_CLOSED);

        console.log("[ProjectController] Projeto fechado com sucesso. Sessão e cache limpos.");
        return true;
    }

    /**
     * Verifica centralmente se existem quaisquer alterações não salvas
     * no projeto (metadados ou cenas abertas em cache).
     */
    hasUnsavedChanges() {

        const session = this.projectStore.getSession();
        // 1. Verifica alterações no projeto geral
        if (session.isModified) {
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
    /**
     * Salva o projeto atual completo no disco (project.json + cenas modificadas no workingScenes).
     */
    async save() {
        try {
            const session = this.projectStore.getSession();

            // Valida se há um projeto ativo e um caminho raiz definido
            if (!session || !session.project || !session.rootPath) {
                return {
                    success: false,
                    message: "Nenhum projeto aberto ou com caminho definido para salvar.",
                    data: null
                };
            }

            console.log("[ProjectController] Salvando projeto em:", session.rootPath);

            // 1. Salva o arquivo principal project.json
            const projectJsonData = session.project.toJSON();
            const projectFilePath = `${session.rootPath}/project.json`;
            
            const saveProjectResult = await window.electronAPI.saveJsonFile(projectFilePath, projectJsonData);
            
            if (saveProjectResult && saveProjectResult.success === false) {
                throw new Error(saveProjectResult.message || "Falha ao salvar o arquivo project.json");
            }


           if (session.workingScenes && typeof session.workingScenes.getModifiedScenes === 'function') {
                const modifiedScenes = session.workingScenes.getModifiedScenes();

                for (const sceneEntry of modifiedScenes) {
                    const { sceneId, fileName, data } = sceneEntry;
                    
                    if (!fileName) {
                        console.warn(`[ProjectController] Cena ID ${sceneId} marcada como modificada, mas não possui fileName.`);
                        continue;
                    }

                    const mapFilePath = `${session.rootPath}/Data/Maps/${fileName}`;
        
                    // 1. Converte o model para objeto plano JSON
                    const mapDataObj = data && typeof data.toJSON === 'function' ? data.toJSON() : data;
        
                    // 2. Aplica o JsonUtils para compactar os arrays (ex: "data": [...]) em uma única linha
                    const mapJsonString = JsonUtils.stringifyWithCompactArrays(mapDataObj, ["data"]);

                    // 3. Salva como texto no disco, preservando a formatação customizada
                    await window.electronAPI.saveTextFile(mapFilePath, mapJsonString);

                    // Localiza a entrada original no cache para resetar a flag
                    const originalEntry = session.workingScenes.getSceneById(sceneId);
                    if (originalEntry) {
                        originalEntry.isModified = false;
                    }
                    
                    console.log(`[ProjectController] Cena ${fileName} salva com sucesso.`);
                }
            }

            // 3. Reseta a flag geral de modificação da sessão
            session.isModified = false;

            // Notifica que o projeto foi salvo (útil para atualizar a UI, sumir com asteriscos de "não salvo", etc.)
            EventHandler.notify(EDITOR_EVENTS.PROJECT_SAVED);

            console.log("[ProjectController] Projeto salvo com sucesso!");
            return {
                success: true,
                message: "Projeto salvo com sucesso.",
                data: null
            };

        } catch (error) {
            console.error("[ProjectController] Erro ao salvar projeto:", error);
            return {
                success: false,
                message: `Erro ao salvar o projeto: ${error.message}`,
                data: null
            };
        }
    }

}