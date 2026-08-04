
import { useEffect, useRef } from 'react';
import SceneRenderer from '../../../../renderers/SceneRenderer';
import SceneInputHandler from '../../../../handlers/SceneInputHandler';
import { EventHandler } from '../../../../core/EventBus';
import { EDITOR_EVENTS } from '../../../../core/EventTypes';

export default function SceneEditor({ projectStore }) {
    const canvasRef = useRef(null);
    const rendererRef = useRef(null);
    const inputHandlerRef = useRef(null);

    useEffect(() => {
        const session = projectStore ? projectStore.getSession() : null;
        const tilesetCache = session ? session.tilesetCache : null;

        // 1. Inicializa o SceneRenderer passando o canvas e o tilesetCache
        if (canvasRef.current && !rendererRef.current) {
            rendererRef.current = new SceneRenderer(canvasRef.current, tilesetCache);
        }

        // Função helper para buscar, popular o cache e renderizar a cena ativa
        const updateSceneToRender = async () => {
            if (!projectStore || !rendererRef.current) return;

            const currentSession = projectStore.getSession();
            if (!currentSession) return;

            const activeWorldId = currentSession.navigation.activeWorldId;
            const activeSceneId = currentSession.navigation.activeSceneId;

            console.log("🔍 [SceneEditor] Buscando cena ativa - WorldId:", activeWorldId, "SceneId:", activeSceneId);

            const sceneData = currentSession.workingScenes.getScene(activeWorldId, activeSceneId);
            console.log("📦 [SceneEditor] SceneData recuperado do cache:", sceneData);

            const currentScene = sceneData ? sceneData.data : null;
            console.log("🗺️ [SceneEditor] MapDataModel (currentScene):", currentScene);

            if (currentScene) {
                // Garante que todos os tilesets desta cena estão no cache antes de desenhar
                if (currentScene.tilesets && Array.isArray(currentScene.tilesets) && currentSession.tilesetCache) {
                    for (const t of currentScene.tilesets) {
                        const tilesetId = t.name;
                        if (tilesetId && !currentSession.tilesetCache.hasTileset(tilesetId)) {
                            await currentSession.tilesetCache.getOrLoadTileset(tilesetId, t, currentSession.rootPath);
                        }
                    }
                }

                rendererRef.current.setScene(currentScene);
                rendererRef.current.render();
            } else {
                console.warn("⚠️ [SceneEditor] Nenhuma cena encontrada para renderizar!");
            }
        };

        updateSceneToRender();

        // 2. Inicializa o SceneInputHandler
        if (canvasRef.current && !inputHandlerRef.current) {
            inputHandlerRef.current = new SceneInputHandler(canvasRef.current, {
                tileSize: 32,
                
                onPaint: (tileX, tileY, selection) => {
                    console.log("🎨 [SceneEditor] Pintando em:", { tileX, tileY }, "com seleção:", selection);

                    const activeSession = projectStore.getSession();
                    if (!activeSession) return;

                    const activeWorldId = activeSession.navigation.activeWorldId;
                    const activeSceneId = activeSession.navigation.activeSceneId;
    
                    const sceneData = activeSession.workingScenes.getScene(activeWorldId, activeSceneId);
                    if (!sceneData || !sceneData.data) return;

                    const mapModel = sceneData.data;
                    const activeIndex = mapModel.activeLayerIndex ?? 0;
                    const layer = mapModel.tileLayers?.[activeIndex];

                    if (!layer) return;

                    const cols = layer.columns;
                    const rows = layer.rows;

                    const selWidth = selection.width || 1;
                    const selHeight = selection.height || 1;
                    const rawTiles = selection.tiles || [0];
                    const selTiles = Array.isArray(rawTiles) ? rawTiles.flat() : [rawTiles];

                    let hasChanged = false;

                    // Itera sobre a área da pintura
                    for (let sy = 0; sy < selHeight; sy++) {
                        for (let sx = 0; sx < selWidth; sx++) {
                            const targetX = tileX + sx;
                            const targetY = tileY + sy;

                            if (targetX >= 0 && targetX < cols && targetY >= 0 && targetY < rows) {
                                const targetIndex = targetY * cols + targetX;
                                const tileIndexInSelection = sy * selWidth + sx;
                                const newTileId = selTiles[tileIndexInSelection] ?? 0;

                                if (layer.data[targetIndex] !== newTileId) {
                                    layer.data[targetIndex] = newTileId;
                                    hasChanged = true;
                                }
                            }
                        }
                    }

                    if (hasChanged) {
                        // 1. Marca imediatamente a cena como modificada na session
                        activeSession.workingScenes.markAsModified(activeWorldId, activeSceneId);

                        // 2. Dispara o evento de cena modificada para atualizar a UI geral
                        EventHandler.notify(EDITOR_EVENTS.SCENE_MODIFIED, { worldId: activeWorldId, sceneId: activeSceneId });

                        // 3. Carrega tilesets se necessário e força a renderização imediata na tela
                        if (rendererRef.current && activeSession.tilesetCache) {
                            (async () => {
                                if (mapModel.tilesets && Array.isArray(mapModel.tilesets)) {
                                    for (const t of mapModel.tilesets) {
                                        const tilesetId = t.name;
                                        if (tilesetId && !activeSession.tilesetCache.hasTileset(tilesetId)) {
                                            await activeSession.tilesetCache.getOrLoadTileset(tilesetId, t, activeSession.rootPath);
                                        }
                                    }
                                }

                                rendererRef.current.setScene(mapModel);
                                rendererRef.current.render();
                            })();
                        }
                    }
                },

                getToolState: () => {
                    const tools = projectStore.getToolState();
                    if (!tools) return null;

                    const activeCategory = tools.activeCategory || 'tile';
                    const categoryState = tools[activeCategory];

                    return {
                        getActiveTool: () => categoryState?.activeTool || null,
                        getTileSelection: () => {
                            const selection = categoryState?.selection;
                            return selection || { width: 1, height: 1, tiles: [1] };
                        }
                    };
                },

                getActiveLayer: () => {
                    const activeSession = projectStore.getSession();
                    if (!activeSession) return null;

                    const activeWorldId = activeSession.navigation.activeWorldId;
                    const activeSceneId = activeSession.navigation.activeSceneId;
                    const sceneData = activeSession.workingScenes.getScene(activeWorldId, activeSceneId);
                    
                    if (!sceneData || !sceneData.data) return null;
                    
                    const _scene = sceneData.data;
                    const activeIndex = _scene.activeLayerIndex ?? 0;
                    const layer = _scene.tileLayers && _scene.tileLayers.length > 0 
                        ? _scene.tileLayers[activeIndex] 
                        : null;

                    return layer;
                }
            });
        }

        // Escuta os eventos globais
        const unsubscribeProjectLoaded = EventHandler.subscribe(EDITOR_EVENTS.PROJECT_LOADED, () => {
            updateSceneToRender();
        });

        const unsubscribeSceneChanged = EventHandler.subscribe(EDITOR_EVENTS.SCENE_CHANGED, () => {
            updateSceneToRender();
        });

        const unsubscribeModified = EventHandler.subscribe(EDITOR_EVENTS.SCENE_MODIFIED, () => {
            updateSceneToRender();
        });

        return () => {
            unsubscribeProjectLoaded();
            unsubscribeSceneChanged();
            unsubscribeModified();
            
            if (inputHandlerRef.current) {
                inputHandlerRef.current.destroy();
                inputHandlerRef.current = null;
            }
            if (rendererRef.current) {
                // Caso tenha método destroy na sua classe renderer, é chamado aqui
                if (typeof rendererRef.current.destroy === 'function') {
                    rendererRef.current.destroy();
                }
                rendererRef.current = null;
            }
        };
    }, [projectStore]);

    return (
        <div className="scene-editor-container" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <canvas 
                ref={canvasRef} 
                style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair' }} 
            />
        </div>
    );
}