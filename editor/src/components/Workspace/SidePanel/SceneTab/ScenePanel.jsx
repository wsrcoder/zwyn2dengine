
import React, { useState, useEffect } from 'react';
import { EventHandler } from '../../../../state/EventBus.js';
import { EDITOR_EVENTS } from '../../../../state/EventTypes.js';
import LayerPanel from './LayerPanel.jsx';
import TilesetPanel from './TilesetPanel.jsx';
import './ScenePanel.css';

export default function ScenePanel({ projectController, projectStore }) {
    const [, setRenderTrigger] = useState(0);

    useEffect(() => {
        const handleUpdate = () => {
            setRenderTrigger(prev => prev + 1);
        };

        const unsubSceneChanged = EventHandler.subscribe(EDITOR_EVENTS.SCENE_CHANGED, handleUpdate);
        const unsubProjectLoaded = EventHandler.subscribe(EDITOR_EVENTS.PROJECT_LOADED, handleUpdate);

        return () => {
            unsubSceneChanged();
            unsubProjectLoaded();
        };
    }, []);

    // Extrai a cena ativa do SceneState
    const sceneState = projectStore?.session?.workingScenes;
    const cacheEntry = sceneState?.getActiveCacheEntry();
    const activeScene = cacheEntry?.data || cacheEntry?.mapDataModel;

    // Junta as camadas usando o spread operator
    const layers = activeScene ? [
        ...(activeScene.backgroundLayers || []),
        ...(activeScene.mapLayers || []),
        ...(activeScene.eventLayers || []),
        ...(activeScene.UILayer || [])
    ] : [];

    return (
        <div className="scene-panel-container">
            <TilesetPanel />
            <LayerPanel activeScene={activeScene} layers={layers} />
        </div>
    );
}