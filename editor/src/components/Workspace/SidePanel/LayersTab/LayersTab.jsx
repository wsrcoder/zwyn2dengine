import React, { useState, useEffect } from 'react';
import { LayerType } from '../../../../constants/LayerType.js';
import { LayerBucketMap } from '../../../../constants/LayerBucketMap.js';
import './LayersTab.css';

export default function LayersTab({ projectController, uiController }) {
    const [expandedLayers, setExpandedLayers] = useState(true);
    const [expandedTilesets, setExpandedTilesets] = useState(true);
    const [, setRenderTrigger] = useState(0); // Gatilho para atualizar a UI

    useEffect(() => {
        if (!uiController) return;

        const handleRefresh = () => {
            setRenderTrigger(prev => prev + 1);
        };

        const unsubProject = uiController.subscribe('projectLoaded', handleRefresh);
        const unsubMapChanged = uiController.subscribe('mapChanged', handleRefresh);
        const unsubLayerChanged = uiController.subscribe('activeLayerChanged', handleRefresh);

        return () => {
            unsubProject();
            unsubMapChanged();
            unsubLayerChanged();
        };
    }, [uiController]);

    const currentMap = projectController?.getCurrentMap ? projectController.getCurrentMap() : null;
    const activeLayer = uiController?.activeLayer || { category: 'mapLayers', index: 0 };

    if (!currentMap) {
        return (
            <div className="painting-panel-empty">
                <span>Nenhum mapa selecionado.</span>
            </div>
        );
    }

    return (
        <div className="painting-panel">
            {/* SEÇÃO 1: CAMADAS (Em cima) */}
            <div className="sidebar-section">
                <div 
                    className="sidebar-header"
                    onClick={() => setExpandedLayers(!expandedLayers)}
                >
                    <span>📑 Camadas</span>
                    <span>{expandedLayers ? '▼' : '▶'}</span>
                </div>

                {expandedLayers && (
                    <div className="sidebar-content layers-tree">
                        {/* Bucket: Background Layers */}
                        <div className="layer-category-group">
                            <div className="category-title">Fundo (Background)</div>
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
                            <div className="category-title">Tiles</div>
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
                            <div className="category-title">Eventos</div>
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

            {/* SEÇÃO 2: TILESETS (Em baixo) */}
            <div className="sidebar-section">
                <div 
                    className="sidebar-header"
                    onClick={() => setExpandedTilesets(!expandedTilesets)}
                >
                    <span>🎨 Tilesets</span>
                    <span>{expandedTilesets ? '▼' : '▶'}</span>
                </div>

                {expandedTilesets && (
                    <div className="sidebar-content tileset-container">
                        <div className="tileset-placeholder">
                            <p>Selecione um Tileset</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}