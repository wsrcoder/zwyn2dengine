
import { Modal } from "../ui/modals/Modal";
import { eventBus } from "../state/EventBus";
/**
 * src/handlers/projectHandlers.js
 * 
 * Orquestra as interações da UI com os Controllers do domínio do projeto.
 * Todos os métodos retornam um objeto padronizado: { success, message, data }
 */
export function createProjectHandlers(projectController, sceneController, projectStore) {
    
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
            // 1. Simulação: Aqui você chamaria o Electron para abrir a janela de seleção de pasta
            // const projectPath = await window.electronAPI.showOpenDialog();
            // if (!projectPath) return { success: false, message: "Usuário cancelou a operação.", data: null };


            const selectedPath = await window.electronAPI.openDirectory(); 
            console.log("selected path: " + selectedPath);
            if (selectedPath && projectController) {
                
                // 2. Controller faz o trabalho dele: lê o disco e atualiza a Store
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
            

            

                // 3. Handler assume a orquestração: pega os dados da Store e aciona a Cena
                const session = projectStore.getSession();
                const worlds = openResult.data.worlds;

                if (worlds && worlds.length > 0) {
                    const firstWorld = worlds[0];
                
                    // Define o mundo ativo
                    session.world.navigation.activeWorldId = firstWorld.id;

                    const scenes = session.project.getAllScenes(firstWorld.id);
                    if (scenes && scenes.length > 0) {
                        const firstScene = scenes[0];
                    
                        // Pede para o SceneController carregar e fazer parse do arquivo de mapa
                        const sceneResult = await sceneController.getSceneById(firstScene.id);

                        if (!sceneResult.success) {
                            console.warn("[Handler] Falha ao carregar o mapa inicial:", sceneResult.message);
                            return {
                                success: false,
                                message: `Projeto aberto, mas falhou ao carregar a cena inicial: ${sceneResult.message}`,
                                data: openResult.data
                            };
                        }

                        console.log("[Handler] Mapa carregado no cache da Store com sucesso!");
                    }
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
            // Lógica para fechar projeto atual e limpar store
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