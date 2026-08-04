import React, { useRef, useEffect, useState } from 'react';
import TilesetRenderer from '../../../../renderers/TilesetRenderer';
import TilesetInputHandler from '../../../../handlers/TilesetInputHandler';
import { TileToolType } from '../../../../constants/ToolType';
import { EventHandler } from '../../../../core/EventBus';
import { EDITOR_EVENTS } from '../../../../core/EventTypes';
import { TileUtils } from '../../../../utils/TileUtils';
import './TilesetPanel.css';

export default function TilesetPanel({ 
    tilesets = [], 
    activeTileset,
    activeTilesetId, 
    onSelectTileset, 
    projectStore
}) {

    const canvasRef = useRef(null);
    const rendererRef = useRef(null);
    const handlerRef = useRef(null);

    // Estado local para forçar re-render quando a ferramenta mudar via EventBus
    const [currentTool, setCurrentTool] = useState(() => {
        try {
            return projectStore?.getSession()?.tools?.getActiveTool() || TileToolType.BRUSH;
        } catch {
            return TileToolType.BRUSH;
        }
    });

    // Sincroniza a ferramenta ativa usando o EventBus
    useEffect(() => {
        const unsubscribe = EventHandler.subscribe(EDITOR_EVENTS.TOOL_CHANGED, (newTool) => {
            setCurrentTool(newTool);
        });
        return unsubscribe;
    }, []);

    const handleSelectTool = (toolType) => {
        if (!projectStore) return;
        
        try {
            projectStore.getSession().tools.setActiveTool(toolType);
            EventHandler.notify(EDITOR_EVENTS.TOOL_CHANGED, toolType);
        } catch (error) {
            console.error("Erro ao selecionar ferramenta:", error);
        }
    };

    // Instancia o renderer e gerencia o carregamento do tileset / handler de input
    useEffect(() => {
        if (canvasRef.current && !rendererRef.current) {
            rendererRef.current = new TilesetRenderer(canvasRef.current);
        }

        if (!rendererRef.current || !activeTileset?.imagePath) return;

        // Limpa o handler antigo se houver troca de tileset
        if (handlerRef.current) {
            handlerRef.current.destroy();
            handlerRef.current = null;
        }

        rendererRef.current.loadTileset(
            activeTileset.imagePath, 
            activeTileset.tileWidth, 
            activeTileset.tileHeight
        ).then(() => {
            // Desenha o tileset inicialmente sem seleção
            rendererRef.current.render();

            // Inicializa o Handler de Input agora que o canvas tem dimensões e dados reais
            if (canvasRef.current) {
                handlerRef.current = new TilesetInputHandler(canvasRef.current, {
                    tileWidth: activeTileset.tileWidth,
                    tileHeight: activeTileset.tileHeight,
                    tilesetMatrix: rendererRef.current.tilesetMatrix, 

                    onSelectionStart: (data) => {
                        EventHandler.notify(EDITOR_EVENTS.TILE_SELECTION_STARTED, data);
                    },
                    onSelectionChange: (selectionData) => {
                        if (projectStore) {
                            try {
                                const session = projectStore.getSession();
                                const activeWorldId = session.navigation.activeWorldId;
                                const activeSceneId = session.navigation.activeSceneId;

                                // Busca a cena atual no workingScenes
                                const sceneData = session.workingScenes.getScene(activeWorldId, activeSceneId);
                                const mapModel = sceneData ? sceneData.data : null;

                                // Pega o tileset associado à cena (geralmente um array ou mapa de tilesets)
                                // Ajuste se o seu mapModel usa mapTilesets, tilesets ou outro nome
                                const tilesets = mapModel?.tilesets || mapModel?.mapTilesets || [];
            
                                // Pega o primeiro tileset ou o ativo (ex: por índice ou ID)
                                const activeTileset = Array.isArray(tilesets) ? tilesets[0] : tilesets.values?.().next()?.value;
            
                                const tsColumns = activeTileset?.columns || 1;

                                const rect = selectionData.sourceRect;
                                const calculatedTiles = [];

                                if (rect && typeof rect.startX === 'number') {
                                    const minX = Math.min(rect.startX, rect.endX);
                                    const maxX = Math.max(rect.startX, rect.endX);
                                    const minY = Math.min(rect.startY, rect.endY);
                                    const maxY = Math.max(rect.startY, rect.endY);

                                    for (let y = minY; y <= maxY; y++) {
                                        for (let x = minX; x <= maxX; x++) {
                                            const tileId = y * tsColumns + x;
                                            calculatedTiles.push(tileId);
                                        }
                                    }
                                } else {
                                    const rawTiles = selectionData.tiles || [0];
                                    calculatedTiles.push(...(Array.isArray(rawTiles) ? rawTiles.flat() : [rawTiles]));
                                }

                                selectionData.tiles = calculatedTiles;
                                const flattenedTiles = calculatedTiles.flat();

                                session.tools.setTileSelection(
                                    selectionData.width,
                                    selectionData.height,
                                    flattenedTiles,
                                    selectionData.sourceRect
                                );
                            } catch (error) {
                                console.error("Erro ao salvar seleção na store:", error);
                            }
                        }

                        EventHandler.notify(EDITOR_EVENTS.TILE_SELECTION_CHANGED, selectionData);

                        if (rendererRef.current) {
                            rendererRef.current.render(selectionData.sourceRect);
                        }
                    },
                    onSelectionEnd: (data) => {
                        EventHandler.notify(EDITOR_EVENTS.TILE_SELECTION_ENDED, data);
                    }
                });
            }
        }).catch((err) => {
            console.error("Erro ao carregar tileset no painel:", err);
        });

        return () => {
            if (handlerRef.current) {
                handlerRef.current.destroy();
                handlerRef.current = null;
            }
        };
    }, [activeTileset, projectStore]);

    return (
        <div className="sidebar-section tileset-section">
            {/* Toolbar Superior: Seletor e Ações */}
            <div className="section-header tileset-toolbar-top">
                <select 
                    className="tileset-select"
                    value={activeTilesetId || ''}
                    onChange={(e) => onSelectTileset(e.target.value)}
                >
                    {tilesets.length === 0 ? (
                        <option value="">Nenhum Tileset</option>
                    ) : (
                        tilesets.map(ts => (
                            <option key={ts.id} value={ts.id}>{ts.name}</option>
                        ))
                    )}
                </select>

                <div className="tileset-actions">
                    <button className="small-action-btn" title="Adicionar Novo Tileset">➕</button>
                    <button className="small-action-btn danger" title="Remover Tileset Atual" disabled={tilesets.length === 0}>🗑</button>
                </div>
            </div>

            {/* Barra de Ferramentas de Pintura (Modos de Edição) */}
            <div className="painting-toolbar">
                <button 
                    className={`tool-btn ${currentTool === TileToolType.BRUSH ? 'active' : ''}`}
                    onClick={() => handleSelectTool(TileToolType.BRUSH)}
                    title="Pincel (Brush)"
                >
                    🖌️
                </button>
                <button 
                    className={`tool-btn ${currentTool === TileToolType.BUCKET ? 'active' : ''}`}
                    onClick={() => handleSelectTool(TileToolType.BUCKET)}
                    title="Balde de Tinta (Fill)"
                >
                    🪣
                </button>
                <button 
                    className={`tool-btn ${currentTool === TileToolType.ERASER ? 'active' : ''}`}
                    onClick={() => handleSelectTool(TileToolType.ERASER)}
                    title="Borracha (Eraser)"
                >
                    🧹
                </button>
            </div>

            {/* Área de Visualização do Tileset Real */}
            <div className="section-content-tileset">
                {!activeTileset ? (
                    <div className="empty-state">
                        <span className="empty-text">Nenhum tileset carregado</span>
                    </div>
                ) : (
                    <div className="tileset-canvas-viewport">
                        <canvas ref={canvasRef} className="tileset-canvas" />
                    </div>
                )}
            </div>
        </div>
    );
}