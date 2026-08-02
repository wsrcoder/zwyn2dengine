
import React, { useState, useEffect } from 'react';
import { EventHandler } from '../../../../state/EventBus.js';
import { EDITOR_EVENTS } from '../../../../state/EventTypes.js';
import { ProjectParams } from '../../../../constants/ProjectParams.js'; // Ajuste o caminho se necessário
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

    const rootPath = projectStore?.session?.rootPath;
    const sceneState = projectStore?.session?.workingScenes;
    const cacheEntry = sceneState?.getActiveCacheEntry();
    const activeScene = cacheEntry?.data || cacheEntry?.mapDataModel;

    // 1. Extrai as camadas
    const layers = activeScene ? [
        ...(activeScene.backgroundLayers || []).map(l => ({ ...l, type: 'background', typeLabel: 'BG' })),
        ...(activeScene.mapLayers || []).map(l => ({ ...l, type: 'map', typeLabel: 'MAP' })),
        ...(activeScene.eventLayers || []).map(l => ({ ...l, type: 'event', typeLabel: 'EVT' })),
        ...(activeScene.UILayer || []).map(l => ({ ...l, type: 'ui', typeLabel: 'UI' }))
    ] : [];

    // 2. Extrai os tilesets e resolve o caminho físico da imagem
    const tilesets = activeScene?.tilesets ? activeScene.tilesets.map(ts => {
        const fileName = ts.image?.fileName || '';
        // Monta o caminho local estruturado com os Enums
        const imagePath = rootPath ? `${rootPath}/${ProjectParams.DIR.TILESETS}/${fileName}` : '';
        
        return {
            id: ts.name, // ou ID se houver
            name: ts.name,
            imagePath: imagePath,
            tileWidth: ts.tile?.width || 32,
            tileHeight: ts.tile?.height || 32,
            columns: ts.columns,
            rows: ts.rows
        };
    }) : [];

    // Estado local para o tileset selecionado e ferramenta ativa
    const [activeTilesetId, setActiveTilesetId] = useState(null);
    const [activeTool, setActiveTool] = useState('brush');

    // Seleciona o primeiro por padrão se houver e nenhum estiver selecionado
    useEffect(() => {
        if (tilesets.length > 0 && (!activeTilesetId || !tilesets.some(t => t.id === activeTilesetId))) {
            setActiveTilesetId(tilesets[0].id);
        }
    }, [tilesets, activeTilesetId]);

    const activeTileset = tilesets.find(t => t.id === activeTilesetId) || tilesets[0];

    return (
        <div className="scene-panel-container">
            <TilesetPanel 
                tilesets={tilesets}
                activeTileset={activeTileset}
                activeTilesetId={activeTilesetId}
                onSelectTileset={setActiveTilesetId}
                activeTool={activeTool}
                onSelectTool={setActiveTool}
            />
            <LayerPanel activeScene={activeScene} layers={layers} />
        </div>
    );
}