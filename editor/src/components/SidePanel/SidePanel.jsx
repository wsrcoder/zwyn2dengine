import React, { useState, useEffect } from 'react';
import WorldsTab from './WorldsTab/WorldsTab.jsx';
import LayersTab from './LayersTab/LayersTab.jsx';
import { EventHandler } from '../../state/EventBus.js'; // <-- Importa o EventBus global
import { EDITOR_EVENTS } from '../../state/EventTypes.js';
import './SidePanel.css';

export default function SidePanel({ 
    projectController, 
    projectStore, 
    worldController,
    activeTab,
    setActiveTab 
}) {
    const [, setRenderTrigger] = useState(0);

    useEffect(() => {
        const handleRefreshUI = (data) => {
            console.log("[SidePanel] Evento recebido, atualizando painel...", data);
            setRenderTrigger(prev => prev + 1);
        };

        // Inscreve nos eventos específicos que interessam a este painel
        const unsubProject = EventHandler.subscribe(EDITOR_EVENTS.PROJECT_LOADED, handleRefreshUI);
        const unsubSceneChanged = EventHandler.subscribe(EDITOR_EVENTS.SCENE_CHANGED, handleRefreshUI);
        const unsubWorldsList = EventHandler.subscribe(EDITOR_EVENTS.WORLDS_LIST_UPDATED, handleRefreshUI);

        return () => {
            // Limpa as inscrições quando o componente desmontar
            unsubProject();
            unsubSceneChanged();
            unsubWorldsList();
        };
    }, []);

    return (
        <div className="sidebar-left">
            {/* Cabeçalho de Abas da Sidebar Esquerda */}
            <div className="sidebar-tabs-header">
                <button 
                    className={`tab-btn ${activeTab === 'worlds' ? 'active' : ''}`}
                    onClick={() => setActiveTab('worlds')}
                >
                    Mundos
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'layers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('layers')}
                >
                    Camadas
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
                    onClick={() => setActiveTab('events')}
                >
                    Eventos
                </button>
            </div>

            {/* Conteúdo Dinâmico Baseado na Aba Ativa */}
            <div className="sidebar-tab-content">
                {activeTab === 'worlds' && (
                    <WorldsTab 
                        projectController={projectController} 
                        projectStore={projectStore}
                        worldController={worldController}
                    />
                )}

                {activeTab === 'layers' && (
                    <LayersTab 
                        projectController={projectController}
                        projectStore={projectStore}
                    />
                )}
                {activeTab === 'events' && (
                    <EventsTab 
                        projectController={projectController}
                        projectStore={projectStore}
                    />
                )}
            </div>
        </div>
    );
}