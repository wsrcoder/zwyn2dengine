import React, { useState, useEffect } from 'react';
import WorldsTab from './WorldsTab/WorldsTab.jsx';
import { LayerType } from '../../Constants/LayerType.js';
import { LayerBucketMap } from '../../Constants/LayerBucketMap.js';
import './SidePanel.css';

export default function SidePanel({ 
    projectController, 
    uiController, 
    onSelectMap,
    activeTab,
    setActiveTab 
}) {
    const [expandedLayers, setExpandedLayers] = useState(true);
    const [, setRenderTrigger] = useState(0); // Estado gatilho para forçar o React a re-renderizar

    useEffect(() => {
        if (!uiController) return;

        const handleRefreshUI = () => {
            console.log("[SidebarLeft] Atualizando painel de camadas e mapas...");
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

    const currentMap = projectController?.getCurrentMap ? projectController.getCurrentMap() : null;
    const activeLayer = uiController?.activeLayer || { category: 'mapLayers', index: 0 };
    
    return (
        <div className="sidebar-left">
            {/* Cabeçalho de Abas da Sidebar Esquerda */}
            <div className="sidebar-tabs-header">
                <button 
                    className={`tab-btn ${activeTab === 'maps' ? 'active' : ''}`}
                    onClick={() => setActiveTab('maps')}
                >
                    Mapas
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

                {activeTab === 'layers' && currentMap && (
                    <div className="sidebar-section">
                        <div 
                            className="sidebar-header"
                            onClick={() => setExpandedLayers(!expandedLayers)}
                        >
                            <span>Mapa: {currentMap.name}</span>
                            <span>{expandedLayers ? '▼' : '▶'}</span>
                        </div>

                        {expandedLayers && (
                            <div className="sidebar-content layers-tree">

                                {/* Bucket: Background Layers */}
                                <div className="layer-category-group">
                                    <div className="category-title">Camadas de Fundo</div>
                                    {currentMap.backgroundLayers?.map((layer, index) => (
                                        <div 
                                            key={`bg-${index}`}
                                            className={`layer-item ${activeLayer.category === LayerBucketMap[LayerType.BACKGROUND] && activeLayer.index === index ? 'selected' : ''}`}
                                            onClick={() => uiController?.setActiveLayer(LayerType.BACKGROUND, index)}
                                        >
                                            <span>🌄 {layer.name}</span>
                                            <span className="layer-visibility">{layer.visible ? '👁️' : '🚫'}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Bucket: Map Layers (Tile) */}
                                <div className="layer-category-group">
                                    <div className="category-title">Camadas de Tiles</div>
                                    {currentMap.mapLayers?.map((layer, index) => (
                                        <div 
                                            key={`map-${index}`}
                                            className={`layer-item ${activeLayer.category === LayerBucketMap[LayerType.TILE] && activeLayer.index === index ? 'selected' : ''}`}
                                            onClick={() => uiController?.setActiveLayer(LayerType.TILE, index)}
                                        >
                                            <span>🧱 {layer.name}</span>
                                            <span className="layer-visibility">{layer.visible ? '👁️' : '🚫'}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Bucket: Event Layers */}
                                <div className="layer-category-group">
                                    <div className="category-title">Camadas de Eventos</div>
                                    {currentMap.eventLayers?.map((layer, index) => (
                                        <div 
                                            key={`evt-${index}`}
                                            className={`layer-item ${activeLayer.category === LayerBucketMap[LayerType.EVENT] && activeLayer.index === index ? 'selected' : ''}`}
                                            onClick={() => uiController?.setActiveLayer(LayerType.EVENT, index)}
                                        >
                                            <span>⚡ {layer.name}</span>
                                            <span className="layer-visibility">{layer.visible ? '👁️' : '🚫'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}