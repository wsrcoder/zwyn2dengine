import ProjectModel from '../models/Project/ProjectModel.js';
import SceneState from '../models/Project/SceneState.js'; // Ajuste o caminho se necessário

export default class ProjectStore {
    constructor(sceneService) {
        this.sceneService = sceneService;

        // O estado da sessão agora vive aqui dentro, blindado!
        this.session = {
            rootPath: null,
            project: new ProjectModel(),
            isModified: false,

            world: {
                navigation: {
                    activeWorldId: null,
                    activeSceneId: null
                },
                scenes: new SceneState(),
            }            
        };
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