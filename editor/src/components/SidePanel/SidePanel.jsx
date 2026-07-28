
import React, { useState, useEffect } from 'react';
import WorldsTab from './WorldsTab/WorldsTab.jsx';
import LayersTab from './LayersTab/LayersTab.jsx';
import './SidePanel.css';

export default function SidePanel({ 
    projectController, 
    uiController, 
    onSelectMap,
    activeTab,
    setActiveTab 
}) {
    const [, setRenderTrigger] = useState(0); // Estado gatilho para forçar o React a re-renderizar

    useEffect(() => {
        if (!uiController) return;

        const handleRefreshUI = () => {
            console.log("[SidePanel] Atualizando painel...");
            setRenderTrigger(prev => prev + 1); // Força um novo ciclo de renderização
        };

        // Escuta os eventos globais do editor
        const unsubProject = uiController.subscribe('projectLoaded', handleRefreshUI);
        const unsubMapChanged = uiController.subscribe('mapChanged', handleRefreshUI);
        const unsubMapsList = uiController.subscribe('mapsListUpdated', handleRefreshUI);

        return () => {
            unsubProject();
            unsubMapChanged();
            unsubMapsList();
        };
    }, [uiController]);

    return (
        <div className="sidebar-left">
            {/* Cabeçalho de Abas da Sidebar Esquerda */}
            <div className="sidebar-tabs-header">
                <button 
                    className={`tab-btn ${activeTab === 'maps' ? 'active' : ''}`}
                    onClick={() => setActiveTab('maps')}
                >
                    Mundos
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'layers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('layers')}
                >
                    Camadas
                </button>
            </div>

            {/* Conteúdo Dinâmico Baseado na Aba Ativa */}
            <div className="sidebar-tab-content">
                {activeTab === 'maps' && (
                    <WorldsTab 
                        projectController={projectController} 
                        uiController={uiController}
                        onSelectMap={onSelectMap} 
                    />
                )}

                {activeTab === 'layers' && (
                    <LayersTab 
                        projectController={projectController}
                        uiController={uiController}
                    />
                )}
            </div>
        </div>
    );
}