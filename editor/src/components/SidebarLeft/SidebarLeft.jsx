import React, { useState } from 'react';
import MapsTab from './MapsTab';
import { LayerType } from '../../Constants/LayerType.js';
import { LayerBucketMap } from '../../Constants/LayerBucketMap.js';
import './SidebarLeft.css';

export default function SidebarLeft({ 
    projectController, 
    editorController, 
    onSelectMap,
    activeTab,
    setActiveTab 
}) {
    const [expandedLayers, setExpandedLayers] = useState(true);
    const activeLayer = editorController?.activeLayer || { category: 'mapLayers', index: 0 };
    
    // Pega o mapa atual diretamente do cache via editorController
    const currentMap = editorController ? editorController.getCurrentMap() : null;

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
                    <MapsTab 
                        projectController={projectController} 
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
                                            onClick={() => editorController?.setActiveLayer(LayerType.BACKGROUND, index)}
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
                                            onClick={() => editorController?.setActiveLayer(LayerType.TILE, index)}
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
                                            onClick={() => editorController?.setActiveLayer(LayerType.EVENT, index)}
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