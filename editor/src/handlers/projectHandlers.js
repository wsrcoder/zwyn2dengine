
import { Modal } from "../ui/modals/Modal";
import SceneState from "../state/SceneState";
/**
 * src/handlers/projectHandlers.js
 * 
 * Orquestra as interações da UI com os Controllers do domínio do projeto.
 * Todos os métodos retornam um objeto padronizado: { success, message, data }
 */
export function createProjectHandlers(projectController, worldController, projectStore) {
    
    const handleNewProject = async () => {
        console.log("[Handler] Iniciando fluxo de Novo Projeto...");
    
        try {
            // 1. Abre a nossa janela modal unificada (Nome + Pasta Pai)
            const modalResult = await Modal.createProject();
        
            // Se o usuário fechou ou cancelou
            if (!modalResult || !modalResult.success) {
                return { success: false, message: "Operação cancelada pelo usuário.", data: null };
            }

            const { projectName, parentPath } = modalResult.data;
            const normalizedParent = parentPath.replace(/\\/g, '/');
            const fullProjectPath = `${normalizedParent}/${projectName}`;

            console.log(fullProjectPath);

            // 2. Cria a pasta física no disco via Electron
            const dirResult = await window.electronAPI.createDirectory(fullProjectPath);

            // Descubra o que veio aqui:
            console.log("[Debug] Resposta exata do createDirectory:", dirResult);


            if (!dirResult || !dirResult.success) {
                return { success: false, message: `Erro ao criar pasta: ${dirResult.message}`, data: null };
            }

            // 3. Chama o ProjectController para popular o project.json, cenas e tilesets iniciais
            const createResult = await projectController.create(fullProjectPath, projectName);

            if (!createResult.success) {
                return { success: false, message: createResult.message, data: null };
            }


            console.log("[Handler] Novo projeto criado e estruturado com sucesso!");
            return {
                success: true,
                message: "Projeto criado com sucesso.",
                data: createResult.data
            };

        } catch (error) {
            console.error("[Handler] Erro inesperado ao criar novo projeto:", error);
            return {
                success: false,
                message: error.message || "Erro inesperado ao criar o projeto.",
                data: null
            };
        }
    };

    const handleOpenProject = async () => {
        console.log("[Handler] Iniciando fluxo de Abrir Projeto...");
        
        try {
            const selectedPath = await window.electronAPI.openDirectory(); 
            console.log("selected path: " + selectedPath);
            
            if (selectedPath && projectController) {
                // 1. Controller lê o disco e atualiza a Store
                const openResult = await projectController.open(selectedPath);
            
                if (!openResult.success) {
                    console.error("Erro ao abrir projeto:", openResult.message);
                    return {
                        success: false,
                        message: openResult.message || "Falha ao abrir os arquivos do projeto.",
                        data: null
                    };
                }

                eventBus.notify('projectLoaded', openResult.data);
                console.log("Projeto aberto com sucesso! Orquestrando carregamento da cena...");

                // 2. Handler assume a orquestração: pega os dados da Store e aciona a Cena
                const session = projectStore.getSession();
                const worlds = openResult.data.worlds;

                if (worlds && worlds.length > 0) {
                    const firstWorld = worlds[0];
                    const firstScene = firstWorld.scenes[0];

                    if (!firstScene) {
                        return {
                            success: false,
                            message: "O primeiro mundo não possui nenhuma cena cadastrada.",
                            data: openResult.data
                        };
                    }

                    // Pede para o Controller carregar e fazer parse do arquivo de mapa do disco
                    const sceneResult = await worldController.getSceneById(firstScene.id);

                    if (!sceneResult.success) {
                        console.warn("[Handler] Falha ao carregar o mapa inicial:", sceneResult.message);
                        return {
                            success: false,
                            message: `Projeto aberto, mas falhou ao carregar a cena inicial: ${sceneResult.message}`,
                            data: openResult.data
                        };
                    }

                    // Define os IDs ativos na raiz da session
                    session.navigation.activeWorldId = firstWorld.id;
                    session.navigation.activeSceneId = firstScene.id;

                    // Garante que o Map de workingScenes existe antes de dar o set
                    if (!session.workingScenes) {
                        session.workingScenes = new SceneState();
                    }

                    // Popula o workingScenes utilizando os dados reais retornados pelo sceneResult
                    session.workingScenes.setScene(firstScene.id, {
                        worldId: firstWorld.id, // Referência limpa de qual mundo essa cena pertence
                        data: sceneResult.data, // O MapDataModel parseado do disco
                        fileName: firstScene.fileName,
                        isModified: false,
                        isDeleted: false
                    });

                    console.log("[Handler] Mapa carregado no workingScenes da Store com sucesso!");
                }

                return {
                    success: true,
                    message: "Projeto e cena inicial carregados com sucesso.",
                    data: openResult.data
                };
            }

        } catch (error) {
            console.error("[Handler] Erro inesperado ao abrir projeto:", error);
            return {
                success: false,
                message: error.message || "Erro inesperado ao abrir o projeto.",
                data: null
            };
        }
    };

    const handleSaveAs = async () => {
        console.log("[Handler] Fluxo de Salvar Como chamado.");
        try {
            // Lógica de Salvar Como...
            return {
                success: true,
                message: "Projeto salvo com sucesso.",
                data: null
            };
        } catch (error) {
            console.error("[Handler] Erro ao salvar projeto:", error);
            return {
                success: false,
                message: error.message || "Erro ao salvar o projeto.",
                data: null
            };
        }
    };

    const handleCloseProject = async () => {
        console.log("[Handler] Fluxo de Fechar Projeto chamado.");
        try {
            const session = projectStore.getSession();
            if (session && session.isModified) {
                const confirmExit = await Modal.confirm(
                    "Alterações não salvas", 
                    "Você tem alterações não salvas. Deseja sair sem salvar?"
                );
        
                if (!confirmExit) {
                    return {
                        success: false,
                        message: "Fechamento cancelado pelo usuário.",
                        data: null
                    };
                }
            }

            // Executa o fechamento na store através do controller
            const result = await projectController.close();

            if (!result.success) {
                return {
                    success: false,
                    message: result.message || "Não foi possível fechar o projeto.",
                    data: null
                };
            }

            console.log("[Handler] Projeto fechado com sucesso na store.");
            return {
                success: true,
                message: "Projeto fechado com sucesso.",
                data: null
            };
        } catch (error) {
            console.error("[Handler] Erro ao fechar projeto:", error);
            return {
                success: false,
                message: error.message || "Erro ao fechar o projeto.",
                data: null
            };
        }
    };

    const handleExit = async () => {
        console.log("[Handler] Fluxo de Fechar Engine chamado.");

        // 1. Verifica se há modificações não salvas na sessão atual
        const session = projectStore.getSession();
        if (session && session.isModified) {
            const confirmExit = await Modal.confirm(
                "Alterações não salvas", 
                "Você tem alterações não salvas. Deseja sair sem salvar?"
            );
        
            if (!confirmExit) {
                return {
                    success: false,
                    message: "Saída cancelada pelo usuário.",
                    data: null
                };
            }
        }

        // 2. Se passou pela verificação, despacha o comando para o Electron fechar a janela/app
        if (window.electronAPI && typeof window.electronAPI.quit === 'function') {
            await window.electronAPI.quit();
        } else {
            // Fallback caso esteja rodando em ambiente web puro
            window.close();
        }

        return {
            success: true,
            message: "Saindo da aplicação...",
            data: null
        };
    };

    return {
        handleNewProject,
        handleOpenProject,
        handleSaveAs,
        handleCloseProject,
        handleExit
    };
}