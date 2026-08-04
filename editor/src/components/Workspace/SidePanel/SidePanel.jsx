import React, { useState, useEffect } from 'react';
import WorldPanel from './WorldTab/WorldPanel.jsx';
import ScenePanel from './SceneTab/ScenePanel.jsx';
import EventPanel from './EventTab/EventPanel.jsx';
import { EventHandler } from '../../../state/EventBus.js';
import { EDITOR_EVENTS } from '../../../state/EventTypes.js';
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

        const unsubProject = EventHandler.subscribe(EDITOR_EVENTS.PROJECT_LOADED, handleRefreshUI);
        const unsubSceneChanged = EventHandler.subscribe(EDITOR_EVENTS.SCENE_CHANGED, handleRefreshUI);
        const unsubWorldsList = EventHandler.subscribe(EDITOR_EVENTS.WORLDS_LIST_UPDATED, handleRefreshUI);

        return () => {
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
                    World
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'scene' ? 'active' : ''}`}
                    onClick={() => setActiveTab('scene')}
                >
                    Scene
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'terrains' ? 'active' : ''}`}
                    onClick={() => setActiveTab('terrains')}
                >
                    Terrain
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
                    onClick={() => setActiveTab('events')}
                >
                    Event
                </button>
            </div>

            {/* Conteúdo Dinâmico Baseado na Aba Ativa */}
            <div className="sidebar-tab-content">
                {activeTab === 'worlds' && (
                    <WorldPanel 
                        projectController={projectController} 
                        projectStore={projectStore}
                        worldController={worldController}
                    />
                )}

                {activeTab === 'scene' && (
                    <ScenePanel 
                        projectController={projectController}
                        projectStore={projectStore}
                    />
                )}
                
                {activeTab === 'events' && (
                    <EventPanel 
                        projectController={projectController}
                        projectStore={projectStore}
                    />
                )}
            </div>
        </div>
    );
}