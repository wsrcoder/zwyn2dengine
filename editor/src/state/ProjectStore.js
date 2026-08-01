import ProjectModel from '../models/Project/ProjectModel.js';
import SceneState from './SceneState.js'; // Ajuste o caminho se necessário

export default class ProjectStore {
    constructor() {

        // O estado da sessão agora vive aqui dentro, blindado!
        this.session = {
            rootPath: null,
            project: null,
            isModified: false,
            navigation: {
                    activeWorldId: null,
            },
            // 2. O Cache de Cenas é GLOBAL na sessão, mapeando qualquer cena aberta em memória
            // Chave: ID da cena (ou 'W{worldId}S{sceneId}'), Valor: { mapDataModel, fileName, isModified }
            workingScenes: new SceneState(),
           
        };

        this.listeners = new Set();
    }

    /**
     * Retorna a sessão atual inteira (caso algum serviço precise).
     */
    getSession() {
        return this.session;
    }

    /**
     * Reseta ou define uma nova sessão completa (quando um projeto é aberto).
     */
    setSession(newSessionData) {
        this.session = newSessionData;
    }


}