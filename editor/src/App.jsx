import React, { useState, useEffect, useMemo } from 'react';
import TopMenu from './components/TopMenu/TopMenu';
import ModalRoot from './ui/modals/ModalRoot';
import SidePanel from './components/SidePanel/SidePanel';
import { createProjectHandlers } from './handlers/projectHandlers';

// Instâncias da sua arquitetura (pode estar fora do componente ou via Context)
import ProjectStore from './state/ProjectStore';
import ProjectService from './services/ProjectService';
import WorldService from './services/WorldService';
import ProjectController from './controllers/ProjectController';
import WorldController from './controllers/WorldController';

const projectStore = new ProjectStore();
const projectService = new ProjectService();
const worldService = new WorldService();
const projectController = new ProjectController(projectStore, projectService);
const worldController = new WorldController(projectStore, worldService);

export default function App() {

    // Estado global de qual aba está ativa no painel lateral ('maps', 'layers', 'events')
    const [activeTab, setActiveTab] = useState('worlds');
    
    // Cria os handlers passando as dependências.
    // Usamos useMemo para não recriar essas funções toda vez que a tela renderizar.
    const handlers = useMemo(() => {
        return createProjectHandlers(projectController, worldController, projectStore);
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

            <SidePanel 
                projectController={projectController}
                projectStore={projectStore}
                worldController={worldController}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
            
            <main>
                {/* Aqui vai o canvas, ferramentas, etc. */}
            </main>
        </div>
    );
}