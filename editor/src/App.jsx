import React, { useMemo } from 'react';
import TopMenu from './components/TopMenu/TopMenu';
import ModalRoot from './ui/modals/ModalRoot';
import { createProjectHandlers } from './handlers/projectHandlers';

// Instâncias da sua arquitetura (pode estar fora do componente ou via Context)
import ProjectStore from './store/ProjectStore';
import ProjectService from './services/ProjectService';
import SceneService from './services/SceneService';
import ProjectController from './controllers/ProjectController';
import SceneController from './controllers/SceneController';

const projectStore = new ProjectStore();
const projectService = new ProjectService();
const sceneService = new SceneService();
const projectController = new ProjectController(projectStore, projectService);
const sceneController = new SceneController(projectStore, sceneService);

export default function App() {
    
    // Cria os handlers passando as dependências.
    // Usamos useMemo para não recriar essas funções toda vez que a tela renderizar.
    const handlers = useMemo(() => {
        return createProjectHandlers(projectController, sceneController, projectStore);
    }, []);

    return (
        <div className="app-container">
            {/* O TopMenu fica magrinho, só recebendo os eventos! */}
            <ModalRoot />
            <TopMenu 
                onNewProject={handlers.handleNewProject}
                onOpenProject={handlers.handleOpenProject}
                onSaveAs={handlers.handleSaveAs}
                onCloseProject={handlers.handleCloseProject}
                onExit={handlers.handleExit}
            />
            
            <main>
                {/* Aqui vai o canvas, ferramentas, etc. */}
            </main>
        </div>
    );
}