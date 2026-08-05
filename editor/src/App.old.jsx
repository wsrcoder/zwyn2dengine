

import React, { useState, useMemo } from 'react';
import TopMenuContainer from './components/TopMenu/TopMenuContainer';
import ModalRoot from './ui/modals/ModalRoot';
import SidePanel from './components/Workspace/SidePanel/SidePanel';
import { createProjectHandlers } from './handlers/projectHandlers';

// Importando o WorkspaceEditor limpo
import WorkspaceEditor from './components/workspace/WorkspaceEditor';

// Instâncias da sua arquitetura
import ProjectStore from './core/ProjectStore';
import ProjectController from './controllers/ProjectController';
import WorldController from './controllers/WorldController';

import './App.css';

const projectStore = new ProjectStore();
const projectController = new ProjectController(projectStore);
const worldController = new WorldController(projectStore);

export default function App() {
    // Estado global de qual aba está ativa no painel lateral
    const [activeTab, setActiveTab] = useState('worlds');

    // === ESTADO GLOBAL DO WORKSPACE (Abas abertas) ===
    const [workspaceTabs, setWorkspaceTabs] = useState([
        { 
            id: 'default-scene-editor', 
            type: 'scene', 
            title: 'Scene Editor', 
            data: { isDefault: true } 
        }
    ]);
    const [activeWorkspaceTabId, setActiveWorkspaceTabId] = useState('default-scene-editor');

    // Função global para abrir novas abas de qualquer lugar do app
    const openWorkspaceTab = (tabConfig) => {
        const { id } = tabConfig;
        if (workspaceTabs.some(tab => tab.id === id)) {
            setActiveWorkspaceTabId(id);
            return;
        }
        setWorkspaceTabs(prev => [...prev, tabConfig]);
        setActiveWorkspaceTabId(id);
    };

    // Função para fechar abas
    const closeWorkspaceTab = (id) => {
        const newTabs = workspaceTabs.filter(tab => tab.id !== id);
        setWorkspaceTabs(newTabs);

        if (activeWorkspaceTabId === id && newTabs.length > 0) {
            setActiveWorkspaceTabId(newTabs[newTabs.length - 1].id);
        }
    };

    // Cria os handlers passando as dependências
    const handlers = useMemo(() => {
        return createProjectHandlers(projectController, worldController, projectStore);
    }, []);

    return (
        <div className="app-container">
            <ModalRoot />
            <TopMenuContainer 
                projectStore={projectStore} 
                handlers={handlers} 
            />

            <div className="main-content">
                <SidePanel 
                    projectController={projectController}
                    projectStore={projectStore}
                    worldController={worldController}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    // Se no futuro quiser passar o openWorkspaceTab para a sidebar poder abrir abas, basta incluir aqui!
                />
            
                <main className="workspace-main-container">
                    <WorkspaceEditor
                        tabs={workspaceTabs}
                        activeTabId={activeWorkspaceTabId}
                        onTabChange={setActiveWorkspaceTabId}
                        onCloseTab={closeWorkspaceTab}
                        projectStore={projectStore}
                    />
                </main>
            </div>
        </div>
    );
}