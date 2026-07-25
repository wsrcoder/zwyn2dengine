import React, { useState } from 'react';
import { LayerType } from '../../Constants/LayerType.js';
import { LayerBucketMap } from '../../Constants/LayerBucketMap.js';
import './SidebarLeft.css';

export default function SidebarLeft({ projectController, editorController, currentMap, onSelectMap }) {
    const [expandedMaps, setExpandedMaps] = useState(true);
    const [expandedLayers, setExpandedLayers] = useState(true);

    const mapsList = projectController?.mapsList || [];
    const activeLayer = editorController?.activeLayer || { category: 'mapLayers', index: 0 };

    return (
        <div className="sidebar-left">
            {/* --- SEÇÃO 1: MAPAS E CENAS --- */}
            <div className="sidebar-section">
                <div 
                    className="sidebar-header" 
                    onClick={() => setExpandedMaps(!expandedMaps)}
                >
                    <span>📁 Mapas e Cenas</span>
                    <span>{expandedMaps ? '▼' : '▶'}</span>
                </div>

                {console.log("hello world")}
                {console.log(mapsList)}
                {expandedMaps && (
                    
                    <div className="sidebar-content">
                        <button className="sidebar-btn-action" onClick={() => console.log("Criar novo mapa")}>
                            + Novo Mapa
                        </button>
                        
                        <ul className="sidebar-list">
                            {mapsList.map((mapItem, idx) => {
                                // mapItem.name aqui é "Map0001.json" vindo do ProjectController
                                const fileName = mapItem.name || mapItem;
                                const displayName = fileName.replace('.json', ''); // Fica "Map0001" para exibição
                                
                                // Compara o nome limpo do arquivo com a propriedade name do currentMapData em memória
                                const isSelected = currentMap?.name === displayName;

                                return (
                                    <li 
                                        key={idx} 
                                        className={`sidebar-item ${isSelected ? 'active' : ''}`}
                                        onClick={() => {
                                            console.log("[SidebarLeft] Clicou no mapa:", fileName);
                                            if (onMapSelect) {
                                                onMapSelect(fileName); // Envia "Map0001.json" para o load
                                            }
                                        }}
                                    >
                                        🗺️ {displayName}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>

            {/* --- SEÇÃO 2: HIERARQUIA DE CAMADAS (LAYERS) DO MAPA ATUAL --- */}
        
            {currentMap && (
                <div className="sidebar-section">
                    <div 
                        className="sidebar-header"
                        onClick={() => setExpandedLayers(!expandedLayers)}
                    >
                        <span>レイ Camadas do Mapa</span>
                        <span>{expandedLayers ? '▼' : '▶'}</span>
                    </div>

                    {expandedLayers && (
                        <div className="sidebar-content layers-tree">
                            
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
    );
}