import React, { useState, useEffect } from 'react';
import { EventHandler } from '../../../../state/EventBus.js';
import { EDITOR_EVENTS } from '../../../../state/EventTypes.js';
import './ScenePanel.css';

export default function ScenePanel({ projectController, projectStore }) {
    // Estado local para forçar o re-render quando a cena ativa mudar
    const [, setRenderTrigger] = useState(0);

    useEffect(() => {
        const handleUpdate = () => {
            setRenderTrigger(prev => prev + 1);
        };

        // Escuta eventos que alteram a cena ativa ou o projeto
        const unsubSceneChanged = EventHandler.subscribe(EDITOR_EVENTS.SCENE_CHANGED, handleUpdate);
        const unsubProjectLoaded = EventHandler.subscribe(EDITOR_EVENTS.PROJECT_LOADED, handleUpdate);

        return () => {
            unsubSceneChanged();
            unsubProjectLoaded();
        };
    }, []);

    const sceneState = projectStore?.session?.workingScenes;
    
    // 1. Pega a entrada completa do cache da cena ativa
    const cacheEntry = sceneState?.getActiveCacheEntry();
    
    // 2. O MapDataModel real está dentro de cacheEntry.data
    const activeScene = cacheEntry?.data || cacheEntry?.mapDataModel;

    // 3. Como as camadas são divididas por tipo no seu modelo, você pode juntá-las em um único array para listar:
    const layers = activeScene ? [
        ...(activeScene.backgroundLayers || []),
        ...(activeScene.mapLayers || []),
        ...(activeScene.eventLayers || []),
        ...(activeScene.UILayer || [])
    ] : [];

    return (
        <div className="scene-panel-container">
            {/* Seção Superior: Tileset */}
            <div className="sidebar-section">
                <div className="section-header">
                    <span>TILESET</span>
                </div>
                <div className="section-content-placeholder">
                    <button className="action-btn">+ Carregar Tileset</button>
                    <span className="empty-text">Nenhum tileset carregado</span>
                </div>
            </div>

            {/* Seção Inferior: Camadas (Layers) da Cena Ativa */}
            <div className="sidebar-section">
                <div className="section-header">
                    <span>CAMADAS {activeScene ? `(${activeScene.name})` : ''}</span>
                    <button className="small-action-btn" title="Nova Camada">+ Nova</button>
                </div>
                
                <div className="section-content-layers">
                    {layers.length === 0 ? (
                        <span className="empty-text">
                            {activeScene ? 'Nenhuma camada nesta cena' : 'Nenhuma cena ativa'}
                        </span>
                    ) : (
                        <ul className="layers-list">
                            {layers.map((layer, index) => (
                                <li key={layer.id || index} className={`layer-item ${layer.active ? 'active' : ''}`}>
                                    {/* Arrastar */}
                                    <span className="drag-handle" title="Reordenar">⠿</span>
            
                                    {/* Visibilidade */}
                                    <button className="icon-btn" title="Alternar Visibilidade">👁</button>
            
                                        {/* Nome */}
                                        <span className="layer-name">{layer.name || `Camada ${index + 1}`}</span>
            
                                        {/* Ações rápidas à direita */}
                                    <div className="layer-actions">
                                        <button className="icon-btn" title="Bloquear">🔓</button>
                                    </div>
                                </li>
                             ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}