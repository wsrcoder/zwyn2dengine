
import ProjectStore from "../store/ProjectStore";
import SceneService from "../services/SceneService";

export default class SceneController {
    constructor(projectStore, sceneService) {
        this.projectStore = projectStore;
        this.sceneService = sceneService;
    }

    async createScene(worldId, columns, rows) {
        try {
            const session = this.projectStore.getSession();

            // O service agora já devolve o nosso contrato!
            const serviceResult = this.sceneService.create(session, columns, rows);

            // Se o service falhou, repassa a mensagem exata de lá
            if (!serviceResult.success) {
                return {
                    success: false,
                    message: serviceResult.message,
                    data: null
                };
            }

            return {
                success: true,
                message: "Cena criada com sucesso.",
                data: serviceResult.data // { meta, mapDataModel }
            };

        } catch (error) {
            return {
                success: false,
                message: `Erro no controller ao criar cena: ${error.message}`,
                data: null
            };
        }
    }

    /**
     * Deleta uma cena chamando o SceneService.
     * @param {string|number} sceneId - ID da cena a ser deletada.
     */
    async deleteScene(sceneId) {
        if (!sceneId) {
            return {
                success: false,
                message: "ID da cena é obrigatório para a exclusão.",
                data: null
            };
        }

        try {
            const session = this.projectStore.getSession();

            // O service agora retorna o nosso contrato padronizado
            const serviceResult = this.sceneService.delete(session, sceneId);

            // Se o service falhou, repassamos a mensagem exata de lá
            if (!serviceResult.success) {
                return {
                    success: false,
                    message: serviceResult.message,
                    data: null
                };
            }

            return {
                success: true,
                message: serviceResult.message, // "Cena marcada para exclusão com sucesso."
                data: serviceResult.data        // { sceneId }
            };

        } catch (error) {
            return {
                success: false,
                message: `Erro no controller ao deletar cena: ${error.message}`,
                data: null
            };
        }
    }

    /**
     * Busca uma cena pelo ID (carregando do disco/cache através do service).
     * @param {string|number} sceneId - ID da cena que deseja buscar.
     */
    async getSceneById(sceneId) {
        if (!sceneId) {
            return {
                success: false,
                message: "ID da cena é obrigatório.",
                data: null
            };
        }

        try {
            const session = this.projectStore.getSession();
            const activeWorldId = session.world.navigation.activeWorldId;

            if (activeWorldId === null) {
                return {
                    success: false,
                    message: "Nenhum mundo ativo selecionado para buscar a cena.",
                    data: null
                };
            }

            // Delega para o service e recebe o objeto de contrato padronizado
            const serviceResult = await this.sceneService.getById(session, activeWorldId, sceneId);

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
                data: serviceResult.data // O MapDataModel
            };

        } catch (error) {
            return {
                success: false,
                message: `Erro no controller ao buscar cena: ${error.message}`,
                data: null
            };
        }
    }



    /**
     * Retorna a cena atualmente ativa na sessão.
     */
    getCurrentScene() {
        try {
            const sceneModel = this.projectStore.getSession()?.world?.scenes?.getActiveScene() || null;

            if (!sceneModel) {
                return {
                    success: false,
                    message: "Nenhuma cena ativa no momento.",
                    data: null
                };
            }

            return {
                success: true,
                message: "Cena ativa recuperada com sucesso.",
                data: sceneModel
            };
        } catch (error) {
            return {
                success: false,
                message: `Erro ao buscar cena ativa: ${error.message}`,
                data: null
            };
        }
    }

    /**
     * Define uma nova cena como ativa, carregando-a via service e atualizando a store.
     */
    async setCurrentScene(worldId, sceneId) {
        if (!worldId || !sceneId) {
            return {
                success: false,
                message: "IDs de mundo ou cena inválidos.",
                data: null
            };
        }

        try {
            const session = this.projectStore.getSession();

            // 1. Usa o SceneService para buscar a cena no disco/cache
            const sceneModel = await this.sceneService.getById(session, worldId, sceneId);

            if (!sceneModel) {
                return {
                    success: false,
                    message: `Cena com ID ${sceneId} não foi encontrada.`,
                    data: null
                };
            }

            // 2. Atualiza os ponteiros de navegação diretamente na Store
            session.world.navigation.activeWorldId = worldId;
            session.world.navigation.activeSceneId = sceneId;
            session.isModified = true; // Marca que o estado mudou

            return {
                success: true,
                message: "Cena ativa alterada com sucesso.",
                data: sceneModel
            };

        } catch (error) {
            return {
                success: false,
                message: `Erro interno ao definir cena atual: ${error.message}`,
                data: null
            };
        }
    }


    async updateSceneName(sceneId, newName) {
        if (!newName || !newName.trim()) {
            return {
                success: false,
                message: "O novo nome da cena não pode ser vazio.",
                data: null
            };
        }

        try {
            const session = this.projectStore.getSession();
            const activeWorldId = session.world.navigation.activeWorldId;

            if (activeWorldId === null) {
                return {
                    success: false,
                    message: "Nenhum mundo ativo selecionado.",
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

            // 1. Atualiza nos metadados do ProjectModel
            const sceneMeta = world.scenes.find(s => s.id === sceneId);
            if (!sceneMeta) {
                return {
                    success: false,
                    message: `Cena ID ${sceneId} não encontrada.`,
                    data: null
                };
            }

            sceneMeta.name = newName;

            // 2. Atualiza no Cache da Sessão, caso a cena já esteja carregada
            const cachedScene = session.world.scenes.cache.get(sceneId);
            if (cachedScene && cachedScene.mapDataModel) {
                cachedScene.mapDataModel.name = newName;
                cachedScene.isModified = true;
            }

            // 3. Marca o projeto como modificado
            session.isModified = true;

            return {
                success: true,
                message: "Cena renomeada com sucesso.",
                data: { sceneId, newName }
            };

        } catch (error) {
            return {
                success: false,
                message: `Erro ao alterar nome da cena: ${error.message}`,
                data: null
            };
        }
    }
}