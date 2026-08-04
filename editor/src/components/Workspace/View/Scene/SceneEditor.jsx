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
        // 1. Inicializa o SceneRenderer
        if (canvasRef.current && !rendererRef.current) {
            rendererRef.current = new SceneRenderer(canvasRef.current);
        }

        // Função helper para buscar e inspecionar a cena ativa
        const updateSceneToRender = () => {
            if (!projectStore || !rendererRef.current) return;

            const session = projectStore.getSession();
            const activeWorldId = session.navigation.activeWorldId;
            const activeSceneId = session.navigation.activeSceneId;

            console.log("🔍 [SceneEditor] Buscando cena ativa - WorldId:", activeWorldId, "SceneId:", activeSceneId);

            const sceneData = session.workingScenes.getScene(activeWorldId, activeSceneId);
            console.log("📦 [SceneEditor] SceneData recuperado do cache:", sceneData);

            const currentScene = sceneData ? sceneData.data : null;
            console.log("🗺️ [SceneEditor] MapDataModel (currentScene):", currentScene);

            if (currentScene) {
                rendererRef.current.setScene(currentScene);
            } else {
                console.warn("⚠️ [SceneEditor] Nenhuma cena encontrada para renderizar!");
            }
        };

        updateSceneToRender();

        // 2. Inicializa o SceneInputHandler com logs no getActiveLayer
        if (canvasRef.current && !inputHandlerRef.current) {
            inputHandlerRef.current = new SceneInputHandler(canvasRef.current, {
                tileSize: 32,
                
                onPaint: (tileX, tileY, selection) => {
                    console.log("🎨 [SceneEditor] Pintando em:", { tileX, tileY }, "com seleção:", selection);

                    const session = projectStore.getSession();
                    const activeWorldId = session.navigation.activeWorldId;
                    const activeSceneId = session.navigation.activeSceneId;
    
                    const sceneData = session.workingScenes.getScene(activeWorldId, activeSceneId);
                    
                    if (!sceneData || !sceneData.data) return;

                    const mapModel = sceneData.data;
                    const activeIndex = mapModel.activeLayerIndex ?? 0;
                    const layer = mapModel.tileLayers?.[activeIndex];

                    if (!layer) return;

                    // Dimensões da camada
                    const cols = layer.columns;
                    const rows = layer.rows;

                    // Selection possui: { width, height, tiles: [...] }
                    const selWidth = selection.width || 1;
                    const selHeight = selection.height || 1;
                    
                    // Garante que o array de tiles seja plano
                    const rawTiles = selection.tiles || [0];
                    const selTiles = Array.isArray(rawTiles) ? rawTiles.flat() : [rawTiles];

                    let hasChanged = false;

                    // Itera sobre a área do pincel/seleção
                    for (let sy = 0; sy < selHeight; sy++) {
                        for (let sx = 0; sx < selWidth; sx++) {
                            const targetX = tileX + sx;
                            const targetY = tileY + sy;

                            // Valida se está dentro dos limites da camada
                            if (targetX >= 0 && targetX < cols && targetY >= 0 && targetY < rows) {
                                const targetIndex = targetY * cols + targetX;
                
                                // Pega o tile correspondente na matriz da seleção
                                const tileIndexInSelection = sy * selWidth + sx;
                                const newTileId = selTiles[tileIndexInSelection] ?? 0;

                                // Só altera se o valor for diferente
                                if (layer.data[targetIndex] !== newTileId) {
                                    layer.data[targetIndex] = newTileId;
                                    hasChanged = true;
                                }
                            }
                        }
                    }

                    if (hasChanged) {
                        // 1. Marca a cena como modificada
                        session.workingScenes.markAsModified(activeWorldId, activeSceneId);

                        // 2. Dispara o evento de cena modificada para atualizar a UI
                        EventHandler.notify(EDITOR_EVENTS.SCENE_MODIFIED, { worldId: activeWorldId, sceneId: activeSceneId });

                        // 3. Força o renderizador a desenhar o mapa atualizado novamente
                        if (rendererRef.current) {
                            rendererRef.current.setScene(mapModel);
                            rendererRef.current.setTileset(mapModel.tilesets[0]); //nota: buscar pelo tileset atual
                            rendererRef.current.render();
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
                            
                            // Se a seleção existe mas os tiles estão zerados ou vazios, 
                            // podemos corrigir usando o TileUtils ou garantindo um fallback funcional
                            if (selection && (!selection.tiles || selection.tiles.every(t => t === 0))) {
                                console.warn("⚠️ [SceneEditor] Seleção de tiles veio com IDs zerados. Verifique se o TilesetInputHandler está populando o array com TileUtils.calculateSelection.");
                            }

                            return selection || { width: 1, height: 1, tiles: [1] };
                        }
                    };
                },

                getActiveLayer: () => {
                    const session = projectStore.getSession();
                    const activeWorldId = session.navigation.activeWorldId;
                    const activeSceneId = session.navigation.activeSceneId;
                    const sceneData = session.workingScenes.getScene(activeWorldId, activeSceneId);
                    
                    if (!sceneData || !sceneData.data) {
                        console.warn("⚠️ [SceneEditor] getActiveLayer: SceneData ou data vazios!");
                        return null;
                    }
                    
                    const _scene = sceneData.data;
                    const activeIndex = _scene.activeLayerIndex ?? 0;
                    const layer = _scene.tileLayers && _scene.tileLayers.length > 0 
                        ? _scene.tileLayers[activeIndex] 
                        : null;

                    console.log("📑 [SceneEditor] Camada ativa encontrada:", layer);
                    return layer;
                }
            });
        }

        // Escuta os eventos globais para atualizar a cena
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
                rendererRef.current.destroy();
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